package state

import (
	"context"
	"fmt"
	"net/url"
	"time"

	"github.com/benbjohnson/clock"
	"github.com/grafana/grafana-plugin-sdk-go/data"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/ngalert/eval"
	"github.com/grafana/grafana/pkg/services/ngalert/image"
	"github.com/grafana/grafana/pkg/services/ngalert/metrics"
	ngModels "github.com/grafana/grafana/pkg/services/ngalert/models"
)

var ResendDelay = 30 * time.Second

// AlertInstanceManager defines the interface for querying the current alert instances.
type AlertInstanceManager interface {
	GetAll(orgID int64) []*State
	GetStatesForRuleUID(orgID int64, alertRuleUID string) []*State
}

type Manager struct {
	log     log.Logger
	metrics *metrics.State

	clock       clock.Clock
	cache       *cache
	quit        chan struct{}
	ResendDelay time.Duration

	ruleStore     RuleReader
	instanceStore InstanceStore
	imageService  image.ImageService
	historian     Historian
	externalURL   *url.URL
}

func NewManager(metrics *metrics.State, externalURL *url.URL,
	ruleStore RuleReader, instanceStore InstanceStore, imageService image.ImageService, clock clock.Clock, historian Historian) *Manager {
	manager := &Manager{
		cache:         newCache(),
		quit:          make(chan struct{}),
		ResendDelay:   ResendDelay, // TODO: make this configurable
		log:           log.New("ngalert.state.manager"),
		metrics:       metrics,
		ruleStore:     ruleStore,
		instanceStore: instanceStore,
		imageService:  imageService,
		historian:     historian,
		clock:         clock,
		externalURL:   externalURL,
	}
	if manager.metrics != nil {
		go manager.recordMetrics()
	}
	return manager
}

func (st *Manager) Close() {
	st.quit <- struct{}{}
}

func (st *Manager) Warm(ctx context.Context) {
	if st.instanceStore == nil {
		st.log.Info("Skip warming the state because instance store is not configured")
	}
	if st.ruleStore == nil {
		st.log.Info("Skip warming the state because rule store is not configured")
	}
	startTime := time.Now()
	st.log.Info("Warming state cache for startup")

	orgIds, err := st.instanceStore.FetchOrgIds(ctx)
	if err != nil {
		st.log.Error("Unable to fetch orgIds", "error", err)
	}

	statesCount := 0
	states := make(map[int64]map[string]*ruleStates, len(orgIds))
	for _, orgId := range orgIds {
		// Get Rules
		ruleCmd := ngModels.ListAlertRulesQuery{
			OrgID: orgId,
		}
		if err := st.ruleStore.ListAlertRules(ctx, &ruleCmd); err != nil {
			st.log.Error("Unable to fetch previous state", "error", err)
		}

		ruleByUID := make(map[string]*ngModels.AlertRule, len(ruleCmd.Result))
		for _, rule := range ruleCmd.Result {
			ruleByUID[rule.UID] = rule
		}

		orgStates := make(map[string]*ruleStates, len(ruleByUID))
		states[orgId] = orgStates

		// Get Instances
		cmd := ngModels.ListAlertInstancesQuery{
			RuleOrgID: orgId,
		}
		if err := st.instanceStore.ListAlertInstances(ctx, &cmd); err != nil {
			st.log.Error("Unable to fetch previous state", "error", err)
		}

		for _, entry := range cmd.Result {
			ruleForEntry, ok := ruleByUID[entry.RuleUID]
			if !ok {
				// TODO Should we delete the orphaned state from the db?
				continue
			}

			rulesStates, ok := orgStates[entry.RuleUID]
			if !ok {
				rulesStates = &ruleStates{states: make(map[string]*State)}
				orgStates[entry.RuleUID] = rulesStates
			}

			lbs := map[string]string(entry.Labels)
			cacheID, err := entry.Labels.StringKey()
			if err != nil {
				st.log.Error("Error getting cacheId for entry", "error", err)
			}
			rulesStates.states[cacheID] = &State{
				AlertRuleUID:         entry.RuleUID,
				OrgID:                entry.RuleOrgID,
				CacheID:              cacheID,
				Labels:               lbs,
				State:                translateInstanceState(entry.CurrentState),
				StateReason:          entry.CurrentReason,
				LastEvaluationString: "",
				StartsAt:             entry.CurrentStateSince,
				EndsAt:               entry.CurrentStateEnd,
				LastEvaluationTime:   entry.LastEvalTime,
				Annotations:          ruleForEntry.Annotations,
			}
			statesCount++
		}
	}
	st.cache.setAllStates(states)
	st.log.Info("State cache has been initialized", "states", statesCount, "duration", time.Since(startTime))
}

