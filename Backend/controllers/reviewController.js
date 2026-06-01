import Review from "../models/reviewModel.js";
import Professional from "../models/professionalModel.js";
import Booking from "../models/bookingModel.js";

/**
 * Create a new review
 */
export const createReview = async (req, res) => {
    try {
        const { professionalId, userId, userName, rating, comment } = req.body;

        if (!professionalId || !userId || !rating || !comment) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Security Check: Ensure user has a confirmed or completed booking with this professional
        const booking = await Booking.findOne({
            userId,
            professionalId,
            status: { $in: ["Confirmed", "Completed"] }
        });

        if (!booking) {
            return res.status(403).json({ 
                success: false, 
                message: "You can only review a professional after their service is approved or completed." 
            });
        }
        // Check if review already exists
        const existingReview = await Review.findOne({ professionalId, userId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "You have already reviewed this professional" });
        }

        const review = await Review.create({
            professionalId,
            userId,
            userName,
            rating,
            comment,
        });

        // Update professional rating and totalReviews
        const reviews = await Review.find({ professionalId });
        const totalReviews = reviews.length;
        const avgRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews;

        await Professional.findByIdAndUpdate(professionalId, {
            rating: parseFloat(avgRating.toFixed(1)),
            totalReviews: totalReviews,
        });

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: review,
        });
    } catch (error) {
        console.error("Create review error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

/**
 * Get all reviews for a professional
 */
export const getProfessionalReviews = async (req, res) => {
    try {
        const { professionalId } = req.params;
        const reviews = await Review.find({ professionalId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: reviews,
        });
    } catch (error) {
        console.error("Get reviews error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Delete a review
 */
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        const professionalId = review.professionalId;
        await Review.findByIdAndDelete(id);

        // Recalculate rating
        const reviews = await Review.find({ professionalId });
        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
            ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews
            : 0;

        await Professional.findByIdAndUpdate(professionalId, {
            rating: parseFloat(avgRating.toFixed(1)),
            totalReviews: totalReviews,
        });

        res.json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        console.error("Delete review error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
