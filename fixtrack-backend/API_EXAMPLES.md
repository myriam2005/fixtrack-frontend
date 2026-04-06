# 🔌 Exemples API - Email Validation

Des exemples complets de tous les endpoints pour tester le système de validation d'emails.

---

## 🔒 Base

**URL de base**: `http://localhost:5000/api`

**Headers standard**:

```json
{
  "Content-Type": "application/json"
}
```

---

## 📝 1. Enregistrement (POST /auth/register)

**Request**:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Jean Dupont",
    "email": "jean.dupont@company.com",
    "password": "SecurePassword123",
    "role": "user",
    "telephone": "+216 22 000 111",
    "competences": ["JavaScript", "React"]
  }'
```

**Response (Succès 201)**:

```json
{
  "message": "Inscription réussie! Un email de vérification a été envoyé.",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "nom": "Jean Dupont",
    "email": "jean.dupont@company.com",
    "role": "user",
    "avatar": "JD",
    "emailVerified": false
  },
  "requiresEmailVerification": true
}
```

**Response (Erreur: Email existe déjà)**:

```json
{
  "message": "Cet email est déjà utilisé",
  "emailAlreadyExists": true
}
```

**Response (Erreur: Impossible envoyer email)**:

```json
{
  "message": "Impossible d'envoyer l'email de vérification. Veuillez réessayer.",
  "emailSendError": true
}
```

---

## ✉️ 2. Renvoyer Email de Vérification (POST /auth/resend-verification)

**Cas**: L'utilisateur n'a pas reçu l'email ou le token a expiré.

**Request**:

```bash
curl -X POST http://localhost:5000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@company.com"
  }'
```

**Response (Succès 200)**:

```json
{
  "message": "Email de vérification renvoyé avec succès"
}
```

**Response (Erreur: Compte déjà vérifié)**:

```json
{
  "message": "Cet email est déjà vérifié",
  "alreadyVerified": true
}
```

**Response (Erreur: Rate Limited)**:

```json
{
  "message": "Veuillez attendre 5 minutes avant de renvoyer l'email",
  "rateLimited": true
}
```

---

## 🔐 3. Vérifier Email (POST /auth/verify-email)

Deux approches: via lien d'email ou token manuel.

### Approche A: Via lien d'email (automatic)

L'utilisateur reçoit dans son email:

```
Cliquez ici: http://localhost:5173/verify-email?token=abc123def456...
```

Le frontend extrait le token et appelle:

**Request**:

```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456xyz789..."
  }'
```

### Approche B: Via formulaire manuel

L'utilisateur saisit le token dans le formulaire sur `/verify-email`.

**Request**:

```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456xyz789..."
  }'
```

**Response (Succès 200)**:

```json
{
  "message": "Email vérifié avec succès!",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "nom": "Jean Dupont",
    "email": "jean.dupont@company.com",
    "role": "user",
    "emailVerified": true
  }
}
```

**Response (Erreur: Token invalide)**:

```json
{
  "message": "Token invalide ou expiré",
  "tokenInvalid": true
}
```

**Response (Erreur: Token expiré)**:

```json
{
  "message": "Token expiré. Veuillez en demander un nouveau.",
  "tokenExpired": true
}
```

---

## 🔓 4. Connexion (POST /auth/login)

### Cas A: Email non vérifié

**Request**:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@company.com",
    "password": "SecurePassword123"
  }'
```

**Response (Erreur 403: Email non vérifié)**:

```json
{
  "message": "Veuillez vérifier votre email avant de vous connecter",
  "emailNotVerified": true,
  "userId": "507f1f77bcf86cd799439011",
  "requiresEmailVerification": true
}
```

Le frontend redirige vers `/verify-email`.

### Cas B: Email vérifié ✅

**Request** (même que avant):

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@company.com",
    "password": "SecurePassword123"
  }'
```

**Response (Succès 200)**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcxMT4...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "nom": "Jean Dupont",
    "email": "jean.dupont@company.com",
    "role": "user",
    "avatar": "JD",
    "competences": ["JavaScript", "React"],
    "telephone": "+216 22 000 111",
    "emailVerified": true
  }
}
```

Le frontend stocke le token et l'utilisateur dans localStorage, puis redirige vers le dashboard.

**Response (Erreur: Identifiants invalides)**:

```json
{
  "message": "Email ou mot de passe incorrect"
}
```

---

## 👤 5. Récupérer Infos Utilisateur (GET /auth/me)

**Requirement**: Token JWT dans le header.

**Request**:

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (Succès 200)**:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "nom": "Jean Dupont",
  "email": "jean.dupont@company.com",
  "role": "user",
  "avatar": "JD",
  "competences": ["JavaScript", "React"],
  "telephone": "+216 22 000 111",
  "actif": true,
  "emailVerified": true
}
```

**Response (Erreur: Unauthorized)**:

```json
{
  "message": "Not authorized to access this route"
}
```

---

## 📊 Exemples Pratiques Completes

### Scénario 1: Utilisateur Neuf

**Étape 1**: Enregistrement

```bash
# L'utilisateur s'inscrit
POST /auth/register
{
  "nom": "Alice Martin",
  "email": "alice@example.com",
  "password": "Pass123!",
  "role": "user"
}
# ← Reçoit: { emailVerified: false, requiresEmailVerification: true }
# ← Email envoyé à alice@example.com
```

**Étape 2**: Vérification

```bash
# Alice reçoit l'email avec le lien:
# http://localhost:5173/verify-email?token=abc123...

