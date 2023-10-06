import './style.css';

import React from "react";
import { Provider } from 'react-redux';

import { config } from '@grafana/runtime';
import { Dashboard } from '@grafana/schema';
import { ErrorBoundaryAlert } from '@grafana/ui';
import { GrafanaContextType, GrafanaContext } from 'app/core/context/GrafanaContext';
import { getNavModel } from 'app/core/selectors/navModel';
import { ThemeProvider } from 'app/core/utils/ConfigProvider';
import { PanelEditor } from 'app/features/dashboard/components/PanelEditor/PanelEditor';
import { getTimeSrv, TimeSrv } from 'app/features/dashboard/services/TimeSrv';
import { DashboardModel, PanelModel } from 'app/features/dashboard/state';
import { createDashboardQueryRunner } from 'app/features/query/state/DashboardQueryRunner/DashboardQueryRunner';
import { store } from 'app/store/store';

import dashboardJson from './dashboard.json';

export function getGPanelEditor({ context }: { context: GrafanaContextType }) {
  return function GPanelEditor() {
    const dbJson = dashboardJson as unknown as Dashboard;
    const dashboard = new DashboardModel(dbJson);

    const timeSrv: TimeSrv = getTimeSrv();
    timeSrv.init(dashboard);
    const runner = createDashboardQueryRunner({ dashboard, timeSrv });
    runner.run({ dashboard, range: timeSrv.timeRange() });

    const panel = dashboard.getPanelByUrlId('1');
    const editPanel = panel as PanelModel;
    const tab = undefined;

    const state = store.getState();
    const navIndex = state.navIndex;
    const sectionNav = getNavModel(navIndex, 'dashboards/browse');

    const pageNav = {
      "text": "Edit panel",
      "parentItem": {
        "text": "Test dashboard",
        "url": "/d/a7b8f54f-e1d8-4826-866a-e5554f889be3/test-dashboard?orgId=2"
      }
    }
    
    return (
      <>
        <Provider store={store}>
          <ErrorBoundaryAlert style="page">
            <GrafanaContext.Provider value={context}>
              <ThemeProvider value={config.theme2}>
                <div className="grafana-app">
                  <PanelEditor
                    dashboard={dashboard}
                    sourcePanel={editPanel}
                    tab={tab}
                    sectionNav={sectionNav}
                    pageNav={pageNav}
                  />
                </div>
              </ThemeProvider>
            </GrafanaContext.Provider>
          </ErrorBoundaryAlert>
        </Provider>
      </>
    );
  }
}
