import express from 'express';
import { createReport, getAllReports, updateReportStatus, checkExistingReport } from './controllers/reportController.js';

const router = express.Router();

// Submit a new report
router.post('/', createReport);

// Check if a report already exists
router.get('/check/:reporterId/:targetId', checkExistingReport);

// Get all reports (Admin only)
router.get('/all', getAllReports);

// Update report status (Admin only)
router.patch('/:id/status', updateReportStatus);

export default router;
