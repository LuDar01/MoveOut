const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const db = require('./config/db'); // Import the database connection
const User = require('./models/user'); // User model to handle DB logic
const multer = require('multer');
const AWS = require('aws-sdk');
const QRCode = require('qrcode');
const fs = require('fs');

dotenv.config();  // Load environment variables

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Session management for passport
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Configure passport to use Google Strategy with environment variables
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if the user exists by google_id
        const existingUser = await User.findByGoogleId(profile.id);
        
        if (existingUser) {
            // User found, continue
            return done(null, { user: existingUser, accessToken, refreshToken });
        }

        // If no user exists, create a new one
        const newUser = {
            google_id: profile.id, // Add google_id to the new user object
            username: profile.displayName,
            email: profile.emails[0].value,
        };

        // Save the new user to the database
        const createdUser = await User.create(newUser);

        return done(null, { user: createdUser, accessToken, refreshToken });
    } catch (err) {
        return done(err, null);
    }
}));



passport.serializeUser((data, done) => {
    done(null, { id: data.user.id, accessToken: data.accessToken, refreshToken: data.refreshToken });
});

passport.deserializeUser(async (data, done) => {
    try {
        const user = await User.findById(data.id);
        done(null, { user, accessToken: data.accessToken, refreshToken: data.refreshToken });
    } catch (err) {
        done(err, null);
    }
});


// Routes
app.use('/auth', require('./routes/auth'));

// Google OAuth login route
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/profile.html');
    }
);

// Logout route
app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// AWS S3 setup
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

// Route to handle label creation
// Route to handle label creation
app.post('/create-label', upload.single('file'), (req, res) => {
    const { labelType, description } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.filename,
        Body: fs.createReadStream(file.path)
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error('S3 Upload Error:', err);
            return res.status(500).json({ error: 'File upload failed' });
        }

        // Save label info to DB
        const sql = `INSERT INTO labels (type, description, file_url) VALUES (?, ?, ?)`;
        db.query(sql, [labelType, description, data.Location], (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            // Generate QR code
            QRCode.toDataURL(`http://localhost:3000/labels/${result.insertId}`, (err, url) => {
                if (err) return res.status(500).json({ error: 'QR generation failed' });

                // Update the label with the QR code URL
                const updateSql = `UPDATE labels SET file_url = ? WHERE id = ?`;
                db.query(updateSql, [url, result.insertId], (err) => {
                    if (err) return res.status(500).json({ error: 'Error updating label' });
                    res.json({ message: 'Label created', qrCode: url });
                });
            });
        });
    });
});

// Route to fetch all existing labels (ADD THIS):
app.get('/get-labels', (req, res) => {
    const sql = `SELECT * FROM labels`;  // Fetch all labels from the database
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);  // Send all labels back to the frontend
    });
});

// Your existing app.listen() should stay at the bottom of the file
// Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.post('/edit-label/:id', upload.single('file'), (req, res) => {
    const { labelType, description } = req.body;
    const file = req.file;

    let updateSql = `UPDATE labels SET type = ?, description = ? WHERE id = ?`;
    const params = [labelType, description, req.params.id];

    if (file) {
        const fileUrl = `/uploads/${file.filename}`;
        updateSql = `UPDATE labels SET type = ?, description = ?, file_url = ? WHERE id = ?`;
        params.push(fileUrl);
    }

    db.query(updateSql, params, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Label updated' });
    });
});

