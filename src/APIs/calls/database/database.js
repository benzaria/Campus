// TODO - Make a database api
const fs = require('fs').promises;
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const db = () => {
    // File paths for credentials and tokens
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
    const TOKEN_PATH = path.join(__dirname, 'token.json');
    const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

    /**
     * Reads previously authorized credentials from the save file.
     *
     * @return {Promise<OAuth2Client|null>}
     */
    async function loadSavedCredentialsIfExist() {
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
     *
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
        let client = await loadSavedCredentialsIfExist();
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
 * Inserts or replaces values in a specified range in a Google Sheet.
 *
 * @param {string} spreadsheetId The ID of the spreadsheet.
 * @param {string} range The range to update (e.g., "Sheet1!A1:C3").
 * @param {Array<Array<string>>} values 2D array of values to insert.
 * @return {Promise<Object>}
 */
const PUT = async (spreadsheetId, range, values) => {
    console.log('put');
    const auth = await authenticateClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const resource = { values };
    const res = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource,
    });

    return res.data;
}

/**
 * Retrieves values from a specified range in a Google Sheet.
 *
 * @param {string} spreadsheetId The ID of the spreadsheet.
 * @param {string} range The range to retrieve (e.g., "Sheet1!A1:C3").
 * @return {Promise<Array<Array<string>>>}
 */
const GET = async (spreadsheetId, range) => {
    console.log('get');
    const auth = await authenticateClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    return res.data.values || [];
}

/**
 * Clears values from a specified range in a Google Sheet.
 *
 * @param {string} spreadsheetId The ID of the spreadsheet.
 * @param {string} range The range to clear (e.g., "Sheet1!A1:C3").
 * @return {Promise<Object>}
 */
const DEL = async (spreadsheetId, range) => {
    console.log('del');
    const auth = await authenticateClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const res = await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
    });

    return res.data;
}
}

export default db;

/*
const { putValues, getValues, deleteValues } = require('./sheetsApi');

const SPREADSHEET_ID = 'your-spreadsheet-id';
const RANGE = 'Sheet1!A1:C3';

// PUT: Insert or replace values
putValues(SPREADSHEET_ID, RANGE, [
    ['Name', 'Age', 'Email'],
    ['Alice', '30', 'alice@example.com'],
    ['Bob', '25', 'bob@example.com'],
])
    .then(response => console.log('PUT Response:', response))
    .catch(err => console.error('PUT Error:', err));

// GET: Retrieve values
getValues(SPREADSHEET_ID, RANGE)
    .then(values => console.log('GET Values:', values))
    .catch(err => console.error('GET Error:', err));

// DELETE: Clear values
deleteValues(SPREADSHEET_ID, RANGE)
    .then(response => console.log('DELETE Response:', response))
    .catch(err => console.error('DELETE Error:', err));

*/