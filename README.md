# 🚀 MCP Server - Apprentissage du Model Context Protocol

En suivant un tuto sur Udemy

## 📖 Description

Ce repository documente mon parcours d'apprentissage du **Model Context Protocol (MCP)** à travers une série de projets progressifs. Du serveur MCP le plus simple à des intégrations avancées avec bases de données et IoT, ce repo démontre comment créer des serveurs MCP capables d'étendre les capacités d'une IA avec des outils personnalisés.

### 🎯 Objectif du projet

Comprendre et maîtriser le **Model Context Protocol** pour :

- Connecter une IA à des sources de données externes (APIs, bases de données, IoT)
- Créer des outils découvrables dynamiquement par l'IA
- Différencier Tools et Resources dans l'écosystème MCP
- Implémenter un système d'authentification pour des outils premium
- Développer des clients MCP (CLI et Web)

---

## 🧠 MCP vs API REST : La différence fondamentale

### 🔥 Pourquoi MCP change la donne

**API REST traditionnelle :**

```
❌ Documentation manuelle nécessaire
❌ Configuration statique des routes
❌ Ajout d'outils = mise à jour de la documentation
```

**Serveur MCP :**

```
✅ Découverte dynamique des outils
✅ L'IA détecte automatiquement les nouveaux outils
✅ Pas de documentation externe à maintenir
✅ Transport STDIO, HTTP, Docker...
```

> **En résumé :** Un serveur MCP est un **intermédiaire intelligent** entre l'IA et vos sources de données, qui permet à l'IA de découvrir et d'utiliser des outils sans configuration manuelle.

---

## 🏗️ Architecture du repository

Le repository contient **plusieurs projets à difficulté croissante** :

### 📁 Structure globale

```
McpServerUdemyNelson-main/
│
├── MCP-BASIQUE/                    # 🟢 Premier serveur MCP simple
├── mcp-basique-protected/          # 🔐 Authentification & outils premium
│
├── mcp-meteo/                      # ☁️ Serveur météo (API Open-Meteo)
├── mcp-discord/                    # 💬 Webhook Discord (alertes/logs)
├── mcp-doc/                        # 📚 Documentation en temps réel
├── mcp-hue/                        # 💡 Contrôle IoT (Philips Hue)
├── mcp-db/                         # 🗄️ Interaction avec base de données
│
├── mcp-server-exercice/            # 🎓 Projet final (8 outils utilitaires)
│
├── mcp-client/                     # 🖥️ Client MCP (CLI + Web)
│   ├── client.ts                   # CLI avec readline
│   ├── webServer.js                # Interface web avec Express
│   └── public/                     # Frontend HTML/CSS/JS
│
└── db/                             # 📊 Base de données exemple
    ├── createDb.js
    └── server.js                   # API Express pour visualisation
```

---

## ✨ Projets réalisés

### 1️⃣ **MCP-BASIQUE** - Premier contact

- Serveur MCP minimaliste
- Compréhension du protocole STDIO
- Découverte des capacités (tools, resources)

### 2️⃣ **mcp-basique-protected** - Sécurité & authentification 🔐

**Fonctionnalités :**

- `reverse-word` : Outil **PUBLIC** (inverse du texte)
- `get-weather` : Outil **PREMIUM** avec `requireAuth()`
- Validation API Key via arguments CLI (`--api-key=abc123`)
- Gestion des erreurs "Unauthorized"

**Concept clé :** Différencier outils gratuits et premium

---

### 3️⃣ **mcp-meteo** - Intégration API externe ☁️

- Connexion à l'API **Open-Meteo**
- Récupération de données météo en temps réel
- Géocodage des villes
- Gestion des erreurs réseau

**Cas d'usage :** Donner à l'IA un accès à des données en temps réel

---

### 4️⃣ **mcp-discord** - Notifications & alertes 💬

- Webhook Discord pour envoyer des messages
- Remontée d'alertes techniques
- Logs structurés

**Cas d'usage entreprise :**

- Alertes sur **Microsoft Teams**
- Notifications d'erreurs critiques
- Logs centralisés

---

### 5️⃣ **mcp-doc** - Documentation dynamique 📚

- Récupération de documentation en temps réel
- Scraping de sites web
- Documentation privée interne d'entreprise
- **Resources** MCP pour documentation statique

**📚 Différence Tools vs Resources :**