func (st *Manager) Get(orgID int64, alertRuleUID, stateId string) *State {
	return st.cache.get(orgID, alertRuleUID, stateId)
}

// ResetStateByRuleUID deletes all entries in the state manager that match the given rule UID.
func (st *Manager) ResetStateByRuleUID(ctx context.Context, ruleKey ngModels.AlertRuleKey) []*State {
	logger := st.log.New(ruleKey.LogContext()...)
	logger.Debug("Resetting state of the rule")
	states := st.cache.removeByRuleUID(ruleKey.OrgID, ruleKey.UID)
	if len(states) > 0 && st.instanceStore != nil {
		err := st.instanceStore.DeleteAlertInstancesByRule(ctx, ruleKey)
		if err != nil {
			logger.Error("Failed to delete states that belong to a rule from database", "error", err)
		}
	}
	logger.Info("Rules state was reset", "states", len(states))
	return states
}

// ProcessEvalResults updates the current states that belong to a rule with the evaluation results.
// if extraLabels is not empty, those labels will be added to every state. The extraLabels take precedence over rule labels and result labels
func (st *Manager) ProcessEvalResults(ctx context.Context, evaluatedAt time.Time, alertRule *ngModels.AlertRule, results eval.Results, extraLabels data.Labels) []*State {
	logger := st.log.FromContext(ctx)
	logger.Debug("State manager processing evaluation results", "resultCount", len(results))
	var states []*State
	processedResults := make(map[string]*State, len(results))
	for _, result := range results {
		s := st.setNextState(ctx, alertRule, result, extraLabels, logger)
		states = append(states, s)
		processedResults[s.CacheID] = s
	}
	resolvedStates := st.staleResultsHandler(ctx, logger, alertRule, processedResults, evaluatedAt)
	if len(states) > 0 && st.instanceStore != nil {
		logger.Debug("Saving new states to the database", "count", len(states))
		_, _ = st.saveAlertStates(ctx, states...)
	}
	return append(states, resolvedStates...)
}

