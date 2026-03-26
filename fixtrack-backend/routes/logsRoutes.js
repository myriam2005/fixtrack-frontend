// routes/logsRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { getLogs, deleteLogs } = require("../controllers/logsController");

router.get("/", auth, roleCheck(["admin"]), getLogs);
router.delete("/", auth, roleCheck(["admin"]), deleteLogs);

module.exports = router;
