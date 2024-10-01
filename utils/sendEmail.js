const nodemailer = require('nodemailer');

// Reusable transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Or your preferred email service
    auth: {
        user: process.env.EMAIL_USER, // Ensure these variables are defined in your .env file
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send a verification code email
const sendEmail = (email, verificationCode) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email',
        text: `Your verification code is: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

// Function to send a password reset email with a verification token
const sendVerificationEmail = async (email, verificationToken) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `To reset your password, please click the link: 
        http://localhost:3000/reset-password?token=${verificationToken}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully.');
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
};