// Set the current state based on evaluation results
func (st *Manager) setNextState(ctx context.Context, alertRule *ngModels.AlertRule, result eval.Result, extraLabels data.Labels, logger log.Logger) *State {
	currentState := st.cache.getOrCreate(ctx, st.log, alertRule, result, extraLabels, st.externalURL)

	currentState.LastEvaluationTime = result.EvaluatedAt
	currentState.EvaluationDuration = result.EvaluationDuration
	currentState.Results = append(currentState.Results, Evaluation{
		EvaluationTime:  result.EvaluatedAt,
		EvaluationState: result.State,
		Values:          NewEvaluationValues(result.Values),
		Condition:       alertRule.Condition,
	})
	currentState.LastEvaluationString = result.EvaluationString
	currentState.TrimResults(alertRule)
	oldState := currentState.State
	oldReason := currentState.StateReason

	logger.Debug("Setting alert state")
	switch result.State {
	case eval.Normal:
		currentState.resultNormal(alertRule, result)
	case eval.Alerting:
		currentState.resultAlerting(alertRule, result)
	case eval.Error:
		currentState.resultError(alertRule, result)
	case eval.NoData:
		currentState.resultNoData(alertRule, result)
	case eval.Pending: // we do not emit results with this state
	}

	// Set reason iff: result is different than state, reason is not Alerting or Normal
	currentState.StateReason = ""

	if currentState.State != result.State &&
		result.State != eval.Normal &&
		result.State != eval.Alerting {
		currentState.StateReason = result.State.String()
	}

	// Set Resolved property so the scheduler knows to send a postable alert
	// to Alertmanager.
	currentState.Resolved = oldState == eval.Alerting && currentState.State == eval.Normal

	if shouldTakeImage(currentState.State, oldState, currentState.Image, currentState.Resolved) {
		image, err := takeImage(ctx, st.imageService, alertRule)
		if err != nil {
			logger.Warn("Failed to take an image",
				"dashboard", alertRule.DashboardUID,
				"panel", alertRule.PanelID,
				"error", err)
		} else if image != nil {
			currentState.Image = image
		}
	}

	st.cache.set(currentState)

	shouldUpdateAnnotation := oldState != currentState.State || oldReason != currentState.StateReason
	if shouldUpdateAnnotation && st.historian != nil {
		go st.historian.RecordState(ctx, alertRule, currentState.Labels, result.EvaluatedAt, InstanceStateAndReason{State: currentState.State, Reason: currentState.StateReason}, InstanceStateAndReason{State: oldState, Reason: oldReason})
	}
	return currentState
}

func (st *Manager) GetAll(orgID int64) []*State {
	return st.cache.getAll(orgID)
}

func (st *Manager) GetStatesForRuleUID(orgID int64, alertRuleUID string) []*State {
	return st.cache.getStatesForRuleUID(orgID, alertRuleUID)
}

func (st *Manager) recordMetrics() {
	// TODO: parameterize?
	// Setting to a reasonable default scrape interval for Prometheus.
	dur := time.Duration(15) * time.Second
	ticker := st.clock.Ticker(dur)
	for {
		select {
		case <-ticker.C:
			st.log.Debug("Recording state cache metrics", "now", st.clock.Now())
			st.cache.recordMetrics(st.metrics)
		case <-st.quit:
			st.log.Debug("Stopping state cache metrics recording", "now", st.clock.Now())
			ticker.Stop()
			return
		}
	}
}

func (st *Manager) Put(states []*State) {
	for _, s := range states {
		st.cache.set(s)
	}
}

// TODO: Is the `State` type necessary? Should it embed the instance?
func (st *Manager) saveAlertStates(ctx context.Context, states ...*State) (saved, failed int) {
	if st.instanceStore == nil {
		return 0, 0
	}

	st.log.Debug("Saving alert states", "count", len(states))
	instances := make([]ngModels.AlertInstance, 0, len(states))

	type debugInfo struct {
		OrgID  int64
		Uid    string
		State  string
		Labels string
	}
	debug := make([]debugInfo, 0)

	for _, s := range states {
		labels := ngModels.InstanceLabels(s.Labels)
		_, hash, err := labels.StringAndHash()
		if err != nil {
			debug = append(debug, debugInfo{s.OrgID, s.AlertRuleUID, s.State.String(), s.Labels.String()})
			st.log.Error("Failed to save alert instance with invalid labels", "orgID", s.OrgID, "rule", s.AlertRuleUID, "error", err)
			continue
		}
		fields := ngModels.AlertInstance{
			AlertInstanceKey: ngModels.AlertInstanceKey{
				RuleOrgID:  s.OrgID,
				RuleUID:    s.AlertRuleUID,
				LabelsHash: hash,
			},
			Labels:            ngModels.InstanceLabels(s.Labels),
			CurrentState:      ngModels.InstanceStateType(s.State.String()),
			CurrentReason:     s.StateReason,
			LastEvalTime:      s.LastEvaluationTime,
			CurrentStateSince: s.StartsAt,
			CurrentStateEnd:   s.EndsAt,
		}
		instances = append(instances, fields)
	}

	if err := st.instanceStore.SaveAlertInstances(ctx, instances...); err != nil {
		for _, inst := range instances {
			debug = append(debug, debugInfo{inst.RuleOrgID, inst.RuleUID, string(inst.CurrentState), data.Labels(inst.Labels).String()})
		}
		st.log.Error("Failed to save alert states", "states", debug, "error", err)
		return 0, len(debug)
	}

	return len(instances), len(debug)
}

