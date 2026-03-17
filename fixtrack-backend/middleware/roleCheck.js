// middleware/roleCheck.js

/**
 * roleCheck(roles) — vérifie que l'utilisateur connecté a un rôle autorisé
 * Usage: router.get('/admin', auth, roleCheck(['admin']), controller)
 * Usage: router.post('/tickets', auth, roleCheck(['employee','manager','admin']), controller)
 */
const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé — rôle '${req.user.role}' non autorisé. Rôles requis : ${roles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = roleCheck;
