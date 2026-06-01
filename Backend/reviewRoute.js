import express from "express";
import {
    createReview,
    getProfessionalReviews,
    deleteReview
} from "./controllers/reviewController.js";
import { verifyToken } from "./authMiddleware.js";

const router = express.Router();

// Get reviews for a professional (Public)
router.get("/professional/:professionalId", getProfessionalReviews);

// Create a review (Protected)
router.post("/", verifyToken, createReview);

// Delete a review (Protected)
router.delete("/:id", verifyToken, deleteReview);

export default router;
