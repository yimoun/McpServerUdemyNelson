const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Pour permettre les requêtes depuis le front-end

const app = express();
const port = 3000; // Le port sur lequel ton API va écouter

// --- Configuration de la base de données SQLite ---
const DB_FILE = 'mon_exemple.db'; // Assure-toi que ce fichier existe et contient tes tables
const db = new sqlite3.Database(DB_FILE, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connecté à la base de données SQLite.');
});

// --- Middlewares ---
app.use(cors()); // Active CORS pour toutes les requêtes
app.use(express.json()); // Permet à Express de parser les corps de requêtes JSON

// --- Routes API ---

// Route de test: pour s'assurer que le serveur fonctionne
app.get('/', (req, res) => {
    res.send('API Root - Mon super projet !');
});

// Récupérer tous les utilisateurs
app.get('/utilisateurs', (req, res) => {
    db.all('SELECT id, nom, email FROM utilisateurs', [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message":"success",
            "data": rows
        });
    });
});

// Récupérer un utilisateur par ID
app.get('/utilisateurs/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT id, nom, email FROM utilisateurs WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        if (!row) {
            res.status(404).json({"message": "Utilisateur non trouvé"});
            return;
        }
        res.json({
            "message":"success",
            "data": row
        });
    });
});

// Récupérer toutes les catégories
app.get('/categories', (req, res) => {
    db.all('SELECT id, nom FROM categories', [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Récupérer tous les articles avec leurs relations
app.get('/articles', (req, res) => {
    const query = `
        SELECT A.id, A.titre, A.contenu, 
               U.nom AS nom_utilisateur, U.id AS utilisateur_id,
               C.nom AS nom_categorie, C.id AS categorie_id
        FROM articles A
        JOIN utilisateurs U ON A.utilisateur_id = U.id
        JOIN categories C ON A.categorie_id = C.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Récupérer un article par ID
app.get('/articles/:id', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT A.id, A.titre, A.contenu,
               U.nom AS nom_utilisateur, U.id AS utilisateur_id,
               C.nom AS nom_categorie, C.id AS categorie_id
        FROM articles A
        JOIN utilisateurs U ON A.utilisateur_id = U.id
        JOIN categories C ON A.categorie_id = C.id
        WHERE A.id = ?
    `;
    db.get(query, [id], (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        if (!row) {
            res.status(404).json({"message": "Article non trouvé"});
            return;
        }
        res.json({
            "message": "success",
            "data": row
        });
    });
});

// Récupérer les articles d'une catégorie
app.get('/categories/:id/articles', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT A.id, A.titre, A.contenu,
               U.nom AS nom_utilisateur, U.id AS utilisateur_id,
               C.nom AS nom_categorie
        FROM articles A
        JOIN utilisateurs U ON A.utilisateur_id = U.id
        JOIN categories C ON A.categorie_id = C.id
        WHERE C.id = ?
    `;
    db.all(query, [id], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Récupérer les articles d'une catégorie par nom
app.get('/categories/nom/:nom/articles', (req, res) => {
    const { nom } = req.params;
    const query = `
        SELECT A.id, A.titre, A.contenu,
               U.nom AS nom_utilisateur, U.id AS utilisateur_id,
               C.nom AS nom_categorie, C.id AS categorie_id
        FROM articles A
        JOIN utilisateurs U ON A.utilisateur_id = U.id
        JOIN categories C ON A.categorie_id = C.id
        WHERE C.nom = ?
    `;
    db.all(query, [nom], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// TODO: Ajouter des routes pour les articles et catégories (lecture, ajout, modification, suppression)

// --- Démarrer le serveur ---
app.listen(port, () => {
    console.log(`Serveur API démarré sur http://localhost:${port}`);
});

// Gestion de la fermeture de la base de données à l'arrêt de l'application
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connexion SQLite fermée.');
        process.exit(0);
    });
});