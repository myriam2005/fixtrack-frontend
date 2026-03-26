// routes/configRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/configController");

// GET    /api/config/categories          — tous les rôles authentifiés
router.get("/categories", auth, getCategories);

// POST   /api/config/categories          — admin seulement
router.post("/categories", auth, roleCheck(["admin"]), createCategory);

// PUT    /api/config/categories/:id      — admin seulement
// ✅ Renomme la catégorie ET met à jour tous les tickets liés
router.put("/categories/:id", auth, roleCheck(["admin"]), updateCategory);

// DELETE /api/config/categories/:id      — admin seulement
// ✅ Supprime la catégorie ET bascule les tickets vers "Non classé"
router.delete("/categories/:id", auth, roleCheck(["admin"]), deleteCategory);

module.exports = router;
