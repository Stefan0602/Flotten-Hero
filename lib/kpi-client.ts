import { KpiService } from './kpi-service';
import { PrismaKpiService } from './services/kpi.service';

// ========================================================
// KPI Client Helper
// ========================================================

/**
 * Returns the appropriate KPI data source.
 * 
 * - If running with real database (future), uses PrismaKpiService.
 * - Currently defaults to demo data for easy testing with large seed.
 */
export const KpiClient = {
  async getOperativesControlling() {
    // For now we always use demo data because the app is heavily demo-driven.
    // Later you can add logic like:
    // if (process.env.NEXT_PUBLIC_USE_REAL_DATA === 'true') {
    //   return PrismaKpiService.getOperativesControlling(currentMandantId);
    // }
    return KpiService.getOperativesControlling();
  },

  async getStrategischesControlling() {
    return KpiService.getStrategischesControlling();
  },
};
