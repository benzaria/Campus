// TODO - Make a email api
const fs = require('fs').promises;
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// Define file paths
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'email.json');

/**
 * Reads previously authorized credentials from the save file.
 * @return {Promise<OAuth2Client|null>}
 */
async function loadCredentials() {
    try {
        const content = await fs.readFile(TOKEN_PATH, 'utf8');
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 * @param {OAuth2Client} client
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH, 'utf8');
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Authenticates and retrieves an authorized client.
 *
 * @return {Promise<OAuth2Client>}
 */
async function authenticateClient() {
    let client = await loadCredentials();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

/**
 * Lists the latest Gmail messages.
 *
 * @return {Promise<Array>}
 */
async function GET() {
    const auth = await authenticateClient();
    const gmail = google.gmail({ version: 'v1', auth });

    const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 10,
    });

    return res.data.messages || [];
}

/**
 * Sends an email using the Gmail API.
 *
 * @param {string} to Recipient email address.
 * @param {string} subject Subject of the email.
 * @param {string} body Body content of the email.
 * @return {Promise<Object>}
 */
async function PUT(to, subject, body) {
    const auth = await authenticateClient();
    const gmail = google.gmail({ version: 'v1', auth });

    const rawMessage = [
        `To: ${to}`,
        `Subject: ${subject}`,
        //'Content-Type: text/html; charset=utf-8',
        '',
        body,
    ].join('\n');

    const encodedMessage = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage,
        },
    });

    return res.data;
}

//GET()
module.exports = {
    PUT,
    GET
}
//export default { GET, PUT };

/*
const { listMessages, sendEmail } = require('./api');

// List Gmail messages
listMessages()
    .then((messages) => console.log('Messages:', messages))
    .catch((err) => console.error('Error:', err));

// Send an email
PUT('example@example.com', 'Test Subject', 'This is a test email.')
    .then((response) => console.log('Email sent successfully:', response))
    .catch((err) => console.error('Error sending email:', err));

*/