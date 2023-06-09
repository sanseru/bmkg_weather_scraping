import sqlite3 from 'sqlite3';
import mkdirp from 'mkdirp';
import crypto from 'crypto';

mkdirp.sync('./var/db');

const db = new sqlite3.Database('./var/db/api_forecast.db');

db.serialize(() => {
  // create the database schema for the todos app
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    hashed_password BLOB,
    salt BLOB
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER
  )`);

  // create an initial user (username: haris, password: password)
  const salt = crypto.randomBytes(16);
  db.run('INSERT OR IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
    'haris',
    crypto.pbkdf2Sync('password', salt, 310000, 32, 'sha256'),
    salt
  ]);
});

export default db;
