const nodemailer = require('nodemailer');

// Configure the transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like Outlook, Yahoo, etc.
    auth: {
        user: 'lutdar01@gmail.com', // Replace with your email
        pass: 'ddgc zolp fcvz ugye' // Replace with your email password or app password (for Gmail)
    }
});

// Function to send a verification email
const sendVerificationEmail = (email, verificationLink) => {
    const mailOptions = {
        from: 'MoveOut <lutdar01@gmail.com>',
        to: email,
        subject: 'Please verify your email',
        text: `Please verify your email by clicking the link below: ${verificationLink}`, // Plain text version
        html: `<p>Please verify your email down below:</p><br><a href="${verificationLink}">Verify Email</a></br>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Verification email sent:', info.response);
        }
    });
};

module.exports = {
    sendVerificationEmail
};
