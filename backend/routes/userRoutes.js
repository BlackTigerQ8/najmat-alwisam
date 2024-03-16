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
const { contractUpload } = require("./uploadRoutes");

const router = express.Router();

router
  .route("/")
  .get(protect, getAllUsers)
  .post(
    protect,
    restrictTo("Admin", "Manager"),
    contractUpload.single("uploadedFile"),
    createUser
  );
router
  .route("/:id")
  .get(protect, getUser)
  .patch(
    protect,
    restrictTo("Admin", "Manager"),
    contractUpload.single("uploadedFile"),
    updateUser
  )
  .delete(protect, restrictTo("Admin", "Manager"), deleteUser);
router.post("/logout", protect, logoutUser);
router.post("/login", loginUser);

module.exports = router;