// TODO: why wouldn't you allow other types like NoData or Error?
func translateInstanceState(state ngModels.InstanceStateType) eval.State {
	switch {
	case state == ngModels.InstanceStateFiring:
		return eval.Alerting
	case state == ngModels.InstanceStateNormal:
		return eval.Normal
	default:
		return eval.Error
	}
}

// This struct provides grouping of state with reason, and string formatting.
type InstanceStateAndReason struct {
	State  eval.State
	Reason string
}

func (i InstanceStateAndReason) String() string {
	s := fmt.Sprintf("%v", i.State)
	if len(i.Reason) > 0 {
		s += fmt.Sprintf(" (%v)", i.Reason)
	}
	return s
}

func (st *Manager) staleResultsHandler(ctx context.Context, logger log.Logger, r *ngModels.AlertRule,
	states map[string]*State, evaluatedAt time.Time) []*State {
	var (
		// TODO: We will need to change this when we support images without screenshots as each state will have a different image
		resolvedImage  *ngModels.Image
		resolvedStates []*State

		// candidates contains the alert states that must be checked for staleness
		candidates []*State

		// toDelete contains the stale alert instances to delete
		toDelete []ngModels.AlertInstanceKey
	)

	candidates = st.GetStatesForRuleUID(r.OrgID, r.UID)
	for _, s := range candidates {
		// If the candidate state is absent from most recent evaluation and stale then remove it
		if _, ok := states[s.CacheID]; !ok && stateIsStale(evaluatedAt, s.LastEvaluationTime, r.IntervalSeconds) {
			logger.Info("Removing stale state from cache",
				"cacheID", s.CacheID, "state", s.State, "reason", s.StateReason)
			st.cache.deleteEntry(s.OrgID, s.AlertRuleUID, s.CacheID)

			// add the state to the list of stale alert instances
			labels := ngModels.InstanceLabels(s.Labels)
			if _, labelsHash, err := labels.StringAndHash(); err != nil {
				logger.Error("Unable to get labelsHash", "rule", s.AlertRuleUID, "err", err)
			} else {
				toDelete = append(toDelete, ngModels.AlertInstanceKey{
					RuleOrgID:  s.OrgID,
					RuleUID:    s.AlertRuleUID,
					LabelsHash: labelsHash,
				})
			}

			// If the stale state is alerting then it should first be resolved
			if s.State == eval.Alerting {
				previousState := InstanceStateAndReason{State: s.State, Reason: s.StateReason}
				s.Resolve(ngModels.StateReasonMissingSeries, evaluatedAt)

				if st.historian != nil {
					st.historian.RecordState(ctx, r, s.Labels, evaluatedAt,
						InstanceStateAndReason{State: eval.Normal, Reason: s.StateReason},
						previousState,
					)
				}

				// If there is no resolved image for this rule then take one
				if resolvedImage == nil {
					image, err := takeImage(ctx, st.imageService, r)
					if err != nil {
						logger.Warn("Failed to take an image",
							"dashboard", r.DashboardUID,
							"panel", r.PanelID,
							"error", err)
					} else if image != nil {
						resolvedImage = image
					}
				}
				s.Image = resolvedImage
				resolvedStates = append(resolvedStates, s)
			}
		}
	}

	if st.instanceStore != nil {
		if err := st.instanceStore.DeleteAlertInstances(ctx, toDelete...); err != nil {
			logger.Error("Unable to delete stale instances from database", "error", err, "count", len(toDelete))
		}
	}

	return resolvedStates
}

func stateIsStale(evaluatedAt time.Time, lastEval time.Time, intervalSeconds int64) bool {
	return !lastEval.Add(2 * time.Duration(intervalSeconds) * time.Second).After(evaluatedAt)
}
