import express from "express";
import { 
    initiateKhaltiPayment, 
    verifyKhaltiPayment,
    initiateEsewaPayment,
    verifyEsewaPayment,
    esewaFailure
} from "./controllers/paymentController.js";
import { verifyToken } from "./authMiddleware.js";

const router = express.Router();

/**
 * KHALTI GATEWAY
 */
router.post("/khalti/initiate", verifyToken, (req, res, next) => {
    console.log("Payment Initiation Request received for:", req.body.bookingId);
    next();
}, initiateKhaltiPayment);

router.post("/khalti/verify", verifyToken, verifyKhaltiPayment);

/**
 * ESEWA GATEWAY (ePay v2)
 */
router.post("/esewa/initiate", verifyToken, (req, res, next) => {
    console.log("eSewa Initiation Request received for:", req.body.bookingId);
    next();
}, initiateEsewaPayment);
router.get("/esewa/verify", verifyEsewaPayment); // GET Success callback from eSewa
router.get("/esewa/failure", esewaFailure);    // GET Failure callback from eSewa

export default router;
