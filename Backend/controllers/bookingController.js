import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Professional from "../models/professionalModel.js";
import User from "../models/userModel.js";
import { sendBookingConfirmation } from "../utils/emailService.js";

/**
 * Create a new booking
 */
export const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const {
      serviceTitle,
      serviceProvider,
      professionalId,
      fullName,
      workDescription,
      timeSchedule,
      bookingDate,
      location,
      hourlyRate,
      totalCost,
      rating,
      notes,
      customerLocation
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (!serviceTitle || !serviceProvider || !fullName || !workDescription || !timeSchedule || !bookingDate || !location) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Check if user is trying to book themselves or a blocked professional
    if (professionalId) {
      const professional = await Professional.findById(professionalId);
      if (professional) {
        if (professional.userId && professional.userId.toString() === userId) {
          return res.status(403).json({
            success: false,
            message: "You cannot book your own service"
          });
        }
        
        if (professional.isBlocked) {
          const unlockDate = professional.blockedUntil ? new Date(professional.blockedUntil).toLocaleDateString() : 'soon';
          return res.status(403).json({
            success: false,
            message: `This professional is temporarily suspended until ${unlockDate} and cannot accept new bookings.`
          });
        }
      }
    }

    const booking = new Booking({
      userId,
      professionalId: professionalId || null,
      serviceTitle,
      serviceProvider,
      fullName,
      workDescription,
      timeSchedule,
      bookingDate,
      location,
      hourlyRate: hourlyRate || "रू 0.00",
      totalCost: totalCost || "रू 0.00",
      rating: rating || 0,
      notes: notes || "",
      status: "Pending",
      customerLocation: customerLocation || { type: "Point", coordinates: [0, 0] }
    });

    await booking.save();

    // Send confirmation email
    try {
      const user = await User.findById(userId).select('email name');
      let professionalName = serviceProvider;
      if (professionalId) {
        const professional = await Professional.findById(professionalId).select('firstName lastName');
        if (professional) professionalName = `${professional.firstName} ${professional.lastName}`;
      }
      await sendBookingConfirmation({
        to: user?.email,
        professionalName,
        bookingDate,
        bookingTime: timeSchedule,
        bookingId: booking._id
      });
    } catch (emailErr) {
      console.error('Failed to send booking confirmation email:', emailErr);
    }

    

    

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message
    });
  }
};

/**
 * Get all bookings for a user
 */
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone")
      .populate("professionalId", "firstName lastName serviceCategory profileImage serviceArea phone email");

    res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message
    });
  }
};

/**
 * Get a single booking by ID
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("userId", "name email phone")
      .populate("professionalId", "firstName lastName serviceCategory profileImage serviceArea phone email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message
    });
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const validStatuses = ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    // Capture the existing booking to check previous status
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const previousStatus = existingBooking.status;

    // Check if professional is blocked when they try to accept a booking
    if (status === "Confirmed") {
      const professional = await Professional.findById(existingBooking.professionalId);
      if (professional && professional.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "Your account is suspended. You cannot accept or confirm services at this time."
        });
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status, notes: notes || "" },
      { new: true, runValidators: true }
    );

    // Synchronize completedJobs count and liveStatus in Professional model
    if (booking.professionalId && status !== previousStatus) {
      // 1. Update completedJobs count
      if (status === "Completed") {
        await Professional.findByIdAndUpdate(booking.professionalId, { 
          $inc: { completedJobs: 1 } 
        });
        console.log(`Incremented completedJobs for professional ${booking.professionalId}`);
      } else if (previousStatus === "Completed") {
        await Professional.findByIdAndUpdate(booking.professionalId, { 
          $inc: { completedJobs: -1 } 
        });
        console.log(`Decremented completedJobs for professional ${booking.professionalId}`);
      }

      // 2. Update liveStatus (Ongoing if has confirmed or in progress jobs, otherwise Free)
      if (status === "Confirmed" || status === "In Progress") {
        await Professional.findByIdAndUpdate(booking.professionalId, {
          liveStatus: "Ongoing"
        });
        console.log(`Set liveStatus to Ongoing for professional ${booking.professionalId}`);
      } else if (["Completed", "Cancelled", "Rejected"].includes(status)) {
        // Check if professional has any other ongoing or confirmed bookings
        const otherActiveBooking = await Booking.findOne({
          professionalId: booking.professionalId,
          _id: { $ne: booking._id },
          status: { $in: ["Confirmed", "In Progress"] }
        });

        if (!otherActiveBooking) {
          await Professional.findByIdAndUpdate(booking.professionalId, {
            liveStatus: "Free"
          });
          console.log(`Set liveStatus to Free for professional ${booking.professionalId}`);
        }
      }
    }

    // Trigger notification for the user
    try {
      const { createNotification } = await import("./notificationController.js");
      let title = "";
      let description = "";

      if (status === "Confirmed") {
        title = "Service Request Accepted! 🎉";
        description = `${booking.serviceProvider} has accepted your request for ${booking.serviceTitle}. Check 'My Bookings' for details.`;
      } else if (status === "Rejected") {
        title = "Service Request Declined";
        const reasonPart = notes ? ` Reason: ${notes}` : "";
        description = `Unfortunately, ${booking.serviceProvider} cannot fulfill your request for ${booking.serviceTitle} at this time.${reasonPart}`;
      } else {
        title = "Booking Status Updated";
        description = `Your booking for ${booking.serviceTitle} is now ${status}.`;
      }

      await createNotification(
        booking.userId,
        status === "Confirmed" ? "success" : status === "Rejected" ? "error" : "info",
        title,
        description,
        "/my-bookings"
      );
    } catch (notifErr) {
      console.error("Failed to send notification:", notifErr);
      // Don't fail the response if notification fails
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking",
      error: error.message
    });
  }
};


/**
 * Delete a booking
 */
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting booking",
      error: error.message
    });
  }
};

