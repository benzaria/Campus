import { authorize } from "./strg.js";
import { google } from "googleapis";
import { promises as fs } from "node:fs";
import path from "node:path";

// Function to list all files in a folder with pagination
async function listAllFiles(drive, folderId) {
    let files = [];
    let pageToken = null;

    do {
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'nextPageToken, files(id, name, mimeType)',
            spaces: 'drive',
            pageToken,
        });

        files = files.concat(response.data.files); // Append files from the current page
        pageToken = response.data.nextPageToken; // Update the page token for the next iteration
    } while (pageToken);

    return files;
}

// Recursive function to build the Drive tree
async function buildDriveTree(drive, folderId = 'root') {
    const tree = {};

    // Get all files and folders in the current folder
    const files = await listAllFiles(drive, folderId);

    for (const file of files) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
            // If the item is a folder, recurse into it
            tree[file.name] = await buildDriveTree(drive, file.id);
        } else {
            // Add file details
            tree[file.name] = { id: file.id, type: file.mimeType };
        }
    }

    return tree;
}

async function main() {
    const auth = await authorize();
    const drive = google.drive({ version: 'v3', auth });

    try {
        // Generate the tree starting from the root folder
        const driveTree = await buildDriveTree(drive);
        const strgTree = JSON.stringify(driveTree, null, 2)
        // Output the tree as a formatted JSON
        console.log(strgTree);
        fs.writeFile(path.join(import.meta.dirname, 'tree.json'), strgTree)
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
