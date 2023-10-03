import r2wc from "@r2wc/react-to-web-component";

// import { configureStore } from 'app/store/configureStore';

import { GDashboardGrid } from './g-dashboard-grid';
import { GWelcome } from "./g-welcome";

const getWC = () => {
  // configureStore();

  const GWelcomeWC = r2wc(GWelcome);
  const GDashboardGridWC = r2wc(GDashboardGrid);

  return {
    GWelcomeWC,
    GDashboardGridWC
  };
}

export default {
  GWelcome,
  GDashboardGrid,
  getWC
};
