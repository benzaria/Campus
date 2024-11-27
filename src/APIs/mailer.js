import nodemailer from 'nodemailer';
//import { config } from "dotenv";config();

export async function SEND(to, sub, html) {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, // For SSL
        secure: true, // Use SSL
        auth: {
            user: process.env.user,
            pass: process.env.pass,
        },
    });

    // Send email
    const info = await transporter.sendMail({
        from: `"Campus" ${process.env.user}`,
        to, sub, html,
    });

    console.log('Email sent:', info.messageId);
}

// Usage
//SEND('benzaria27@gmail.com', 'Test Email', '<h1>This is a test email</h1>').catch(console.error);
