// server.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// BASE DE DONNÉES
let pool = null;
const dbConfigOk = process.env.DB_USER && process.env.DB_HOST && process.env.DB_NAME;

if (dbConfigOk) {
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false }
  });
} else {
  console.warn('⚠️ Variables DB manquantes dans .env');
}

function requireDb(req, res, next) {
  if (!pool) {
    return res.status(503).json({ success: false, message: 'Base de données non configurée.' });
  }
  next();
}

// ROUTES API
app.post('/api/contact', requireDb, async (req, res) => {
  const { nom, email, message } = req.body;
  if (!nom || !email || !message) {
    return res.status(400).json({ success: false, message: 'Champs manquants.' });
  }
  try {
    await pool.query(
      'INSERT INTO messages_contact (nom, email, message) VALUES ($1, $2, $3)',
      [nom, email, message]
    );
    res.json({ success: true, message: 'Message enregistré !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/api/services', requireDb, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
});

app.post('/api/register', requireDb, async (req, res) => {
  const { nom, prenom, email, mot_de_passe } = req.body;
  if (!nom || !prenom || !email || !mot_de_passe) {
    return res.status(400).json({ success: false, message: 'Champs manquants.' });
  }
  try {
    const hash = await bcrypt.hash(mot_de_passe, 10);
    await pool.query(
      'INSERT INTO utilisateurs (nom, "prénom", email, "mot de passe") VALUES ($1, $2, $3, $4)',
      [nom, prenom, email, hash]
    );
    res.json({ success: true, message: 'Compte créé avec succès !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur : cet email est peut-être déjà utilisé.' });
  }
});

app.post('/api/login', requireDb, async (req, res) => {
  const { email, mot_de_passe } = req.body;
  if (!email || !mot_de_passe) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
  }
  try {
    const result = await pool.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    }
    const utilisateur = result.rows[0];
    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur['mot de passe']);
    if (!motDePasseValide) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    }
    res.json({
      success: true,
      message: 'Connexion réussie !',
      nom: utilisateur.nom,
      prenom: utilisateur['prénom']
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour mettre à jour l'utilisateur
app.put('/api/utilisateur/:email', requireDb, async (req, res) => {
  const { email } = req.params;
  const { nom, prenom, mot_de_passe } = req.body;
  
  if (!nom || !prenom) {
    return res.status(400).json({ success: false, message: 'Nom et prénom requis.' });
  }
  
  try {
    let query = 'UPDATE utilisateurs SET nom = $1, "prénom" = $2';
    let params = [nom, prenom];
    
    if (mot_de_passe) {
      const hash = await bcrypt.hash(mot_de_passe, 10);
      query += ', "mot de passe" = $3';
      params.push(hash);
      query += ' WHERE email = $4';
      params.push(email);
    } else {
      query += ' WHERE email = $3';
      params.push(email);
    }
    
    await pool.query(query, params);
    res.json({ success: true, message: 'Profil mis à jour !', nom, prenom, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/dessins', requireDb, async (req, res) => {
  const { email, image_data } = req.body;
  if (!email || !image_data) {
    return res.status(400).json({ success: false, message: 'Champs manquants.' });
  }
  try {
    await pool.query(
      'INSERT INTO dessins (email_utilisateur, image_data) VALUES ($1, $2)',
      [email, image_data]
    );
    res.json({ success: true, message: 'Dessin sauvegardé !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/api/dessins/:email', requireDb, async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM dessins WHERE email_utilisateur = $1 ORDER BY date_creation DESC',
      [email]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DISTRIBUTION DES PAGES HTML
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html introuvable :', indexPath);
    return res.status(500).send("index.html est introuvable.");
  }
  res.sendFile(indexPath);
});

app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  if (page.startsWith('api')) return next();
  const filePath = path.join(__dirname, `${page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) res.sendFile(path.join(__dirname, 'index.html'));
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Route API introuvable.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('✅ Serveur démarré sur le port ' + PORT);
});