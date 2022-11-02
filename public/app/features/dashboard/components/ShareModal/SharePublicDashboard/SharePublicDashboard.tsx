import { css } from '@emotion/css';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import { GrafanaTheme2 } from '@grafana/data/src';
import { selectors as e2eSelectors } from '@grafana/e2e-selectors/src';
import { reportInteraction } from '@grafana/runtime/src';
import {
  Alert,
  Button,
  ClipboardButton,
  Field,
  HorizontalGroup,
  Input,
  useStyles2,
  Spinner,
  ModalsContext,
} from '@grafana/ui/src';
import { contextSrv } from 'app/core/services/context_srv';
import { useGetConfigQuery, useSaveConfigMutation } from 'app/features/dashboard/api/publicDashboardApi';
import { AcknowledgeCheckboxes } from 'app/features/dashboard/components/ShareModal/SharePublicDashboard/AcknowledgeCheckboxes';
import { Configuration } from 'app/features/dashboard/components/ShareModal/SharePublicDashboard/Configuration';
import { Description } from 'app/features/dashboard/components/ShareModal/SharePublicDashboard/Description';
import {
  Acknowledgements,
  dashboardHasTemplateVariables,
  generatePublicDashboardUrl,
  publicDashboardPersisted,
} from 'app/features/dashboard/components/ShareModal/SharePublicDashboard/SharePublicDashboardUtils';
import { ShareModalTabProps } from 'app/features/dashboard/components/ShareModal/types';
import { DeletePublicDashboardButton } from 'app/features/manage-dashboards/components/PublicDashboardListTable/DeletePublicDashboardButton';
import { isOrgAdmin } from 'app/features/plugins/admin/permissions';
import { AccessControlAction } from 'app/types';

import { ShareModal } from '../ShareModal';

interface Props extends ShareModalTabProps {}

