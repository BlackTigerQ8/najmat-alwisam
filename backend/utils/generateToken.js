const jwt = require("jsonwebtoken");

const generateToken = (res, userId) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set!");
    return;
  }
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "24",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
};

module.exports = generateToken;
