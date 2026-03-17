// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
  getAllUsers,
  getTechnicians,
  getUserById,
  updateUserRole,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// GET /api/users/technicians  (managers + admins)
router.get(
  "/technicians",
  auth,
  roleCheck(["manager", "admin"]),
  getTechnicians,
);

// GET /api/users  (admin only)
router.get("/", auth, roleCheck(["admin"]), getAllUsers);

// GET /api/users/:id
router.get("/:id", auth, getUserById);

// PUT /api/users/:id/role  (admin only)
router.put("/:id/role", auth, roleCheck(["admin"]), updateUserRole);

// PUT /api/users/:id
router.put("/:id", auth, updateUser);

// DELETE /api/users/:id  (admin only — soft delete)
router.delete("/:id", auth, roleCheck(["admin"]), deleteUser);

module.exports = router;
