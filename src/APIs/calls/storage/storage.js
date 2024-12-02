// TODO - Make a storage api
const fs = require('fs').promises;
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const strg = () => {
    // Define file paths
    const SCOPES = ['https://www.googleapis.com/auth/drive'];
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
 * Uploads or replaces a file in Google Drive.
 *
 * @param {string} name The name of the file.
 * @param {string} mimeType The MIME type of the file.
 * @param {string} filePath The local path of the file to upload.
 * @param {string|null} fileId Optional: The ID of the file to replace (if updating an existing file).
 * @return {Promise<Object>}
 */
async function PUT(name, mimeType, filePath, fileId = null) {
    const auth = await authenticateClient();
    const drive = google.drive({ version: 'v3', auth });

    const media = {
        mimeType,
        body: await fs.readFile(filePath),
    };

    const fileMetadata = { name };

    let response;
    if (fileId) {
        response = await drive.files.update({
            fileId,
            media,
            resource: fileMetadata,
        });
    } else {
        response = await drive.files.create({
            media,
            resource: fileMetadata,
            fields: 'id',
        });
    }

    return response.data;
}

/**
 * Retrieves metadata or downloads the content of a file from Google Drive.
 *
 * @param {string} fileId The ID of the file to retrieve.
 * @param {boolean} download If true, download the file content; otherwise, return metadata.
 * @param {string|null} downloadPath Optional: Local path to save the downloaded file.
 * @return {Promise<Object|string>}
 */
async function GET(fileId, download = false, downloadPath = null) {
    const auth = await authenticateClient();
    const drive = google.drive({ version: 'v3', auth });

    if (download && downloadPath) {
        const dest = await fs.open(downloadPath, 'w');
        await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' },
            (err, res) => {
                if (err) throw err;

                res.data
                    .on('end', () => console.log('File downloaded.'))
                    .on('error', (err) => console.error('Error downloading file:', err))
                    .pipe(dest.createWriteStream());
            }
        );
        return `File downloaded to ${downloadPath}`;
    } else {
        const response = await drive.files.get({ fileId, fields: '*' });
        return response.data;
    }
}

/**
 * Deletes a file from Google Drive.
 *
 * @param {string} fileId The ID of the file to delete.
 * @return {Promise<Object>}
 */
async function DEL(fileId) {
    const auth = await authenticateClient();
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.delete({ fileId });
    return response.data;
}
}

export default strg;

/*
const { putFile, getFile, deleteFile } = require('./driveApi');

const FILE_NAME = 'example.txt';
const MIME_TYPE = 'text/plain';
const FILE_PATH = './example.txt';
const FILE_ID = 'your-file-id'; // Replace with the actual file ID if updating an existing file.

// PUT: Upload a file
putFile(FILE_NAME, MIME_TYPE, FILE_PATH)
    .then(response => console.log('PUT Response:', response))
    .catch(err => console.error('PUT Error:', err));

// GET: Retrieve metadata
getFile(FILE_ID)
    .then(metadata => console.log('GET Metadata:', metadata))
    .catch(err => console.error('GET Metadata Error:', err));

// GET: Download file content
getFile(FILE_ID, true, './downloaded_example.txt')
    .then(response => console.log('GET Download Response:', response))
    .catch(err => console.error('GET Download Error:', err));

// DEL: Delete a file
deleteFile(FILE_ID)
    .then(response => console.log('DELETE Response:', response))
    .catch(err => console.error('DELETE Error:', err));

*/