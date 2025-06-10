import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init.js';

const router = express.Router();

// Validation middleware
const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

const validateRegister = [
  body('lastName').matches(/^[A-Za-zÀ-ÿ\s\-']+$/).isLength({ min: 2 }).withMessage('Le nom de famille doit contenir uniquement des lettres (minimum 2 caractères)'),
  body('firstName').matches(/^[A-Za-zÀ-ÿ\s\-']+$/).isLength({ min: 2 }).withMessage('Le prénom doit contenir uniquement des lettres (minimum 2 caractères)'),
  body('matricule').matches(/^4\d{8}$/).withMessage('Le matricule doit commencer par 4 et contenir 9 chiffres'),
  body('email').isEmail().normalizeEmail().custom(value => {
    if (!value.endsWith('@police.belgium.eu')) {
      throw new Error('Seules les adresses @police.belgium.eu sont autorisées');
    }
    return true;
  }),
  body('password').isLength({ min: 12 }).withMessage('Le mot de passe doit contenir au moins 12 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)
    .withMessage('Le mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial'),
];

// Register new user
router.post('/register', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: errors.array()[0].msg,
        errors: errors.array() 
      });
    }

    const { lastName, firstName, matricule, email, password, language = 'fr' } = req.body;

    // Check if user already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ? OR matricule = ?', [email, matricule], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Un utilisateur avec cette adresse email ou ce matricule existe déjà' });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = await new Promise((resolve, reject) => {
      const stmt = db.prepare('INSERT INTO users (last_name, first_name, matricule, email, password_hash, language) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run([lastName, firstName, matricule, email, passwordHash, language], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      stmt.finalize();
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, language, firstName, lastName },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: { id: userId, email, language, firstName, lastName }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Validate email domain
    if (!email.endsWith('@police.belgium.eu')) {
      return res.status(403).json({ error: 'Accès refusé. Seules les adresses @police.belgium.eu sont autorisées.' });
    }

    // Find user
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Update last login
    await new Promise((resolve, reject) => {
      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        language: user.language,
        firstName: user.first_name,
        lastName: user.last_name
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        language: user.language,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Update user language preference
router.put('/language', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    const { language } = req.body;

    if (!['en', 'fr', 'nl'].includes(language)) {
      return res.status(400).json({ error: 'Langue invalide' });
    }

    await new Promise((resolve, reject) => {
      db.run('UPDATE users SET language = ? WHERE id = ?', [language, decoded.userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: 'Langue mise à jour avec succès' });
  } catch (error) {
    console.error('Language update error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la langue' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    // Get updated user info
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT id, first_name, last_name, email, language FROM users WHERE id = ?', [decoded.userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        language: user.language,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Token invalide' });
  }
});

export default router;