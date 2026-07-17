// server.js - Le serveur qui relie ton site à la base de données
require('dotenv').config();
const bcrypt = require('bcrypt')
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());           // autorise ton site à communiquer avec ce serveur
app.use(express.json({ limit: '10mb' }));   // permet de lire les données envoyées en JSON (limite augmentée pour les dessins)

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false }
});

// Route pour enregistrer un message du formulaire de contact
app.post('/api/contact', async (req, res) => {
  const { nom, email, message } = req.body;
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

// Route pour récupérer la liste des services
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { nom, prenom, email, mot_de_passe } = req.body;
  try {
    const hash = await bcrypt.hash(mot_de_passe, 10);
    await pool.query(
      'INSERT INTO utilisateurs (nom, prénom, email, "mot de passe") VALUES ($1, $2, $3, $4)',
      [nom, prenom, email, hash]
    );
    res.json({ success: true, message: 'Compte créé avec succès !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur : cet email est peut-être déjà utilisé.' });
  }
});

// Route pour se connecter
app.post('/api/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;
  try {
    const result = await pool.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    }
    const utilisateur = result.rows[0];
    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur["mot de passe"]);
    if (!motDePasseValide) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    }
    res.json({ success: true, message: 'Connexion réussie !', nom: utilisateur.nom, prenom: utilisateur["prénom"] });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour sauvegarder un dessin
app.post('/api/dessins', async (req, res) => {
  const { email, image_data } = req.body;
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

// Route pour récupérer les dessins d'un utilisateur
app.get('/api/dessins/:email', async (req, res) => {
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('✅ Serveur démarré sur le port ' + PORT);
});