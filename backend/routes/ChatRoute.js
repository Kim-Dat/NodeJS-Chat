const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const chatController = require("../controllers/ChatCtrl");
const { protect } = require("../middlewares/authMiddleware");
router.post("/", protect, asyncHandler(chatController.accessChat));
router.get("/", protect, asyncHandler(chatController.fetChats));
router.post("/group", protect, asyncHandler(chatController.createGroupChat));
router.put("/rename", protect, asyncHandler(chatController.renameGroup));
router.put("/group-add", protect, asyncHandler(chatController.addToGroup));
router.put("/group-remove", protect, asyncHandler(chatController.removeFromGroup));

module.exports = router;