| **Resources**                            | **Tools**                            |
| ---------------------------------------- | ------------------------------------ |
| 📄 Données **statiques/semi-statiques**  | ⚙️ Actions **exécutables**           |
| 🔍 L'IA les **consulte** (lecture)       | ⚡ L'IA les **exécute** (action)     |
| 📖 Exemples : docs, configs, conventions | 🛠️ Exemples : recherche, calcul, API |
| ❌ Pas/peu de paramètres                 | ✅ Paramètres dynamiques             |

---

### 6️⃣ **mcp-hue** - IoT & domotique 💡

- Contrôle des lumières **Philips Hue**
- Découverte du bridge local
- Changement de couleur, luminosité
- **Cas pratique :** Allumer la lumière via commande IA

**Exemple :**

```
User: "Allume la lumière du salon en rouge"
IA → MCP Server → Philips Hue Bridge → 💡 Lumière rouge
```

---

### 7️⃣ **mcp-db** - Base de données 🗄️

- Serveur MCP connecté à SQLite/PostgreSQL
- Requêtes dynamiques via l'IA
- API Express pour visualisation des données
- Schéma de BDD exposé comme **Resource**

**Cas d'usage :**

- Requêter une BDD en langage naturel
- Générer des rapports automatiques
- Accès sécurisé aux données

---

### 8️⃣ **mcp-server-exercice** - Projet final 🎓

**8 outils utilitaires professionnels :**

1. `generate-password` : Génération de mots de passe sécurisés
2. `validate-email` : Validation d'adresses email
3. `shorten-url` : Raccourcisseur d'URL (en mémoire)
4. `get-url` : Récupération d'URL depuis code court
5. `get-system-info` : Informations système (OS, CPU, RAM)
6. `generate-uuid` : Génération d'UUID v4
7. `base64-encode` : Encodage base64
8. `base64-decode` : Décodage base64

**Points techniques :**

- Architecture modulaire et maintenable
- Gestion d'erreurs robuste
- Stockage en mémoire (Map)
- Validation des entrées

---

## 🖥️ Client MCP - Double interface

### **client.ts** - Interface CLI 💻

- Client en ligne de commande avec `readline`
- Interaction conversationnelle
- Exécution : `node client.js <chemin-serveur-mcp>`

### **webServer.js** - Interface Web 🌐

- Serveur Express avec API REST
- Frontend HTML/CSS/JS
- Endpoint `/chat` pour requêtes HTTP
- Serveur web sur `http://localhost:3000`

### 🔄 Logique métier partagée

**Architecture complète :**

```
┌─────────────────────────────────────────────────────┐
│  UTILISATEUR (Terminal OU Navigateur)              │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
    CLI Client      Web Server (Express)
    (readline)      (HTTP POST /chat)
        │                 │
        └────────┬────────┘
                 │
         MCP Client Core
                 │
    ┌────────────┼────────────┐
    │            │            │
LM Studio   MCP Server   Tools/Resources
(Local AI)  (STDIO)      (Météo, DB, etc.)
```

**Flux de données :**

1. **Utilisateur** pose une question
2. **Client** envoie au **LLM** (LM Studio) avec liste des tools
3. **LLM** décide si un tool est nécessaire
4. Si oui → **Client** appelle le **MCP Server**
5. **Résultat** retourne au **LLM** → Réponse finale

---

## 🧪 LM Studio vs LLM en ligne

### Comparaison technique

| Critère         | **LM Studio** (Local)  | **Groq/OpenAI** (Cloud)      |
| --------------- | ---------------------- | ---------------------------- |
| Localisation    | ✅ Sur ton Mac         | ☁️ Internet                  |
| Coût            | ✅ **Gratuit**         | 💰 **Payant**                |
| Confidentialité | ✅ **Données locales** | ⚠️ Envoi en ligne            |
| Puissance       | ❌ Limitée (RAM/CPU)   | ✅ **Très puissante**        |
| Ressources      | ❌ GPU/RAM nécessaire  | ✅ Pas de ressources locales |
| Latence         | ⚡ Rapide (local)      | 🌐 Dépend du réseau          |

**Choix stratégique :**

- 🏠 **LM Studio** : Prototypage, données sensibles, offline
- ☁️ **APIs cloud** : Production, puissance, scalabilité

---

## 🚀 Installation et démarrage

### Prérequis

- **Node.js** 18+ et npm
- **LM Studio** installé (pour IA locale)
- **TypeScript** (`npm install -g typescript`)

