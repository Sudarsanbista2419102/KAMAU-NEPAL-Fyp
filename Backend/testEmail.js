import dotenv from "dotenv";
dotenv.config();
import { sendOtpEmail } from "./utils/sendOtp.js";

sendOtpEmail("saugatbista45690@gmail.com", "123456")
  .then(() => console.log("Test OTP sent successfully"))
  .catch(err => console.log("Test OTP failed:", err));