# Ou manuellement, elle entre le token:
POST /auth/verify-email
{
  "token": "abc123..."
}
# ← Reçoit: { emailVerified: true }
```

**Étape 3**: Connexion

```bash
POST /auth/login
{
  "email": "alice@example.com",
  "password": "Pass123!"
}
# ← Reçoit: { token: "...", user: { emailVerified: true } }
# ← Stocké dans localStorage
# ← Redirigé vers /user/dashboard
```

---

### Scénario 2: Email Non Reçu

**Étape 1**: L'utilisateur s'enregistre

```bash
POST /auth/register { ... }
# ← Email censé être envoyé
```

**Étape 2**: Pas d'email dans boîte

```bash
# Utilisateur clique "Renvoyer l'email"
POST /auth/resend-verification
{
  "email": "alice@example.com"
}
# ← Reçoit: { message: "Email renvoyé avec succès" }
# ← Nouvel email envoyé (attendu 5 min pour renvoyer)
```

**Étape 3**: Vérification manuelle (si lien cassé)

```bash
# Au au lieu de cliquer le lien, saisit token manuellement dans le form:
POST /auth/verify-email
{
  "token": "abc123..."  ← Copié de l'email
}
# ← Succès!
```

---

### Scénario 3: Compte Existant Essaye S'Inscrire

**Request**:

```bash
POST /auth/register
{
  "nom": "John Doe",
  "email": "jean.dupont@company.com",  ← Existe déjà!
  "password": "Password123",
  "role": "user"
}
```

**Response**:

```json
{
  "message": "Cet email est déjà utilisé",
  "emailAlreadyExists": true
}
```

Le frontend propose:

- Essayer un autre email
- Connexion si compte déjà vérifié
- "Mot de passe oublié?" si mot de passe perdu

---

## 🧪 Tests Rapides (BASH Scripts)

### Test 1: Enregistrement Complet

```bash
#!/bin/bash

# Variables
API="http://localhost:5000/api"
EMAIL="test-$(date +%s)@example.com"
PASS="TestPassword123"

# 1. Enregistrement
echo "→ Enregistrement..."
REGISTER=$(curl -s -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"nom\": \"Test User\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASS\",
    \"role\": \"employee\"
  }")

echo $REGISTER | jq '.'

# 2. Extract user ID (optional for later)
USER_ID=$(echo $REGISTER | jq -r '.user.id')
echo "User ID: $USER_ID"

# 3. Essayer login sans vérification
echo "→ Tentative login avant vérification..."
LOGIN=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASS\"
  }")

echo $LOGIN | jq '.'
# ← Doit retourner: { emailNotVerified: true, requiresEmailVerification: true }
```

### Test 2: Renvoyer Email

```bash
#!/bin/bash

API="http://localhost:5000/api"
EMAIL="test@example.com"  # Changez avec votre email de test

echo "→ Renvoyer email de vérification..."
curl -s -X POST $API/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\"
  }" | jq '.'
```

### Test 3: Vérifier Token

```bash
#!/bin/bash

API="http://localhost:5000/api"
TOKEN="abc123def456..."  # Token reçu par email

echo "→ Vérifier token..."
curl -s -X POST $API/auth/verify-email \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$TOKEN\"
  }" | jq '.'
```

---

## 🐛 Codes HTTP et Erreurs

| Code | Situation               | Action                              |
| ---- | ----------------------- | ----------------------------------- |
| 201  | Enregistrement succès   | Renvoyer email vérification         |
| 200  | Vérification succès     | Rediriger login                     |
| 200  | Login succès            | Stocker token + rediriger dashboard |
| 400  | Email déjà utilisé      | Proposer autre email                |
| 400  | Format email invalide   | Valider format                      |
| 400  | Token invalide/expiré   | Proposer renvoyer email             |
| 403  | Email non vérifié       | Proposer vérification               |
| 401  | Identifiants incorrects | Afficher erreur                     |
| 401  | Compte désactivé        | Contacter admin                     |
| 429  | Rate limit (resend)     | Attendre 5 min                      |
| 500  | Erreur serveur          | Afficher message + logs             |

---

## 📧 Format Email Reçu par Utilisateur

### Email de Vérification

```
From: noreply@fixtrack.local
To: jean.dupont@company.com
Subject: Vérifiez votre adresse email - Fixtrack

---

🔐 Vérification d'email
Finalisez votre inscription

Bonjour Jean Dupont,

Merci de vous être inscrit sur Fixtrack.
Pour finaliser votre inscription, veuillez vérifier votre adresse email
en cliquant sur le bouton ci-dessous.

Ce lien expire dans 24 heures.

[✓ VÉRIFIER MON EMAIL]
http://localhost:5173/verify-email?token=abc123...

Si le bouton ne fonctionne pas, copiez et collez:
http://localhost:5173/verify-email?token=abc123...

⚠️ Sécurité: Si vous n'avez pas créé ce compte, ignorez cet email.

---
© 2025 Fixtrack
```

---

## ✅ Points de Validation Clés

- ✅ Email valide (format regex)
- ✅ Email unique (MongoDB unique constraint)
- ✅ Token généré et hashé (SHA256)
- ✅ Token a expiration (24h)
- ✅ Rate limiting (5 min entre resends)
- ✅ EmailVerified doit être true pour login
- ✅ Logs d'audit créés (EMAIL_VERIFIED)

---

**Tous les exemples fournis ci-dessus fonctionnent avec les endpoints réels.**
