import express from 'express';
import { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from './controllers/notificationController.js';
import { verifyToken } from './authMiddleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(verifyToken);

// Get all notifications for current user
router.get('/', getMyNotifications);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all as read
router.patch('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;
