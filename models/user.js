const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Find user by Google ID
async function findByGoogleId(googleId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE google_id = ?';
        db.query(sql, [googleId], (err, result) => {
            if (err) return reject(err);
            if (result.length > 0) {
                resolve(result[0]);  // If user is found, return the first result
            } else {
                resolve(null);  // If no user found, return null
            }
        });
    });
}
// Create a new user for OAuth without password
function create(user) {
    return new Promise((resolve, reject) => {
        const { google_id, username, email } = user;
        const sql = 'INSERT INTO users (google_id, username, email) VALUES (?, ?, ?)';
        db.query(sql, [google_id, username, email], (err, result) => {
            if (err) return reject(err);
            resolve({ id: result.insertId, ...user });
        });
    });
}

// Find user by ID
function findById(id) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return resolve(null);
            resolve(results[0]);
        });
    });
}

// Find user by email
function findByEmail(email) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return resolve(null);
            resolve(results[0]);
        });
    });
}

// Create a new user with email/password and hash the password
function createUserWithPassword(user) {
    return new Promise((resolve, reject) => {
        const { username, email, password } = user;
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return reject(err);
            db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, result) => {
                if (err) return reject(err);
                resolve({ id: result.insertId, ...user });
            });
        });
    });
}

// Verify password during login
function verifyPassword(inputPassword, hashedPassword) {
    return bcrypt.compare(inputPassword, hashedPassword);
}

module.exports = {
    findByGoogleId,
    findById,
    findByEmail,
    create,
    createUserWithPassword,
    verifyPassword
};