### Installation d'un serveur MCP

```bash
# Exemple : serveur météo
cd mcp-meteo
npm install
npm run build

# Lancer avec le client CLI
cd ../mcp-client
npm install
npm run build
node build/client.js ../mcp-meteo/build/index.js
```

### Lancer l'interface web

```bash
cd mcp-client

# Configurer le serveur MCP à utiliser
echo "MCP_SERVER_SCRIPT=../mcp-meteo/build/index.js" > .env

# Démarrer le serveur web
node webServer.js

# Ouvrir http://localhost:3000
```

### Test avec authentification

```bash
# Serveur avec outils premium
cd mcp-basique-protected
npm run build

# Sans API key (seuls outils publics)
node ../mcp-client/build/client.js build/main.js

# Avec API key (tous les outils)
node ../mcp-client/build/client.js build/main.js --api-key=abc123
```

---

## 🎓 Compétences démontrées

### Architecture & Design

- ✅ **Model Context Protocol** : Compréhension approfondie
- ✅ **Architecture modulaire** : Séparation des responsabilités
- ✅ **Client-Server** : Communication bidirectionnelle STDIO
- ✅ **Design patterns** : Factory, Strategy, Decorator

### Backend & APIs

- ✅ **Node.js / TypeScript** : Développement moderne
- ✅ **Express.js** : API REST et serveur web
- ✅ **SQLite** : Gestion de bases de données
- ✅ **Webhooks** : Intégrations Discord/Teams
- ✅ **API externes** : Open-Meteo, Philips Hue

### IA & LLM

- ✅ **LM Studio** : Modèles locaux (Llama, Qwen)
- ✅ **Tool Calling** : Orchestration d'outils par l'IA
- ✅ **Prompt Engineering** : Optimisation des requêtes
- ✅ **Context Management** : Resources vs Tools

### Sécurité

- ✅ **Authentification** : API Keys, validation
- ✅ **Autorisation** : Outils premium vs gratuits
- ✅ **Variables d'environnement** : Configuration sécurisée

### IoT & Intégrations

- ✅ **Philips Hue** : Contrôle domotique
- ✅ **STDIO Transport** : Communication inter-processus
- ✅ **Webhooks** : Notifications temps réel

---

## 📊 Cas d'usage professionnels

### 🏢 En entreprise

1. **Support client automatisé**
   - Serveur MCP connecté à la BDD clients
   - Génération de factures, suivi commandes
   - Documentation interne accessible

2. **DevOps & Monitoring**
   - Serveur MCP pour logs système
   - Alertes Discord/Teams en temps réel
   - Monitoring de santé des serveurs

3. **Data Analytics**
   - Requêtes BDD en langage naturel
   - Génération de rapports automatiques
   - Visualisation de données

4. **Domotique intelligente**
   - Contrôle IoT via voix/texte
   - Automatisation de scénarios
   - Intégration smart home

---

## 📈 Améliorations futures possibles

- [ ] Tests unitaires et d'intégration (Jest/Vitest)
- [ ] Docker containerization de chaque serveur
- [ ] CI/CD avec GitHub Actions
- [ ] Base de données PostgreSQL en production
- [ ] OAuth 2.0 pour authentification
- [ ] WebSocket pour communication temps réel
- [ ] Monitoring avec Prometheus/Grafana
- [ ] Rate limiting et cache Redis
- [ ] Documentation avec Swagger/OpenAPI
- [ ] Multi-language support (Python, Go)

---

## 📚 Ressources et documentation

- [Model Context Protocol - Spec officielle](https://spec.modelcontextprotocol.io/)
- [MCP SDK TypeScript](https://github.com/modelcontextprotocol/typescript-sdk)
- [LM Studio](https://lmstudio.ai/)
- [Open-Meteo API](https://open-meteo.com/)
- [Philips Hue API](https://developers.meethue.com/)

---

## 🏆 Conclusion

Ce repository démontre une **progression structurée** dans l'apprentissage du Model Context Protocol, de concepts basiques aux intégrations avancées. Chaque projet illustre une compétence spécifique, avec un focus sur l'**architecture propre**, la **sécurité**, et les **cas d'usage réels**.

**Prêt pour :** Développement d'assistants IA contextuels, intégrations d'entreprise, automatisation intelligente.

---

_Repository créé dans le cadre d'une formation Udemy sur le Model Context Protocol_
