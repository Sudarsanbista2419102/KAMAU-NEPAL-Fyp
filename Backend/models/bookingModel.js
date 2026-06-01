import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional"
    },
    serviceTitle: {
      type: String,
      required: true
    },
    serviceProvider: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    workDescription: {
      type: String,
      required: true
    },
    timeSchedule: {
      type: String,
      required: true
    },
    bookingDate: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    hourlyRate: {
      type: String,
      default: "रू 0.00"
    },
    totalCost: {
      type: String,
      default: "रू 0.00"
    },
    rating: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled", "Rejected"],
      default: "Pending"
    },
    notes: {
      type: String,
      default: ""
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Pending", "Refunded"],
      default: "Unpaid"
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Khalti", "eSewa", "None"],
      default: "None"
    },
    transactionId: {
      type: String,
      default: ""
    },
    paymentDetails: {
      type: Object,
      default: null
    },
    customerLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
  },
  { timestamps: true }
);

// Add index for location-based queries
bookingSchema.index({ customerLocation: "2dsphere" });
bookingSchema.index({ status: 1, professionalId: 1 });

export default mongoose.model("Booking", bookingSchema);
