# 📧 Guide de Configuration - Validation d'Emails Réels

## Vue d'ensemble

Ce système garantit que **tous les emails utilisés dans l'application sont réels et vérifiés par l'utilisateur**. Lors de l'enregistrement, un email de vérification est envoyé automatiquement, et l'utilisateur ne peut se connecter qu'après avoir vérifié son adresse.

---

## 🔧 Configuration du Backend

### 1. Installation des dépendances

```bash
cd fixtrack-backend
npm install
```

### 2. Variables d'environnement

Créez un fichier `.env` à la racine du backend avec la configuration SMTP:

```env
# ── Base de données ────────────────────
MONGODB_URI=mongodb://localhost:27017/fixtrack
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# ── Frontend URL (pour les liens dans les emails) ────────────────────
FRONTEND_URL=http://localhost:5173

# ── Configuration Email (SMTP) ────────────────────

# Option 1: Gmail (Test rapide)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@example.com

# Option 2: Office 365
# EMAIL_HOST=smtp-mail.outlook.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=your-email@company.com
# EMAIL_PASS=your-password
# EMAIL_FROM=your-email@company.com

# Option 3: SendGrid
# EMAIL_HOST=smtp.sendgrid.net
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=apikey
# EMAIL_PASS=SG.your-api-key-here
# EMAIL_FROM=noreply@company.com
```

### 3. Configuration Gmail (recommandé pour test)

1. Allez sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sélectionnez l'appareil et le type "Mail"
3. Générez un mot de passe d'application (16 caractères)
4. Utilisez ce mot de passe pour `EMAIL_PASS` dans `.env`

### 4. Démarrer le backend

```bash
npm run dev
```

---

## 🌐 Configuration du Frontend

### 1. Installation des dépendances

```bash
cd fixtrack-frontend
npm install
```

### 2. Fichier de configuration

Assurez-vous que `.env.local` ou `vite.config.js` pointe vers le bon backend:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Démarrer le frontend

```bash
npm run dev
```

---

## 📋 Flux d'enregistrement et vérification

### Scénario: Un nouvel utilisateur s'inscrit

#### 1️⃣ **Enregistrement (POST /api/auth/register)**

```
Utilisateur remplit le formulaire:
├─ Nom: "Jean Dupont"
├─ Email: "jean@company.com"  ← Validation de format
├─ Mot de passe: "SecurePass123"
└─ Rôle: "user"

✅ Backend:
  ├─ Valide l'email (regex + format)
  ├─ Crée l'utilisateur avec emailVerified: false
  ├─ Génère un token de vérification (32 bytes, hashé)
  ├─ Expire dans 24h
  └─ Envoie un email de vérification
```

#### 2️⃣ **Email de vérification reçu**

```
De: noreply@company.com
Sujet: Vérifiez votre adresse email - Fixtrack

Contenu:
├─ Bouton: "Vérifier mon email"
└─ Lien: http://localhost:5173/verify-email?token=abc123...

Ou: Renvoyer le code si absent
```

#### 3️⃣ **Vérification du token (POST /api/auth/verify-email)**

```
Utilisateur clique sur le lien ou entre le code manuellement

Backend:
├─ Valide le token (hash, expiration)
├─ Marque l'email comme vérifié
├─ Efface le token
└─ Redirige vers /login

✅ Utilisateur peut maintenant se connecter
```

#### 4️⃣ **Connexion (POST /api/auth/login)**

```
Utilisateur saisit:
├─ Email: "jean@company.com"
└─ Mot de passe: "SecurePass123"

❌ Si emailVerified = false:
   └─ Réponse: { emailNotVerified: true, requiresEmailVerification: true }
   └─ Page propose de renvoyer l'email

✅ Si emailVerified = true:
   ├─ Valide le mot de passe
   ├─ Génère JWT token
   └─ Connecte l'utilisateur
```

---

## 📱 Pages et Routes

### Frontend Routes

| Route               | Usage              | Authentification |
| ------------------- | ------------------ | ---------------- |
| `/login`            | Login/Register     | Public           |
| `/verify-email`     | Vérification email | Public           |
| `/{role}/dashboard` | Pages principales  | Privé ✔️         |

### Backend Endpoints

#### Auth endpoints

```
POST   /api/auth/register                  → Créer compte + envoyer email
POST   /api/auth/login                     → Se connecter (vérifié)
POST   /api/auth/verify-email              → Vérifier token
POST   /api/auth/resend-verification       → Renvoyer email (rate-limited)
GET    /api/auth/me                        → Infos utilisateur (token requis)
```

---

## 🔐 Champs du modèle User (MongoDB)

```javascript
{
  _id: ObjectId,
  nom: String,
  email: String (unique, lowercase, validated),
  password: String (hashed),
  role: String (user|technician|manager|admin),
  avatar: String,
  telephone: String,
  competences: [String],

  // ── NEW: Vérification Email ────────────────────
  emailVerified: Boolean (default: false),
  emailVerificationToken: String (hashed),
  emailVerificationTokenExpires: Date (24h),
  emailVerificationSentAt: Date,

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## 💡 Cas d'usage et gestion des erreurs

### Cas 1: Email déjà utilisé

```
POST /auth/register avec email existant
├─ Response: { message: "Cet email est déjà utilisé", emailAlreadyExists: true }
└─ Frontend: Propose de vérifier l'email ou réinitialiser le mot de passe
```

### Cas 2: Email ne peut pas être envoyé

```
Si le serveur SMTP est non configuré:
├─ Response: { message: "Impossible d'envoyer l'email...", emailSendError: true }
├─ Utilisateur est SUPPRIMÉ de la DB (avoid dead accounts)
└─ Frontend: Propose de réessayer avec une autre adresse
```

### Cas 3: Token expiré

```
Utilisateur clique sur un lien après 24h:
├─ POST /auth/verify-email
├─ Response: { message: "Token expiré", tokenExpired: true }
└─ Page: Propose "Renvoyer l'email"

