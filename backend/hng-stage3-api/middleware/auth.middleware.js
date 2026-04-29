const jwt = require("jsonwebtoken");

/**
 * =========================
 * AUTHENTICATION MIDDLEWARE
 * =========================
 * Verifies JWT and attaches user to req.user
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      status: "error",
      message: "Missing Authorization header",
    });
  }

  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Invalid Authorization format",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
}

/**
 * =========================
 * ROLE-BASED ACCESS CONTROL
 * =========================
 * Usage: authorize("admin") or authorize("admin", "analyst")
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
