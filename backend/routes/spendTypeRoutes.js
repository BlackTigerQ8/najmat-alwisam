const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { getAllSpendTypes } = require("../controllers/spendTypeController");

const router = express.Router();

router.route("/").get(getAllSpendTypes);

module.exports = router;