/**
 * Get booking statistics
 */
export const getBookingStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const objectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;

    if (!objectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID"
      });
    }

    const stats = await Booking.aggregate([
      { $match: { userId: objectId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalBookings = await Booking.countDocuments({ userId: objectId });

    res.status(200).json({
      success: true,
      data: {
        total: totalBookings,
        byStatus: stats
      }
    });
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking stats",
      error: error.message
    });
  }
};

/**
 * Get all bookings for a professional
 */
export const getProfessionalBookings = async (req, res) => {
  try {
    const { professionalId } = req.params;

    if (!professionalId) {
      return res.status(400).json({
        success: false,
        message: "Professional ID is required"
      });
    }

    const bookings = await Booking.find({ professionalId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone profileImage address");

    res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error("Error fetching professional bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message
    });
  }
};

/**
 * Get booking statistics for a professional
 */
export const getProfessionalStats = async (req, res) => {
  try {
    const { professionalId } = req.params;

    if (!professionalId) {
      return res.status(400).json({
        success: false,
        message: "Professional ID is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(professionalId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Professional ID"
      });
    }

    // Convert string ID to ObjectId for aggregation
    const proId = new mongoose.Types.ObjectId(professionalId);

    // Get counts by status
    const statusStats = await Booking.aggregate([
      { $match: { professionalId: proId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total earnings from completed jobs
    // Note: totalCost is stored as "रू 1,200", we need to parse it
    const completedBookings = await Booking.find({
      professionalId: proId,
      status: "Completed"
    });

    let totalEarnings = 0;
    completedBookings.forEach(booking => {
      const costStr = booking.totalCost || "रू 0";
      const amount = parseFloat(costStr.replace(/[^\d.]/g, '')) || 0;
      totalEarnings += amount;
    });

    // Get professional details for rating
    const professional = await Professional.findById(professionalId);

    const stats = {
      pendingRequests: 0,
      completedJobs: 0,
      totalEarnings,
      rating: professional?.rating || 0,
      totalReviews: professional?.totalReviews || 0
    };

    statusStats.forEach(stat => {
      if (stat._id === "Pending") stats.pendingRequests = stat.count;
      if (stat._id === "Completed") stats.completedJobs = stat.count;
    });

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error fetching professional stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stats",
      error: error.message
    });
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required"
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { 
        paymentStatus, 
        paymentMethod: paymentMethod || "None" 
      },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Notify professional if payment is received
    if (paymentStatus === "Paid") {
      try {
        const { createNotification } = await import("./notificationController.js");
        if (booking.professionalId) {
          // get the actual professional user ID
          const prof = await Professional.findById(booking.professionalId);
          if (prof && prof.userId) {
            await createNotification(
              prof.userId,
              "success",
              "Payment Received! 💰",
              `You have received payment of ${booking.totalCost} for ${booking.serviceTitle}.`,
              "/professional-dashboard"
            );
          }
        }
      } catch (notifErr) {
        console.error("Failed to send notification to professional:", notifErr);
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: booking
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message
    });
  }
};

/**
 * Check if a user has a confirmed or completed booking with a professional
 */
export const checkUserBookingStatus = async (req, res) => {
  try {
    const { userId, professionalId } = req.params;

    if (!userId || !professionalId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Professional ID are required"
      });
    }

    // Find any booking by this user for this professional
    const bookings = await Booking.find({
      userId,
      professionalId
    });

    res.status(200).json({
      success: true,
      hasBooking: bookings.some(b => ["Confirmed", "Completed"].includes(b.status)),
      hasPending: bookings.some(b => b.status === "Pending"),
      hasCompletedBooking: bookings.some(b => b.status === "Completed")
    });
  } catch (error) {
    console.error("Error checking user booking status:", error);
    res.status(500).json({
      success: false,
      message: "Error checking user booking status",
      error: error.message
    });
  }
};
