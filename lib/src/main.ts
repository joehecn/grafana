import r2wc from "@r2wc/react-to-web-component";

import { GDashboardGrid } from './g-dashboard-grid';
import { GWelcome } from "./g-welcome";

const GWelcomeWC = r2wc(GWelcome);
const GDashboardGridWC = r2wc(GDashboardGrid);

export default {
  GWelcome,
  GDashboardGrid,
  GWelcomeWC,
  GDashboardGridWC
};
