const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { getAllPettyCash } = require("../controllers/pettyCashController");

const router = express.Router();

router.route("/").get(getAllPettyCash);

module.exports = router;
