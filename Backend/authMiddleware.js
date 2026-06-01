import jwt from "jsonwebtoken";

// Validate JWT_SECRET on module load
if (!process.env.JWT_SECRET) {
  console.warn("⚠️  WARNING: JWT_SECRET not set in environment variables. Using fallback (not secure for production).");
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

/**
 * Middleware to verify JWT token
 * Named Export: verifyToken
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({
    success: false,
    message: "No token provided"
  });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
