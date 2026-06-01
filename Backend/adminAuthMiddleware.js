import jwt from 'jsonwebtoken';

// Validate JWT_SECRET on module load
if (!process.env.JWT_SECRET) {
  console.warn("⚠️  WARNING: JWT_SECRET not set in environment variables. Using fallback (not secure for production).");
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

/**
 * Middleware to verify JWT token and attach user to request
 */
export const verifyAdminToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to check admin role
 */
export const checkAdminRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access required'
    });
  }

  next();
};

/**
 * Middleware to check specific permission
 */
export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!req.user.permissions?.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${requiredPermission}' required`
      });
    }

    next();
  };
};
