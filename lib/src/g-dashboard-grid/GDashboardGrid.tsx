import React from "react";
import { Provider } from 'react-redux';

import { Dashboard } from '@grafana/schema';
import { DashboardGrid } from 'app/features/dashboard/dashgrid/DashboardGrid';
import { DashboardModel } from 'app/features/dashboard/state';
import { store } from 'app/store/store';

import dashboardJson from './dashboard.json';

export function getGDashboardGrid() {
  return function GDashboardGrid() {
    const dbJson = dashboardJson as unknown as Dashboard;
    const dashboard = new DashboardModel(dbJson);
  
    const viewPanel = null
    const editPanel = null
  
    return (
      <>
        <Provider store={store}>
          <DashboardGrid
            dashboard={dashboard}
            isEditable={!!dashboard.meta.canEdit}
            viewPanel={viewPanel}
            editPanel={editPanel}
          />
        </Provider>
      </>
    );
  }
}
