const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token = req.headers?.authorization || "";

  if (token && token.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        status: "Error",
        message: "Not authorized to access this route error",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: "Error",
      message: "Not authorized to access this route",
    });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['Admin']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        res.status(403).json({
          status: "Error",
          message: "You do not have permission to perform this action",
        })
      );
    }

    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
