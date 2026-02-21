import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/kpis', analyticsController.getDashboardKpis);
router.get('/dashboard-fleet', analyticsController.getDashboardFleet);
router.get('/vehicles', analyticsController.getVehicleAnalytics);
router.get('/monthly-summaries', analyticsController.getMonthlySummaries);
router.get('/utilization', analyticsController.getUtilizationSeries);
router.get('/fuel-efficiency', analyticsController.getFuelEfficiencyByVehicle);
router.get('/fuel-efficiency-trend', analyticsController.getFuelEfficiencyTrend);
router.get('/top-operational-costs', analyticsController.getTopOperationalCosts);
router.get('/operational-summary', analyticsController.getOperationalSummary);

export default router;
