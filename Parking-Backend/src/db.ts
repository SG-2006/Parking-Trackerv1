import Database from 'better-sqlite3';
const db = new Database('app.db');
db.pragma('foreign_keys = ON');

const query = `
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP  
    );

    CREATE TABLE IF NOT EXISTS lots (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS spots (
    id INTEGER PRIMARY KEY,
    lot_id INTEGER REFERENCES lots(id),
    label TEXT NOT NULL,
    status TEXT DEFAULT 'free'
    );    

    CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY,
    spot_id INTEGER REFERENCES spots(id),
    user_id INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active'
    );
`;

db.exec(query);
export default db // allows for other files to also borrow this