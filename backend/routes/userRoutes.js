const express = require("express");
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  logoutUser,
  loginUser,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, restrictTo("Admin"), getAllUsers)
  .post(protect, restrictTo("Admin"), createUser);
router
  .route("/:id")
  .get(protect, getUser)
  .patch(protect, updateUser)
  .delete(protect, restrictTo("Admin"), deleteUser);
router.post("/logout", protect, logoutUser);
router.post("/login", loginUser);

module.exports = router;
