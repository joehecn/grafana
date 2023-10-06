import 'symbol-observable';
import 'core-js';
import 'regenerator-runtime/runtime';

import 'whatwg-fetch'; // fetch polyfill needed for PhantomJs rendering
import 'file-saver';
import 'jquery';

import 'app/features/all';

import r2wc from "@r2wc/react-to-web-component";
import _ from 'lodash'; // eslint-disable-line lodash/import-scope

import {
  locationUtil,
  monacoLanguageRegistry,
  setLocale,
  setTimeZoneResolver,
  setWeekStart,
  standardEditorsRegistry,
  standardFieldConfigEditorRegistry,
  standardTransformersRegistry,
} from '@grafana/data';
import {
  locationService,
  registerEchoBackend,
  setBackendSrv,
  setDataSourceSrv,
  setEchoSrv,
  setLocationSrv,
  setQueryRunnerFactory,
  setRunRequest,
  setPluginImportUtils,
  setPluginExtensionGetter,
  setAppEvents,
  type GetPluginExtensions,
} from '@grafana/runtime';
import { setPanelDataErrorView } from '@grafana/runtime/src/components/PanelDataErrorView';
import { setPanelRenderer } from '@grafana/runtime/src/components/PanelRenderer';
import { setPluginPage } from '@grafana/runtime/src/components/PluginPage';
import { getScrollbarWidth } from '@grafana/ui';
import appEvents from 'app/core/app_events';
import { AppChromeService } from 'app/core/components/AppChrome/AppChromeService';
import { getAllOptionEditors, getAllStandardFieldConfigs } from 'app/core/components/OptionsUI/registry';
import { PluginPage } from 'app/core/components/Page/PluginPage';
import config from 'app/core/config';
import { GrafanaContextType } from 'app/core/context/GrafanaContext';
import { initializeI18n } from 'app/core/internationalization';
import { interceptLinkClicks } from 'app/core/navigation/patch/interceptLinkClicks';
import { ModalManager } from 'app/core/services/ModalManager';
import { backendSrv } from 'app/core/services/backend_srv';
import { contextSrv } from 'app/core/services/context_srv';
import { Echo } from 'app/core/services/echo/Echo';
import { reportPerformance } from 'app/core/services/echo/EchoSrv';
import { PerformanceBackend } from 'app/core/services/echo/backends/PerformanceBackend';
import { ApplicationInsightsBackend } from 'app/core/services/echo/backends/analytics/ApplicationInsightsBackend';
import { GA4EchoBackend } from 'app/core/services/echo/backends/analytics/GA4Backend';
import { GAEchoBackend } from 'app/core/services/echo/backends/analytics/GABackend';
import { RudderstackBackend } from 'app/core/services/echo/backends/analytics/RudderstackBackend';
import { GrafanaJavascriptAgentBackend } from 'app/core/services/echo/backends/grafana-javascript-agent/GrafanaJavascriptAgentBackend';
import { KeybindingSrv } from 'app/core/services/keybindingSrv';
import { arrayMove } from 'app/core/utils/arrayMove';
import { initAuthConfig } from 'app/features/auth-config';
import { getTimeSrv } from 'app/features/dashboard/services/TimeSrv';
import { initGrafanaLive } from 'app/features/live';
import { PanelDataErrorView } from 'app/features/panel/components/PanelDataErrorView';
import { PanelRenderer } from 'app/features/panel/components/PanelRenderer';
import { DatasourceSrv } from 'app/features/plugins/datasource_srv';
import { createPluginExtensionRegistry } from 'app/features/plugins/extensions/createPluginExtensionRegistry';
import { getCoreExtensionConfigurations } from 'app/features/plugins/extensions/getCoreExtensionConfigurations';
import { getPluginExtensions } from 'app/features/plugins/extensions/getPluginExtensions';
import { importPanelPlugin, syncGetPanelPlugin } from 'app/features/plugins/importPanelPlugin';
import { preloadPlugins } from 'app/features/plugins/pluginPreloader';
import { QueryRunner } from 'app/features/query/state/QueryRunner';
import { runRequest } from 'app/features/query/state/runRequest';
import { initWindowRuntime } from 'app/features/runtime/init';
import { cleanupOldExpandedFolders } from 'app/features/search/utils';
import { getStandardTransformers } from 'app/features/transformers/standardTransformers';
import { variableAdapters } from 'app/features/variables/adapters';
import { createAdHocVariableAdapter } from 'app/features/variables/adhoc/adapter';
import { createConstantVariableAdapter } from 'app/features/variables/constant/adapter';
import { createCustomVariableAdapter } from 'app/features/variables/custom/adapter';
import { createDataSourceVariableAdapter } from 'app/features/variables/datasource/adapter';
import { getVariablesUrlParams } from 'app/features/variables/getAllVariableValuesForUrl';
import { createIntervalVariableAdapter } from 'app/features/variables/interval/adapter';
import { setVariableQueryRunner, VariableQueryRunner } from 'app/features/variables/query/VariableQueryRunner';
import { createQueryVariableAdapter } from 'app/features/variables/query/adapter';
import { createSystemVariableAdapter } from 'app/features/variables/system/adapter';
import { createTextBoxVariableAdapter } from 'app/features/variables/textbox/adapter';
import { configureStore } from 'app/store/configureStore';

