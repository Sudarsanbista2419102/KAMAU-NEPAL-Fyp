import express from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getBookingStats,
  getProfessionalBookings,
  getProfessionalStats,
  updatePaymentStatus,
  checkUserBookingStatus
} from "./controllers/bookingController.js";
import { verifyToken } from "./authMiddleware.js"; // Correct named import

const router = express.Router();

// Create a new booking (requires authentication)
router.post("/", verifyToken, createBooking);

// Get all bookings for a user (requires authentication)
router.get("/user/:userId", verifyToken, getUserBookings);

// Get booking statistics (requires authentication)
router.get("/stats/:userId", verifyToken, getBookingStats);

// Get professional statistics (must be before /professional/:professionalId to avoid conflict) (requires authentication)
router.get("/professional/:professionalId/stats", verifyToken, getProfessionalStats);

// Get professional bookings (requires authentication)
router.get("/professional/:professionalId", verifyToken, getProfessionalBookings);

// Check if user has confirmed/completed booking with professional (requires authentication)
router.get("/user/:userId/professional/:professionalId", verifyToken, checkUserBookingStatus);
// Get a single booking by ID (requires authentication)
router.get("/:id", verifyToken, getBookingById);

// Update booking status (requires authentication)
router.patch("/:id", verifyToken, updateBookingStatus);

// Update payment status (requires authentication)
router.patch("/:id/payment", verifyToken, updatePaymentStatus);
// Delete a booking (requires authentication)
router.delete("/:id", verifyToken, deleteBooking);

export default router;
