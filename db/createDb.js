const sqlite3 = require('sqlite3').verbose();

// --- Configuration ---
const DB_FILE = 'mon_exemple.db'; // Le nom du fichier de ta base de données

// --- 1. Connexion à la base de données (ou création si elle n'existe pas) ---
// Utilise sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE pour s'assurer qu'elle est créée si elle n'existe pas
const db = new sqlite3.Database(DB_FILE, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(`Erreur de connexion à la base de données : ${err.message}`);
    } else {
        console.log(`Base de données '${DB_FILE}' créée ou connectée avec succès !`);
        // Appelle la fonction pour créer les tables une fois la connexion établie
        createTables();
    }
});

// --- 2. Fonction pour créer les tables ---
function createTables() {
    db.serialize(() => {
        // Table utilisateurs
        db.run(`
            CREATE TABLE IF NOT EXISTS utilisateurs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE
            );
        `, (err) => {
            if (err) { console.error(`Erreur création table utilisateurs: ${err.message}`); }
            else { console.log("Table 'utilisateurs' créée ou vérifiée."); }
        });

        // Table categories
        db.run(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL UNIQUE
            );
        `, (err) => {
            if (err) { console.error(`Erreur création table categories: ${err.message}`); }
            else { console.log("Table 'categories' créée ou vérifiée."); }
        });

        // Table articles
        db.run(`
            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titre TEXT NOT NULL,
                contenu TEXT NOT NULL,
                utilisateur_id INTEGER,
                categorie_id INTEGER,
                FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
                FOREIGN KEY (categorie_id) REFERENCES categories(id)
            );
        `, (err) => {
            if (err) { console.error(`Erreur création table articles: ${err.message}`); }
            else { console.log("Table 'articles' créée ou vérifiée."); }
            // Une fois toutes les tables créées, on peut insérer les données d'exemple
            insertSampleData();
        });
    });
}

// --- 3. Fonction pour insérer des données d'exemple ---
function insertSampleData() {
    db.serialize(() => {
        // Insérer des utilisateurs
        // Utilisation de INSERT OR IGNORE pour éviter les doublons si le script est exécuté plusieurs fois
        db.run("INSERT OR IGNORE INTO utilisateurs (nom, email) VALUES (?, ?)", ['Alice', 'alice@exemple.com']);
        db.run("INSERT OR IGNORE INTO utilisateurs (nom, email) VALUES (?, ?)", ['Bob', 'bob@exemple.com']);
        db.run("INSERT OR IGNORE INTO utilisateurs (nom, email) VALUES (?, ?)", ['Charlie', 'charlie@exemple.com']);

        // Insérer des catégories
        db.run("INSERT OR IGNORE INTO categories (nom) VALUES (?)", ['Technologie']);
        db.run("INSERT OR IGNORE INTO categories (nom) VALUES (?)", ['Voyages']);
        db.run("INSERT OR IGNORE INTO categories (nom) VALUES (?)", ['Cuisine']);

        console.log("Tentative d'insertion des données d'exemple...");

        // Récupérer les IDs pour les clés étrangères
        // Cela est important car les IDs peuvent ne pas être séquentiels ou connus d'avance
        Promise.all([
            new Promise((resolve, reject) => db.get("SELECT id FROM utilisateurs WHERE nom = 'Alice'", (err, row) => err ? reject(err) : resolve(row.id))),
            new Promise((resolve, reject) => db.get("SELECT id FROM utilisateurs WHERE nom = 'Bob'", (err, row) => err ? reject(err) : resolve(row.id))),
            new Promise((resolve, reject) => db.get("SELECT id FROM categories WHERE nom = 'Technologie'", (err, row) => err ? reject(err) : resolve(row.id))),
            new Promise((resolve, reject) => db.get("SELECT id FROM categories WHERE nom = 'Voyages'", (err, row) => err ? reject(err) : resolve(row.id))),
            new Promise((resolve, reject) => db.get("SELECT id FROM categories WHERE nom = 'Cuisine'", (err, row) => err ? reject(err) : resolve(row.id)))
        ]).then(([alice_id, bob_id, tech_id, voyage_id, cuisine_id]) => {
            db.run("INSERT OR IGNORE INTO articles (titre, contenu, utilisateur_id, categorie_id) VALUES (?, ?, ?, ?)",
                ['Mon premier programme JavaScript', 'Le contenu de mon article sur JavaScript et Node.js...', alice_id, tech_id]);
            db.run("INSERT OR IGNORE INTO articles (titre, contenu, utilisateur_id, categorie_id) VALUES (?, ?, ?, ?)",
                ['Découverte de l\'Asie du Sud-Est', 'Un voyage mémorable à travers les cultures asiatiques...', bob_id, voyage_id]);
            db.run("INSERT OR IGNORE INTO articles (titre, contenu, utilisateur_id, categorie_id) VALUES (?, ?, ?, ?)",
                ['Recette de sushis maison', 'Comment préparer de délicieux sushis comme un pro...', alice_id, cuisine_id]);

            console.log("Données d'exemple insérées (si elles n'existaient pas).");

            // Optionnel: Vérifier les données après insertion
            // readData();
        }).catch(err => {
            console.error("Erreur lors de la récupération des IDs ou de l'insertion des articles:", err.message);
        });
    });
}

// --- 4. Fonction pour lire les données (optionnel, pour vérification) ---
function readData() {
    console.log("\n--- Données actuelles ---");
    db.all("SELECT id, nom, email FROM utilisateurs", [], (err, rows) => {
        if (err) { console.error(err.message); return; }
        console.log("\nUtilisateurs:", rows);
    });
    db.all("SELECT id, nom FROM categories", [], (err, rows) => {
        if (err) { console.error(err.message); return; }
        console.log("\nCatégories:", rows);
    });
    db.all(`
        SELECT A.titre, A.contenu, U.nom AS nom_utilisateur, C.nom AS nom_categorie
        FROM articles AS A
        JOIN utilisateurs AS U ON A.utilisateur_id = U.id
        JOIN categories AS C ON A.categorie_id = C.id;
    `, [], (err, rows) => {
        if (err) { console.error(err.message); return; }
        console.log("\nArticles:", rows);
    });
}

// --- 5. Fermeture de la connexion (lorsque l'application se termine) ---
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connexion SQLite fermée.');
        process.exit(0);
    });
});