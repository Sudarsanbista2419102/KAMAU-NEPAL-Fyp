import axios from 'axios';
import crypto from 'crypto';
import Booking from '../models/bookingModel.js';
import Professional from '../models/professionalModel.js';
import { createNotification } from './notificationController.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Khalti Payment Gateway Integration (v2 ePayment)
 * Handle Inititation and Verification using Sandbox environment
 */

/**
 * Initiate Khalti Payment
 * This generates a secure payment_url from Khalti servers
 */
export const initiateKhaltiPayment = async (req, res) => {
    try {
        const { bookingId, returnUrl } = req.body;

        // 1. Validate Input
        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Booking ID is required" });
        }

        // 2. Fetch Booking Data
        const booking = await Booking.findById(bookingId).populate('userId');
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking mission not found" });
        }

        // 3. Prepare Amount (Convert to Paisa)
        // Service cost comes as "रू 1200.00", we need 120000 paisa
        const costStr = booking.totalCost || "रू 0.00";
        
        // Extract numeric value from string like "रू 1200.00"
        let amountNPR = 0;
        if (typeof costStr === 'string') {
            // Remove all non-numeric characters except decimal point
            const numericStr = costStr.replace(/[^\d.]/g, '');
            amountNPR = parseFloat(numericStr) || 0;
        } else if (typeof costStr === 'number') {
            amountNPR = costStr;
        }
        
        const amountPaisa = Math.round(amountNPR * 100);

        if (amountPaisa <= 0) {
            return res.status(400).json({ success: false, message: "Transaction failed: Invalid service amount. Amount must be greater than 0." });
        }

        // 4. Secure Khalti Payload
        const khaltiSecret = process.env.KHALTI_SECRET_KEY;
        const fallbackReturnUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/verify`;
        
        const payload = {
            return_url: returnUrl || fallbackReturnUrl,
            website_url: process.env.FRONTEND_URL || 'http://localhost:3000',
            amount: amountPaisa,
            purchase_order_id: booking._id.toString(),
            purchase_order_name: `Mission: ${booking.serviceTitle}`,
            customer_info: {
                name: booking.fullName || booking.userId?.name || "Citizen of Nepal",
                email: booking.userId?.email || "customer@kamaunepal.com",
                phone: booking.userId?.phone || "9800000000"
            }
        };

        // 5. Connect to Khalti Sandbox
        console.log("🚀 Initiating Khalti Payment for:", booking._id);
        console.log("📊 Payment Details:", {
            amount: amountNPR,
            amountPaisa,
            costStr,
            bookingId: booking._id,
            serviceTitle: booking.serviceTitle
        });
        
        const response = await axios.post(
            'https://a.khalti.com/api/v2/epayment/initiate/',
            payload,
            {
                headers: {
                    'Authorization': `Key ${khaltiSecret}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // 6. Return Payment URL to Frontend
        if (response.data && response.data.payment_url) {
            res.status(200).json({
                success: true,
                payment_url: response.data.payment_url,
                pidx: response.data.pidx
            });
        } else {
            throw new Error("Khalti gateway refused to provide an active session.");
        }

    } catch (error) {
        console.error("❌ Khalti Initiation Blocked:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Neural Gateway Error: Failed to initiate payment",
            error: error.response?.data || error.message
        });
    }
};

/**
 * Verify Khalti Payment
 * This confirms the transaction status after user returns from Khalti
 */
