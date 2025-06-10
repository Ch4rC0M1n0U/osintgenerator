import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../data/profiles.db');

// Ensure data directory exists
const dataDir = join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table for authentication
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          matricule TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          language TEXT DEFAULT 'fr',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME
        )
      `);

      // Create profiles table
      db.run(`
        CREATE TABLE IF NOT EXISTS profiles (
          id TEXT PRIMARY KEY,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          gender TEXT,
          nationality TEXT,
          age INTEGER,
          photo_url TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          country TEXT,
          postcode TEXT,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Create social media profiles table
      db.run(`
        CREATE TABLE IF NOT EXISTS social_media_profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profile_id TEXT NOT NULL,
          platform TEXT NOT NULL,
          username TEXT,
          bio TEXT,
          followers INTEGER,
          following INTEGER,
          posts_count INTEGER,
          interests TEXT,
          data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE
        )
      `);

      // Create tags table
      db.run(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          color TEXT DEFAULT '#3B82F6',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create profile_tags junction table
      db.run(`
        CREATE TABLE IF NOT EXISTS profile_tags (
          profile_id TEXT NOT NULL,
          tag_id INTEGER NOT NULL,
          PRIMARY KEY (profile_id, tag_id),
          FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
        )
      `);

      // Create usage_logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS usage_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profile_id TEXT NOT NULL,
          user_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

export { db };