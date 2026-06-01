import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        professionalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Professional",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

// Prevent multiple reviews from the same user for the same professional
reviewSchema.index({ professionalId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
