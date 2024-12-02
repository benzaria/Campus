import { config as denv } from 'dotenv';denv();
import { promises as fs } from 'fs';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import path from 'path';

const __dirname = import.meta.dirname;


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(__dirname, 'db_2-token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'db-cred.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadCredentials() {
    try {
        const tokenContent = await fs.readFile(TOKEN_PATH, 'utf-8');
        const token = JSON.parse(tokenContent);

        // Create an OAuth2Client and set its credentials
        const credentialsContent = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
        const credentials = JSON.parse(credentialsContent);
        const { client_id, client_secret, redirect_uris } = credentials.installed;

        const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(token);
        return oAuth2Client;
    } catch (err) {
        console.warn('No existing credentials found. Authorization required.');
        return null;
    }
}

/**
 * Serializes credentials to a file for future use.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const payload = JSON.stringify(client.credentials);
    await fs.writeFile(TOKEN_PATH, payload, 'utf-8');
}

/**
 * Authorizes the application and handles token refresh if needed.
 *
 * @return {Promise<OAuth2Client>}
 */
async function authorize(api) {
    const oAuth2Client = await loadCredentials(api);
    if (oAuth2Client) {
        console.log('Using existing credentials.');
        return oAuth2Client;
    }

    // Load credentials from file
    const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
    const { installed } = JSON.parse(content);
    const { client_id, client_secret, redirect_uris } = installed;

    const newOAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

    // Generate the URL for user consent
    const authUrl = newOAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this URL:', authUrl);

    // Accept user input for authorization code
    const readline = await import('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const code = await new Promise((resolve) =>
        rl.question('Enter the code from that page here: ', resolve)
    );
    rl.close();

    // Exchange authorization code for tokens
    const { tokens } = await newOAuth2Client.getToken(code);
    newOAuth2Client.setCredentials(tokens);

    // Save the credentials for future use
    await saveCredentials(newOAuth2Client, api);
    console.log('Credentials saved.');

    return newOAuth2Client;
}

/**
 * Fetches and prints data from the specified Google Sheets range.
 *
 * @param {OAuth2Client} auth The authenticated Google OAuth client.
 */
async function listSheet(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.sheetID,
        range: 'db',
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
        console.log('No data found.');
        return;
    }
    console.log(rows);
}

// Run the main logic
(async () => {
    try {
        const auth = await authorize('database');
        await listSheet(auth);
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
