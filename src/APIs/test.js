import authorize from "./dist/authApi.js";
import { listFiles } from "./strg.js";

const auth = await authorize('storage');
listFiles(auth)

/*
import db from "./database";

db.GET

const nodemail = () => {
    const nodemailer = require('nodemailer');

    // Create a transporter object
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can use other services like Outlook or specify SMTP details
        auth: {
            user: 'benz.github@gmail.com', // Replace with your email
            pass: 'benz.github-password', // Replace with your email password or app password
        },
    });

    // Function to send an email
    async function sendEmail(to, subject, text, html) {
        try {
            const info = await transporter.sendMail({
                from: '"Campus" <benz.github@gmail.com>', // Sender address
                to: to, // List of recipients
                subject: subject, // Subject line
                text: text, // Plain text body
                html: html, // '<b>HTML version of the message</b>'
            });

            console.log('Email sent: %s', info.messageId);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }

    // Example usage
    sendEmail('benzaria26@gmail.com');
}
*/