export const SharePublicDashboard = (props: Props) => {
  const dashboardVariables = props.dashboard.getVariables();
  const selectors = e2eSelectors.pages.ShareDashboardModal.PublicDashboard;
  const styles = useStyles2(getStyles);
  const { showModal, hideModal } = useContext(ModalsContext);

  const {
    isLoading: isGetLoading,
    data: publicDashboard,
    isError: isGetError,
    isFetching,
  } = useGetConfigQuery(props.dashboard.uid);

  const [saveConfig, { isLoading: isSaveLoading }] = useSaveConfigMutation();

  const [acknowledgements, setAcknowledgements] = useState<Acknowledgements>({
    public: false,
    datasources: false,
    usage: false,
  });
  const [enabledSwitch, setEnabledSwitch] = useState({
    isEnabled: false,
    wasTouched: false,
  });
  const [annotationsEnabled, setAnnotationsEnabled] = useState(false);

  useEffect(() => {
    reportInteraction('grafana_dashboards_public_share_viewed');
  }, []);

  useEffect(() => {
    if (publicDashboardPersisted(publicDashboard)) {
      setAcknowledgements({
        public: true,
        datasources: true,
        usage: true,
      });
      setAnnotationsEnabled(!!publicDashboard?.annotationsEnabled);
    }

    setEnabledSwitch((prevState) => ({ ...prevState, isEnabled: !!publicDashboard?.isEnabled }));
  }, [publicDashboard]);

  const isLoading = isGetLoading || isSaveLoading;
  const hasWritePermissions = contextSrv.hasAccess(AccessControlAction.DashboardsPublicWrite, isOrgAdmin());
  const acknowledged = acknowledgements.public && acknowledgements.datasources && acknowledgements.usage;
  const isSaveDisabled = useMemo(
    () =>
      !hasWritePermissions ||
      !acknowledged ||
      props.dashboard.hasUnsavedChanges() ||
      isLoading ||
      isFetching ||
      isGetError ||
      (!publicDashboardPersisted(publicDashboard) && !enabledSwitch.wasTouched),
    [
      hasWritePermissions,
      acknowledged,
      props.dashboard,
      isLoading,
      isGetError,
      enabledSwitch,
      publicDashboard,
      isFetching,
    ]
  );

  const onSavePublicConfig = () => {
    reportInteraction('grafana_dashboards_public_create_clicked');

    saveConfig({
      dashboard: props.dashboard,
      payload: { ...publicDashboard!, isEnabled: enabledSwitch.isEnabled, annotationsEnabled },
    });
  };

  const onAcknowledge = (field: string, checked: boolean) => {
    setAcknowledgements((prevState) => ({ ...prevState, [field]: checked }));
  };

  const onDismissDelete = () => {
    showModal(ShareModal, {
      dashboard: props.dashboard,
      onDismiss: hideModal,
      activeTab: 'share',
    });
  };

  return (
    <>
      <HorizontalGroup>
        <p
          className={css`
            margin: 0;
          `}
        >
          Welcome to Grafana public dashboards alpha!
        </p>
        {isGetLoading || (isFetching && <Spinner />)}
      </HorizontalGroup>
      <div className={styles.content}>
        {dashboardHasTemplateVariables(dashboardVariables) && !publicDashboardPersisted(publicDashboard) ? (
          <Alert
            severity="warning"
            title="dashboard cannot be public"
            data-testid={selectors.TemplateVariablesWarningAlert}
          >
            This dashboard cannot be made public because it has template variables
          </Alert>
        ) : (
          <>
            <Description />
            <hr />
            <div className={styles.checkboxes}>
              <AcknowledgeCheckboxes
                disabled={publicDashboardPersisted(publicDashboard) || !hasWritePermissions || isLoading || isGetError}
                acknowledgements={acknowledgements}
                onAcknowledge={onAcknowledge}
              />
            </div>
            <hr />
            <Configuration
              isAnnotationsEnabled={annotationsEnabled}
              dashboard={props.dashboard}
              disabled={!hasWritePermissions || isLoading || isGetError}
              isPubDashEnabled={enabledSwitch.isEnabled}
              onToggleEnabled={() =>
                setEnabledSwitch((prevState) => ({ isEnabled: !prevState.isEnabled, wasTouched: true }))
              }
              onToggleAnnotations={() => setAnnotationsEnabled((prevState) => !prevState)}
            />
            {publicDashboardPersisted(publicDashboard) && enabledSwitch.isEnabled && (
              <Field label="Link URL" className={styles.publicUrl}>
                <Input
                  disabled={isLoading}
                  value={generatePublicDashboardUrl(publicDashboard!)}
                  readOnly
                  data-testid={selectors.CopyUrlInput}
                  addonAfter={
                    <ClipboardButton
                      data-testid={selectors.CopyUrlButton}
                      variant="primary"
                      icon="copy"
                      getText={() => generatePublicDashboardUrl(publicDashboard!)}
                    >
                      Copy
                    </ClipboardButton>
                  }
                />
              </Field>
            )}
            {hasWritePermissions ? (
              props.dashboard.hasUnsavedChanges() ? (
                <Alert
                  title="Please save your dashboard changes before updating the public configuration"
                  severity="warning"
                />
              ) : (
                dashboardHasTemplateVariables(dashboardVariables) && (
                  <Alert
                    title="This public dashboard may not work since it uses template variables"
                    severity="warning"
                  />
                )
              )
            ) : (
              <Alert title="You don't have permissions to create or update a public dashboard" severity="warning" />
            )}
            <HorizontalGroup>
              <Button disabled={isSaveDisabled} onClick={onSavePublicConfig} data-testid={selectors.SaveConfigButton}>
                Save sharing configuration
              </Button>
              {publicDashboard && hasWritePermissions && (
                <DeletePublicDashboardButton
                  data-testid={selectors.DeleteButton}
                  onDismiss={onDismissDelete}
                  variant="destructive"
                  dashboard={props.dashboard}
                  publicDashboard={{
                    uid: publicDashboard.uid,
                    dashboardUid: props.dashboard.uid,
                    title: props.dashboard.title,
                  }}
                >
                  Delete public dashboard
                </DeletePublicDashboardButton>
              )}
              {(isSaveLoading || isFetching) && <Spinner />}
            </HorizontalGroup>
          </>
        )}
      </div>
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  content: css`
    margin: ${theme.spacing(1, 0, 0, 0)};
  `,
  checkboxes: css`
    margin: ${theme.spacing(2, 0)};
  `,
  timeRange: css`
    padding: ${theme.spacing(1, 1)};
    margin: ${theme.spacing(0, 0, 2, 0)};
  `,
  publicUrl: css`
    width: 100%;
    margin-bottom: ${theme.spacing(0, 0, 3, 0)};
  `,
});
