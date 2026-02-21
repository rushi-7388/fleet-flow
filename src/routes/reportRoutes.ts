import { Router } from 'express';
import * as reportController from '../controllers/reportController';
import { authMiddleware } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER, UserRole.VIEWER));

// Trips report (query: startDate, endDate, vehicleId, driverId)
router.get('/trips/export/csv', reportController.exportTripsCSV);
router.get('/trips/export/pdf', reportController.exportTripsPDF);
router.get('/trips', reportController.getTripsReport);

// Expenses - fuel + maintenance (query: startDate, endDate, vehicleId)
router.get('/expenses/export/csv', reportController.exportExpensesCSV);
router.get('/expenses/export/pdf', reportController.exportExpensesPDF);
router.get('/expenses', reportController.getExpensesReport);

// Driver performance (query: startDate, endDate, driverId)
router.get('/driver-performance/export/csv', reportController.exportDriverPerformanceCSV);
router.get('/driver-performance/export/pdf', reportController.exportDriverPerformancePDF);
router.get('/driver-performance', reportController.getDriverPerformanceReport);

export default router;
