import { promises as fs } from 'fs';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import path from 'path';

const __dirname = import.meta.dirname

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(__dirname, 'strg-token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'strg-cred.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadCredentials() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
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
 * Load or request or authorization to call APIs.
 *
 */
export async function authorize() {
    let cred = await fs.readFile(CREDENTIALS_PATH)
    let cred_ = JSON.parse(cred)
    let client = await loadCredentials();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
        //key: cred,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
export async function listFiles(authClient) {
    const drive = google.drive({ version: 'v3', auth: authClient });
    const res = await drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
    });
    const files = res.data.files;
    if (files.length === 0) {
        console.log('No files found.');
        return;
    }

    console.log('Files:');
    files.map((file) => {
        console.log(`${file.name} (${file.id})`);
    });
}


//const auth = await authorize().catch(console.error);
//listFiles(auth)