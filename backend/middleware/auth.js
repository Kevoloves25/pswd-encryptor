// Simple authentication middleware for future use
const authenticate = (req, res, next) => {
  // For MVP, we don't need full authentication
  // This is a placeholder for future user accounts
  next();
};

const requireAuth = (req, res, next) => {
  // Placeholder for when we add user accounts
  next();
};

module.exports = {
  authenticate,
  requireAuth
};
