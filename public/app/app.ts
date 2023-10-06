import React from 'react';
import { createRoot } from 'react-dom/client';

import getAllComponents from '../../lib/src/main';

import { initDevFeatures } from './dev';

if (process.env.NODE_ENV === 'development') {
  initDevFeatures();
}
export class GrafanaApp {
  context!: any;

  async init() {
    try {
      // Let iframe container know grafana has started loading
      parent.postMessage('GrafanaAppInit', '*');

      const root = createRoot(document.getElementById('reactRoot')!);
      // GDashboardGrid
      // GPanelEditor
      const { GPanelEditor } = await getAllComponents();
      root.render(
        React.createElement(GPanelEditor)
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