import getDefaultMonacoLanguages from '../../public/lib/monaco-languages';

import { getGDashboardGrid } from './g-dashboard-grid';
import { getGPanelEditor } from './g-panel-editor';

// add move to lodash for backward compatabilty with plugins
// @ts-ignore
_.move = arrayMove;

// import symlinked extensions
const extensionsIndex = require.context('.', true, /extensions\/index.ts/);
const extensionsExports = extensionsIndex.keys().map((key) => {
  return extensionsIndex(key);
});

let cache: any = null;

function addExtensionReducers() {
  if (extensionsExports.length > 0) {
    extensionsExports[0].addExtensionReducers();
  }
}

function initExtensions() {
  if (extensionsExports.length > 0) {
    extensionsExports[0].init();
  }
}

function initEchoSrv() {
  setEchoSrv(new Echo({ debug: process.env.NODE_ENV === 'development' }));

  window.addEventListener('load', (e) => {
    const loadMetricName = 'frontend_boot_load_time_seconds';
    // Metrics below are marked in public/views/index-template.html
    const jsLoadMetricName = 'frontend_boot_js_done_time_seconds';
    const cssLoadMetricName = 'frontend_boot_css_time_seconds';

    if (performance) {
      performance.mark(loadMetricName);
      reportMetricPerformanceMark('first-paint', 'frontend_boot_', '_time_seconds');
      reportMetricPerformanceMark('first-contentful-paint', 'frontend_boot_', '_time_seconds');
      reportMetricPerformanceMark(loadMetricName);
      reportMetricPerformanceMark(jsLoadMetricName);
      reportMetricPerformanceMark(cssLoadMetricName);
    }
  });

  if (contextSrv.user.orgRole !== '') {
    registerEchoBackend(new PerformanceBackend({}));
  }

  if (config.grafanaJavascriptAgent.enabled) {
    registerEchoBackend(
      new GrafanaJavascriptAgentBackend({
        ...config.grafanaJavascriptAgent,
        app: {
          version: config.buildInfo.version,
          environment: config.buildInfo.env,
        },
        buildInfo: config.buildInfo,
        user: {
          id: String(config.bootData.user?.id),
          email: config.bootData.user?.email,
        },
      })
    );
  }

  if (config.googleAnalyticsId) {
    registerEchoBackend(
      new GAEchoBackend({
        googleAnalyticsId: config.googleAnalyticsId,
      })
    );
  }

  if (config.googleAnalytics4Id) {
    registerEchoBackend(
      new GA4EchoBackend({
        googleAnalyticsId: config.googleAnalytics4Id,
        googleAnalytics4SendManualPageViews: config.googleAnalytics4SendManualPageViews,
      })
    );
  }

  if (config.rudderstackWriteKey && config.rudderstackDataPlaneUrl) {
    registerEchoBackend(
      new RudderstackBackend({
        writeKey: config.rudderstackWriteKey,
        dataPlaneUrl: config.rudderstackDataPlaneUrl,
        user: config.bootData.user,
        sdkUrl: config.rudderstackSdkUrl,
        configUrl: config.rudderstackConfigUrl,
        buildInfo: config.buildInfo,
      })
    );
  }

  if (config.applicationInsightsConnectionString) {
    registerEchoBackend(
      new ApplicationInsightsBackend({
        connectionString: config.applicationInsightsConnectionString,
        endpointUrl: config.applicationInsightsEndpointUrl,
      })
    );
  }
}

function addClassIfNoOverlayScrollbar() {
  if (getScrollbarWidth() > 0) {
    document.body.classList.add('no-overlay-scrollbar');
  }
}

/**
 * Report when a metric of a given name was marked during the document lifecycle. Works for markers with no duration,
 * like PerformanceMark or PerformancePaintTiming (e.g. created with performance.mark, or first-contentful-paint)
 */
