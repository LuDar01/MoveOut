const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'dbadm',
    password: 'P@ssw0rd',
    database: 'moveout'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected');
});

module.exports = db;
