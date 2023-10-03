import './style.css'

import React from "react";

import { DashboardModel } from 'app/features/dashboard/state';
import dashboardJson from './dashboard.json';
import { Dashboard } from '@grafana/schema';

export default function GDashboardGrid() {
  const db = dashboardJson as unknown as Dashboard;
  console.log(db);
  const dashboard = new DashboardModel(db);
  console.log(dashboard);

  return (
    <div>
      <h1>GDashboardGrid</h1>
    </div>
  );
}
