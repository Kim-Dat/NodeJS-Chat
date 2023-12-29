const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthCtrl");
const asyncHandler = require("express-async-handler");
/* handle router*/
router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));

module.exports = router;
