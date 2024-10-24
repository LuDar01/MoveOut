const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const User = require('../models/user');
const { sendVerificationEmail } = require('./mailer');
const router = express.Router();


// Registration route
router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;

    // Check if the email is from Gmail domain (support Gmail global variations)
    const isGmail = email.toLowerCase().endsWith('@gmail.com') || email.toLowerCase().endsWith('@gmail.se');
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (username, email, password, verified) VALUES (?, ?, ?, ?)`;

    db.query(sql, [username, email, hashedPassword, isGmail ? 1 : 0], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (!isGmail) {
            // For non-Gmail users, send verification email
            const verificationLink = `http://localhost:3000/auth/verify?email=${email}`;
            sendVerificationEmail(email, verificationLink);
            res.status(200).json({ message: 'Registration successful! Please check your email for verification.' });
        } else {
            // For Gmail users, allow direct login without verification
            res.status(200).json({ message: 'Registration successful! You can log in without email verification.' });
        }
    });
});

// Login Route
router.post('/login', (req, res) => {
    const { identifier, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ? OR username = ?`;

    db.query(sql, [identifier, identifier], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or username' });
        }

        const user = results[0];
        if (!user.verified) {
            return res.status(400).json({ message: 'Please verify your email before logging in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(400).json({ message: 'Invalid password' });
        }
    });
});

// Email Verification Route
router.get('/verify', (req, res) => {
    const { email } = req.query;
    const sql = `UPDATE users SET verified = 1 WHERE email = ?`;

    db.query(sql, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Verification failed' });
        }
        res.status(200).send('Email verified! You can now log in.');
    });
});

module.exports = router;
