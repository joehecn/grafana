/* eslint-disable import/order */
import React from 'react';
import { createRoot } from 'react-dom/client';

import getAllComponents from '../../lib/src/main';

import { GrafanaContextType } from './core/context/GrafanaContext';

import { initDevFeatures } from './dev';

if (process.env.NODE_ENV === 'development') {
  initDevFeatures();
}
export class GrafanaApp {
  context!: GrafanaContextType;

  async init() {
    try {
      // Let iframe container know grafana has started loading
      parent.postMessage('GrafanaAppInit', '*');

      const root = createRoot(document.getElementById('reactRoot')!);
      const { GDashboardGrid } = await getAllComponents();
      root.render(
        React.createElement(GDashboardGrid)
      );
    } catch (error) {
      console.error('Failed to start Grafana', error);
      window.__grafana_load_failed();
    } finally {
      $('.preloader').remove();
    }
  }
}

export default new GrafanaApp();
