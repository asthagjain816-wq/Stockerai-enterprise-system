import User from '../models/User.js';

// ==========================================
// isAuthenticated Middleware
// Check if user is logged in
// ==========================================
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.user) {
    return next();
  }

  res.status(401).json({
    success: false,
    message: 'Please login to continue',
  });
};

// ==========================================
// checkPermission Middleware
// Check if user has required permission
// ==========================================
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      // Define permissions based on user role
      const permissions = {
        admin: [
          'canManageProducts',
          'canManageOrders',
          'canManageSuppliers',
          'canViewAnalytics',
          'canManageUsers',
        ],
        manager: [
          'canManageProducts',
          'canManageOrders',
          'canManageSuppliers',
          'canViewAnalytics',
        ],
        user: ['canViewProducts', 'canCreateOrders'],
      };

      // Check if user has permission
      if (permissions[user.role]?.includes(permission)) {
        return next();
      }

      res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    } catch (error) {
      next(error);
    }
  };
};

// ==========================================
// Error Handler Middleware
// ==========================================
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

export default isAuthenticated;