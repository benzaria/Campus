import { promises as fs } from 'fs';
import { authenticate } from '@google-cloud/local-auth';
import { OAuth2Client } from "google-auth-library";
import { google } from 'googleapis';
import path from 'path';

const __dirname = import.meta.dirname

const SCOPES = {
    mailer: ['https://www.googleapis.com/auth/gmail.send'],
    storage: ['https://www.googleapis.com/auth/drive'],
    database: ['https://www.googleapis.com/auth/spreadsheets']
}
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

//const tokenscontent = JSON.parse(await fs.readFile(TOKEN_PATH));
//const credentialscontent = JSON.parse(await fs.readFile(CREDENTIALS_PATH));

/**
/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadCredentials(api) {
    try {
        const tokenContent = await fs.readFile(TOKEN_PATH, 'utf-8');
        const token = JSON.parse(tokenContent);

        // Create an OAuth2Client and set its credentials
        const credentialsContent = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
        const credentials = JSON.parse(credentialsContent);
        const { client_id, client_secret, redirect_uris } = credentials[api].installed;

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
export default async function authorize(api) {
   const oAuth2Client = await loadCredentials(api);
   if (oAuth2Client) {
       console.log('Using existing credentials.');
       return oAuth2Client;
   }

   // Load credentials from file
   const credentialsContent = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
   const credentials = JSON.parse(credentialsContent);
   const { client_id, client_secret, redirect_uris } = credentials[api].installed;

   const newOAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

   // Generate the URL for user consent
   const authUrl = newOAuth2Client.generateAuthUrl({
       access_type: 'offline',
       scope: SCOPES[api],
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

(async () => {
    try {
        //await authorize('mailer');
        //await authorize('database');
        await authorize('storage');
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
