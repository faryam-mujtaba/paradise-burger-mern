const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not allowed to access this route.",
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };