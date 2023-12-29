const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const asyncHandler = require("express-async-handler");
const messageController = require("../controllers/MessageCtrl");
const router = express.Router();

router.post("/", protect, asyncHandler(messageController.sendMessage));
router.get("/:chatId", protect, asyncHandler(messageController.allMessage));
module.exports = router;