function reportMetricPerformanceMark(metricName: string, prefix = '', suffix = ''): void {
  const metric = _.first(performance.getEntriesByName(metricName));
  if (metric) {
    const metricName = metric.name.replace(/-/g, '_');
    reportPerformance(`${prefix}${metricName}${suffix}`, Math.round(metric.startTime) / 1000);
  }
}

async function init() {
  const initI18nPromise = initializeI18n(config.bootData.user.language);

  setBackendSrv(backendSrv);
  initEchoSrv();

  addClassIfNoOverlayScrollbar();
  setLocale(config.bootData.user.locale);
  setWeekStart(config.bootData.user.weekStart);
  setPanelRenderer(PanelRenderer);
  setPluginPage(PluginPage);
  setPanelDataErrorView(PanelDataErrorView);
  setLocationSrv(locationService);
  setTimeZoneResolver(() => config.bootData.user.timezone);
  initGrafanaLive();

  initAuthConfig();

  // Expose the app-wide eventbus
  setAppEvents(appEvents);

  // We must wait for translations to load because some preloaded store state requires translating
  await initI18nPromise;

  // Important that extension reducers are initialized before store
  addExtensionReducers();
  configureStore();
  initExtensions();

  standardEditorsRegistry.setInit(getAllOptionEditors);
  standardFieldConfigEditorRegistry.setInit(getAllStandardFieldConfigs);
  standardTransformersRegistry.setInit(getStandardTransformers);
  variableAdapters.setInit(() => [
    createQueryVariableAdapter(),
    createCustomVariableAdapter(),
    createTextBoxVariableAdapter(),
    createConstantVariableAdapter(),
    createDataSourceVariableAdapter(),
    createIntervalVariableAdapter(),
    createAdHocVariableAdapter(),
    createSystemVariableAdapter(),
  ]);
  monacoLanguageRegistry.setInit(getDefaultMonacoLanguages);

  setQueryRunnerFactory(() => new QueryRunner());
  setVariableQueryRunner(new VariableQueryRunner());

  // Provide runRequest implementation to packages, @grafana/scenes in particular
  setRunRequest(runRequest);

  // Privide plugin import utils to packages, @grafana/scenes in particular
  setPluginImportUtils({
    importPanelPlugin,
    getPanelPluginFromCache: syncGetPanelPlugin,
  });

  locationUtil.initialize({
    config,
    getTimeRangeForUrl: getTimeSrv().timeRangeForUrl,
    getVariablesUrlParams: getVariablesUrlParams,
  });

  // intercept anchor clicks and forward it to custom history instead of relying on browser's history
  document.addEventListener('click', interceptLinkClicks);

  // Init DataSourceSrv
  const dataSourceSrv = new DatasourceSrv();
  dataSourceSrv.init(config.datasources, config.defaultDatasource);
  setDataSourceSrv(dataSourceSrv);
  initWindowRuntime();

  // init modal manager
  const modalManager = new ModalManager();
  modalManager.init();

  // Preload selected app plugins
  const preloadResults = await preloadPlugins(config.apps);

  // Create extension registry out of preloaded plugins and core extensions
  const extensionRegistry = createPluginExtensionRegistry([
    { pluginId: 'grafana', extensionConfigs: getCoreExtensionConfigurations() },
    ...preloadResults,
  ]);

  // Expose the getPluginExtension function via grafana-runtime
  const pluginExtensionGetter: GetPluginExtensions = (options) =>
    getPluginExtensions({ ...options, registry: extensionRegistry });

  setPluginExtensionGetter(pluginExtensionGetter);

  // initialize chrome service
  const queryParams = locationService.getSearchObject();
  const chromeService = new AppChromeService();
  const keybindingsService = new KeybindingSrv(locationService, chromeService);

  // Read initial kiosk mode from url at app startup
  chromeService.setKioskModeFromUrl(queryParams.kiosk);

  // Clean up old search local storage values
  try {
    cleanupOldExpandedFolders();
  } catch (err) {
    console.warn('Failed to clean up old expanded folders', err);
  }

  const context = {
    backend: backendSrv,
    location: locationService,
    chrome: chromeService,
    keybindings: keybindingsService,
    config,
  };

  return context;
}

async function getAllComponents() {
  if (cache !== null) { return cache; }

  const context: GrafanaContextType = await init();

  const GDashboardGrid = getGDashboardGrid();
  const GDashboardGridWC = r2wc(GDashboardGrid);

  const GPanelEditor = getGPanelEditor({ context });
  const GPanelEditorWC = r2wc(GPanelEditor);

  cache = {
    GDashboardGrid,
    GPanelEditor,

    GDashboardGridWC,
    GPanelEditorWC
  }

  return cache;
}


export default getAllComponents;
