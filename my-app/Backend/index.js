import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./userRoute.js";
import professionalRoute from "./professionalRoute.js";
import adminRoute from "./adminRoute.js";
import authRoute from "./authRoute.js";
import bookingRoute from "./bookingRoute.js";
import reviewRoute from "./reviewRoute.js";
import notificationRoute from "./notificationRoute.js";
import messageRoute from "./messageRoute.js";
import paymentRoute from "./paymentRoute.js";
import reportRoute from "./reportRoute.js";
import categoryRoute from "./categoryRoute.js";
import { checkAndAutoUnblockProfessionals } from "./controllers/adminController.js";
import path from "path";

dotenv.config();

const app = express();
// Priority: Environment Variable > Default 5000
const PORT = process.env.PORT || 5000;




/* ===============================
   MIDDLEWARE
================================ */
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://127.0.0.1:3000", 
    "http://localhost:3002", 
    "http://localhost:3003",
    process.env.FRONTEND_URL || "http://localhost:3000"
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* ===============================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

/* ===============================
   ROUTES
================================ */
app.use("/api/users", userRoutes);
app.use("/api/professionals", professionalRoute);
app.use("/api/admin", adminRoute);
app.use("/api/auth", authRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/reports", reportRoute);
app.use("/api/categories", categoryRoute);

// Serve uploaded images with caching for better performance
const oneYear = 31536000000;
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads'), {
  maxAge: oneYear,
  immutable: true
}));

/* ===============================
   DATABASE CONNECTION
================================ */
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env file");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    
    // Setup periodic job to check and auto-unblock professionals (every 1 hour)
    setInterval(async () => {
      console.log("🔄 Checking for expired professional blocks...");
      const result = await checkAndAutoUnblockProfessionals();
      if (result.success && result.unblocked > 0) {
        console.log(`✅ Auto-unblocked ${result.unblocked} professional(s)`);
      }
    }, 60 * 60 * 1000); // Run every 1 hour
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/* ===============================
   START SERVER
================================ */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

/* ===============================
   GLOBAL ERROR HANDLER
================================ */
app.use((err, req, res, next) => {
  console.error("❌ Global Error Handler:", err);
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: "File size is too large. Max limit is 30MB."
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: "Unexpected file field or too many files."
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});