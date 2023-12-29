const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const userController = require("../controllers/UserCtrl");
const { protect } = require("../middlewares/authMiddleware");
router.get("/", protect, asyncHandler(userController.allUsers));
router.patch("/update-password", protect, asyncHandler(userController.updatePassword));

module.exports = router;
