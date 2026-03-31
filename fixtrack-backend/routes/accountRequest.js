// routes/accountRequest.js
// Route PUBLIQUE — pas de middleware auth
const express = require("express");
const router = express.Router();
const {
  submitAccountRequest,
} = require("../controllers/accountRequestController");

// POST /api/account-request
router.post("/", submitAccountRequest);

module.exports = router;