POST /auth/resend-verification
├─ Rate limiting: Max 1 email tous les 5 minutes
└─ Génère un nouveau token (24h)
```

### Cas 4: Tentative de connexion sans vérification

```
POST /auth/login avec emailVerified: false
├─ Response: { emailNotVerified: true, requiresEmailVerification: true }
├─ Frontend: Affiche "Vérifiez votre email"
└─ Propose de renvoyer l'email ou d'entrer le code manuellement
```

---

## 📊 Validation des Emails

### 1. Validation syntaxique (Backend)

```javascript
// Regex stricte
/^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Exemples valides:
✅ user@company.com
✅ firstname.lastname@company.co.uk
✅ user+tag@domain.org

// Exemples invalides:
❌ user@domain        (pas de TLD)
❌ @domain.com        (pas d'username)
❌ user @domain.com   (espace)
```

### 2. Validation uniqueness

```
- Email UNIQUE dans la DB (champ unique MongoDB)
- Normalisé: toLowerCase().trim()
```

### 3. Vérification propriétaire email

```
Utilisateur DOIT cliquer sur le lien dans son email
- Seul le propriétaire a accès à sa boîte email
- Pas de faux emails = pas de compte créé sans accès
```

---

## 🛠️ Développement et Testing

### Mode de développement (dés activation optionnelle)

Si vous voulez **tester sans envoyer d'emails** pendant le développement:

```javascript
// Dans authController.js register():
if (
  process.env.NODE_ENV === "development" &&
  process.env.SKIP_EMAIL_VERIFICATION === "true"
) {
  user.emailVerified = true;
  await user.save();

  // Retourner token immédiatement
} else {
  // Comportement normal: envoyer email
}
```

Ajouter à `.env`:

```
NODE_ENV=development
SKIP_EMAIL_VERIFICATION=true   # Seulement pour dev/test
```

### Test d'envoi d'email

```bash
# Vérifier que Nodemailer fonctionne
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test User",
    "email": "test@gmail.com",
    "password": "TestPass123",
    "role": "user"
  }'

# Vérifier votre boîte email
```

---

## 📝 Notes importantes

### ⚠️ Sécurité

- Les tokens de vérification sont **hashés** en DB (pas stockés en clair)
- Chaque email ne peut être vérifié qu'une seule fois
- Le token expire après **24h**
- Rate limiting sur le renvoi (1 email tous les 5 minutes)
- Les comptes sans vérification sont supprimés après 24h (optionnel)

### 🚀 Performance

- Envoi d'emails **asynchrone** (non-bloqu ant)
- Pas de vérification SMTP coûteuse
- Validation simple et rapide

### 📧 Emails envoyés par le système

1. **Email de vérification** (lors de register)
2. **Email de bienvenue** (après vérification)
3. ~~Réinitialisation de mot de passe~~ (futur)
4. ~~Notifications de tickets~~ (futur)

---

## ✅ Checklist de déploiement

- [ ] **Nodemailer installé** (`npm install`)
- [ ] **Variables .env configurées** (EMAIL_HOST, EMAIL_USER, EMAIL_PASS, etc.)
- [ ] **Backend démarré** et fonctionnel
- [ ] **Frontend démarre** vers http://localhost:5173
- [ ] **Test d'enregistrement**: Peut recevoir un email
- [ ] **Test de vérification**: Peut cliquer sur le lien
- [ ] **Test de connexion**: Peut se connecter après vérification
- [ ] **Test d'erreur**: Impossible de se connecter sans vérification

---

## 🆘 Troubleshooting

### Problème: "Impossible d'envoyer l'email"

```
❌ EMAIL_HOST/EMAIL_USER/EMAIL_PASS non configurés
  └─ Solution: Vérifier les variables .env

❌ Pare-feu/VPN bloque le port SMTP
  └─ Solution: Utiliser port 587 au lieu de 465

❌ Compte Gmail: "Sign in blocked"
  └─ Solution: Créer un App Password (https://myaccount.google.com/apppasswords)
```

### Problème: "Token invalide"

```
❌ Token a expiré (après 24h)
  └─ Solution: Proposer /auth/resend-verification

❌ Lien d'email altéré
  └─ Solution: Vérifier le lien construis dans emailService.js
```

### Problème: "Email déjà utilisé"

```
❌ Email enregistré mais pas encore vérifié
  └─ Solution: Proposer de renvoyer l'email ou réinitialiser mot de passe

❌ Email utilisé par autre compte
  └─ Solution: Vérifier avec administrateur
```

---

## 📚 Ressources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Express Validator](https://express-validator.github.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [OWASP Email Validation](https://owasp.org/www-community/attacks/Email_Spoofing)

---

**Version**: 1.0  
**Date**: 2025-03-31  
**Auteur**: Team FixTrack
