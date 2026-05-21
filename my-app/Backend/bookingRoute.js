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

// Create a new booking
router.post("/", createBooking);

// Get all bookings for a user
router.get("/user/:userId", getUserBookings);

// Get booking statistics
router.get("/stats/:userId", getBookingStats);

// Get professional statistics (must be before /professional/:professionalId to avoid conflict)
router.get("/professional/:professionalId/stats", getProfessionalStats);

// Get professional bookings
router.get("/professional/:professionalId", getProfessionalBookings);

// Check if user has confirmed/completed booking with professional
router.get("/user/:userId/professional/:professionalId", checkUserBookingStatus);
// Get a single booking by ID
router.get("/:id", getBookingById);

// Update booking status
router.patch("/:id", updateBookingStatus);

// Update payment status
router.patch("/:id/payment", updatePaymentStatus);
// Delete a booking
router.delete("/:id", deleteBooking);

export default router;
