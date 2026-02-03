# MCP Server Exercice - Serveur d'Outils Utilitaires

Serveur MCP avec 8 outils pratiques créé pour l'exercice de fin de tutoriel.

## 🚀 Installation

```bash
cd mcp-server-exercice
npm install
npm run build
```

## 🎯 Outils Disponibles

### 1. **generate-password** - Générateur de Mots de Passe

Génère des mots de passe sécurisés avec options personnalisables.

**Paramètres:**

- `length` (8-128) : Longueur du mot de passe
- `includeNumbers` : Inclure des chiffres
- `includeSymbols` : Inclure des caractères spéciaux
- `includeUppercase` : Inclure des majuscules
- `includeLowercase` : Inclure des minuscules

**Exemple:**

```json
{
  "length": 20,
  "includeNumbers": true,
  "includeSymbols": true,
  "includeUppercase": true,
  "includeLowercase": true
}
```

---

### 2. **validate-email** - Validateur d'Email

Valide une adresse email avec vérifications détaillées.

**Paramètres:**

- `email` : L'adresse email à valider

**Exemple:**

```json
{
  "email": "test@example.com"
}
```

---

### 3. **shorten-url** - Raccourcisseur d'URL

Génère une URL raccourcie avec stockage en mémoire.

**Paramètres:**

- `url` : L'URL à raccourcir
- `customCode` (optionnel) : Code personnalisé (4-10 caractères)

**Exemple:**

```json
{
  "url": "https://www.example.com/very/long/url/path",
  "customCode": "mylink"
}
```

---

### 4. **get-url** - Récupérer URL Originale

Récupère l'URL originale depuis un code raccourci.

**Paramètres:**

- `code` : Le code de l'URL raccourcie

**Exemple:**

```json
{
  "code": "mylink"
}
```

---

### 5. **get-system-info** - Informations Système

Récupère les informations du système (OS, CPU, mémoire, etc.).

**Paramètres:**

- `detailed` (optionnel) : Mode détaillé avec infos complètes

**Exemple:**

```json
{
  "detailed": true
}
```

---

### 6. **generate-uuid** - Générateur d'UUID

Génère un ou plusieurs UUID v4.

**Paramètres:**

- `count` (1-100) : Nombre d'UUIDs à générer

**Exemple:**

```json
{
  "count": 5
}
```

---

### 7. **base64-encode** - Encodeur Base64

Encode une chaîne de caractères en base64.

**Paramètres:**

- `text` : Le texte à encoder

**Exemple:**

```json
{
  "text": "Hello World!"
}
```

---

### 8. **base64-decode** - Décodeur Base64

Décode une chaîne base64 en texte.

**Paramètres:**

- `encoded` : Le texte en base64 à décoder

**Exemple:**

```json
{
  "encoded": "SGVsbG8gV29ybGQh"
}
```

---

## 📝 Utilisation avec le Client CLI

```bash
# Depuis la racine du projet
cd ../mcp-client
npm run build

# Lancer le client avec ce serveur
node build/client.js ../mcp-server-exercice/build/index.js
```

**Exemples de requêtes:**

- "Génère-moi un mot de passe de 16 caractères"
- "Valide l'email test@example.com"
- "Raccourcis l'URL https://www.google.com"
- "Quelles sont les informations de mon système?"
- "Génère-moi 3 UUIDs"
- "Encode 'Bonjour le monde' en base64"

---

## 📝 Utilisation avec le Serveur Web

```bash
# Configurer le serveur dans mcp-client
cd ../mcp-client

# Créer un fichier .env si nécessaire
echo "MCP_SERVER_SCRIPT=../mcp-server-exercice/build/index.js" > .env

# Lancer le serveur web
node webServer.js
```

Ouvrir http://localhost:3000 dans le navigateur.

---

## 🏗️ Structure du Projet

```
mcp-server-exercice/
├── src/
│   └── index.ts          # Code source principal
├── build/
│   └── index.js          # Code compilé
├── package.json
├── tsconfig.json
└── README.md
```

---

## ✨ Fonctionnalités Implémentées

✅ 8 outils utilitaires complets  
✅ Validation et gestion d'erreurs robuste  
✅ Stockage en mémoire pour URL shortener  
✅ Calcul de force de mot de passe  
✅ Informations système détaillées  
✅ Support TypeScript complet  
✅ Documentation complète

---

## 🎓 Concepts Utilisés

- **Server SDK**: Création d'un serveur MCP
- **Tool Handlers**: Gestion de 8 outils différents
- **Input Schemas**: Validation des paramètres
- **Error Handling**: Gestion des erreurs
- **Node.js APIs**: crypto, os, Buffer
- **TypeScript**: Typage fort et interfaces
- **State Management**: Map pour le stockage d'URLs

---

**Exercice complété avec succès! 🎉**
