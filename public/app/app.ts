import React from 'react';
import { createRoot } from 'react-dom/client';

import G from '../../lib/src/main';

export class GrafanaApp {
  context!: any;

  async init() {
    $('.preloader').remove();

    const root = createRoot(document.getElementById('reactRoot')!);
      const { GDashboardGrid } = G;
      root.render(
        React.createElement(GDashboardGrid)
      );
  }
}

export default new GrafanaApp();