export const verifyKhaltiPayment = async (req, res) => {
    try {
        const { pidx, bookingId } = req.body;

        if (!pidx) {
            return res.status(400).json({ success: false, message: "pidx pulse missing for verification" });
        }

        const khaltiSecret = process.env.KHALTI_SECRET_KEY;

        // 1. Perform Lookup on Khalti Servers
        const response = await axios.post(
            'https://a.khalti.com/api/v2/epayment/lookup/',
            { pidx },
            {
                headers: {
                    'Authorization': `Key ${khaltiSecret}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("🔍 Khalti Verification Pulse:", response.data.status);

        // 2. Handle Completion
        if (response.data && response.data.status === 'Completed') {
            
            // 3. Extract and Sanitize Booking ID (Bonus: Handle potential discrepancies)
            const targetId = bookingId || response.data.purchase_order_id;
            const booking = await Booking.findById(targetId);

            if (!booking) {
                return res.status(404).json({ success: false, message: "Transaction verified but mission record not found" });
            }

            // 4. Persistence (Bonus: Store transId and metadata)
            booking.paymentStatus = 'Paid';
            booking.paymentMethod = 'Khalti';
            booking.transactionId = pidx; // Storing pidx as transaction ID
            booking.paymentDetails = {
                pidx: response.data.pidx,
                total_amount: response.data.total_amount,
                khalti_transaction_id: response.data.transaction_id,
                verified_at: new Date()
            };
            await booking.save();

            // 5. Notify the Professional (Live Sync)
            if (booking.professionalId) {
                try {
                    const prof = await Professional.findById(booking.professionalId);
                    if (prof && prof.userId) {
                        await createNotification(
                            prof.userId,
                            "success",
                            "Payment Received! 💰",
                            `Payment of NPR ${response.data.total_amount / 100} verified via Khalti for mission: ${booking.serviceTitle}.`,
                            "/professional-dashboard"
                        );
                    }
                } catch (notifErr) {
                    console.error("⚠️ Failed to broadcast payment notification");
                }
            }

            return res.status(200).json({
                success: true,
                message: "Transaction verified and recorded in Neural Network.",
                data: booking
            });
        } else {
            // Handle Expired/Pending/Failed States as requested
            return res.status(400).json({
                success: false,
                message: `Payment verification failed. Current Status: ${response.data?.status || 'Unknown'}`,
                status: response.data?.status
            });
        }

    } catch (error) {
        console.error("❌ Khalti Verification Failed:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Neural Relay Failure during verification",
            error: error.response?.data || error.message
        });
    }
};

/**
 * eSewa Payment Integration (ePay v2)
 * Initiate Payment, Verify Signature and Handle Success Redirect
 */

export const initiateEsewaPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;

        console.log("🔵 eSewa Initiation Started");
        console.log("📍 Booking ID:", bookingId);

        if (!bookingId) {
            console.error("❌ No Booking ID provided");
            return res.status(400).json({ success: false, message: "Booking ID is required" });
        }

        console.log("🔍 Fetching booking from database...");
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            console.error("❌ Booking not found:", bookingId);
            return res.status(404).json({ success: false, message: "Mission mission not found" });
        }

        console.log("✅ Booking found:", {
            _id: booking._id,
            serviceTitle: booking.serviceTitle,
            totalCost: booking.totalCost
        });

        // eSewa takes Rupees (NPR)
        const costStr = booking.totalCost || "रू 0.00";
        
        // Extract numeric value from string like "रू 1200.00"
        let amount = 0;
        if (typeof costStr === 'string') {
            // Remove all non-numeric characters except decimal point
            const numericStr = costStr.replace(/[^\d.]/g, '');
            amount = parseFloat(numericStr) || 0;
        } else if (typeof costStr === 'number') {
            amount = costStr;
        }

        if (amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount for eSewa transaction. Amount must be greater than 0." });
        }

        // eSewa minimum amount is 1 NPR
        if (amount < 1) {
            return res.status(400).json({ success: false, message: "eSewa minimum transaction amount is NPR 1. Current amount: " + amount });
        }

        // UNIQUE Transaction ID
        const transaction_uuid = `${bookingId}-${Date.now()}`;
        const product_code = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";

        console.log("📊 eSewa Payment Details:", {
            amount,
            costStr,
            transaction_uuid,
            product_code,
            bookingId: booking._id
        });

        // Generate Signature: total_amount=<amount>,transaction_uuid=<uuid>,product_code=EPAYTEST
        const signature_message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        const signature = crypto
            .createHmac("sha256", process.env.ESEWA_SECRET_KEY)
            .update(signature_message)
            .digest("base64");

        // Save transaction ID in booking mission
        booking.transactionId = transaction_uuid;
        await booking.save();

        // Prepare Payload exactly as required by eSewa
        const payload = {
            amount: amount,
            tax_amount: 0,
            total_amount: amount,
            transaction_uuid,
            product_code,
            product_service_charge: 0,
            product_delivery_charge: 0,
            success_url: `${process.env.BACKEND_BASE_URL}/api/payments/esewa/verify`,
            failure_url: `${process.env.BACKEND_BASE_URL}/api/payments/esewa/failure`,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature
        };

        console.log("✅ eSewa Payload Ready:", {
            amount,
            total_amount: amount,
            transaction_uuid,
            product_code,
            signature,
            success_url: `${process.env.BACKEND_BASE_URL}/api/payments/esewa/verify`,
            failure_url: `${process.env.BACKEND_BASE_URL}/api/payments/esewa/failure`
        });

        res.status(200).json({
            success: true,
            payload
        });

    } catch (error) {
        console.error("❌ eSewa Initiation Error:", error.message);
        console.error("Error Stack:", error.stack);
        console.error("Error Details:", {
            message: error.message,
            code: error.code,
            bookingId: req.body.bookingId
        });
        res.status(500).json({ 
            success: false, 
            message: "Neural gateway failure: eSewa Initiation blocked.",
            error: error.message
        });
    }
};

export const verifyEsewaPayment = async (req, res) => {
    try {
        const { data } = req.query; // eSewa sends Base64 encoded JSON in 'data' query param

        if (!data) {
            return res.redirect(`${process.env.CLIENT_BASE_URL}/payment/verify?status=failed&msg=Missing_data`);
        }

        // Decode Base64 data from eSewa
        const decodedString = Buffer.from(data, "base64").toString("utf-8");
        const esewaResponse = JSON.parse(decodedString);

        console.log("📥 eSewa Response Pulse:", esewaResponse.status, esewaResponse.transaction_uuid);

        const { transaction_code, status, total_amount, transaction_uuid, product_code, signature, signed_field_names } = esewaResponse;

        // 1. Signature Verification (eSewa v2 Response Format)
        // Format: transaction_code=<tc>,status=<st>,total_amount=<ta>,transaction_uuid=<uuid>,product_code=<pc>,signed_field_names=<sfn>
        const signature_message = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code},signed_field_names=${signed_field_names}`;
        
        const local_signature = crypto
            .createHmac("sha256", process.env.ESEWA_SECRET_KEY)
            .update(signature_message)
            .digest("base64");

        let isSignatureValid = (local_signature === signature);
        
        if (!isSignatureValid) {
            console.warn("⚠️ eSewa Signature Mismatch! Falling back to Status Lookup API for security verification...");
        }

        // 2. eSewa Status Lookup API (Authoritative Source)
        // We call this regardless of signature if we want absolute certainty, 
        // OR as a fallback if the signature mismatches due to formatting quirks.
        try {
            const statusResponse = await axios.get(
                `${process.env.ESEWA_BASE_URL}/api/epay/transaction/status/`,
                {
                    params: {
                        product_code,
                        total_amount,
                        transaction_uuid
                    }
                }
            );

            console.log("🔍 eSewa Status Lookup Result:", statusResponse.data.status);

            if (statusResponse.data.status === "COMPLETE") {
                const bookingId = transaction_uuid.split("-")[0];
                const booking = await Booking.findById(bookingId);

                if (booking) {
                    booking.paymentStatus = 'Paid';
                    booking.paymentMethod = 'eSewa';
                    booking.transactionId = transaction_uuid;
                    booking.paymentDetails = {
                        esewa_transaction_code: transaction_code,
                        verified_at: new Date(),
                        signature_verified: isSignatureValid
                    };
                    await booking.save();

                    if (booking.professionalId) {
                        try {
                            const prof = await Professional.findById(booking.professionalId);
                            if (prof && prof.userId) {
                                await createNotification(
                                    prof.userId,
                                    "success",
                                    "Payment Received! 💰",
                                    `Verified NPR ${total_amount} via eSewa for mission: ${booking.serviceTitle}.`,
                                    "/professional-dashboard"
                                );
                            }
                        } catch (e) {}
                    }

                    return res.redirect(`${process.env.CLIENT_BASE_URL}/payment/verify?status=success&bookingId=${bookingId}`);
                }
            } else {
                console.error("❌ eSewa Status Lookup failed or incomplete:", statusResponse.data.status);
            }
        } catch (lookupError) {
            console.error("❌ eSewa Status Lookup API unreachable:", lookupError.message);
            // If signature was valid but lookup failed (network?), we might still consider it failed for safety
            if (!isSignatureValid) {
                return res.redirect(`${process.env.CLIENT_BASE_URL}/payment/verify?status=failed&msg=Verification_failed`);
            }
        }

        res.redirect(`${process.env.CLIENT_BASE_URL}/payment/verify?status=failed`);

    } catch (error) {
        console.error("❌ eSewa Verification Pulse Failure:", error.message);
        res.redirect(`${process.env.CLIENT_BASE_URL}/payment/verify?status=failed`);
    }
};

export const esewaFailure = async (req, res) => {
    res.redirect(`${process.env.CLIENT_BASE_URL}/payment/verify?status=failed`);
};
