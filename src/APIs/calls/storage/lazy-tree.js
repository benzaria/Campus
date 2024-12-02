import { google } from 'googleapis';
import { authorize } from './strg.js';
import { promises as fs } from 'node:fs';
import _path from "node:path";

const driveTree = {}; // Global tree structure to hold the Drive data

async function listContent(drive, folderId) {
    console.log('calling API', folderId);
    
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
    console.log(files);
    
    return files;
}

// Helper function to find a node in the driveTree based on a path
function findNode(path) {
    console.log(`findNode = ${path}`);
    
    const parts = path.split('/').filter((part) => part); // Split and remove empty parts
    let currentNode = driveTree;

    for (const part of parts) {
        if (!currentNode[part]) {
            //currentNode[part] = { _loaded: false };
            console.error(`Folder "${part}" not found in path "${path}"`);
            return;
        }
        //console.log(currentNode, currentNode[part]);
        currentNode = currentNode[part];
    }

    return currentNode;
}


// Main tree function to populate a folder's contents
async function tree(drive, path = '/', force = false) {
    const parts = path.split('/').filter((part) => part) //Break path into parts
    console.log('parts :', parts);
    
    let currentPath = '/';
    let parentId = 'root';

    //for (const part of parts)
    for (let i = 0; i <= parts.length; i++) {
        
        const node = findNode(currentPath);
        if (!node) return;
        // Check if the current node needs to be loaded
        if (!node._loaded || force) {
            const files = await listContent(drive, parentId);

            // Populate the current node with subfolders and files
            for (const file of files) {
                if (file.mimeType === 'application/vnd.google-apps.folder') {
                    node[file.name] = { _id: file.id, _loaded: false };
                } else {
                    node[file.name] = { id: file.id, type: file.mimeType };
                }
            }

            // Mark the current folder as loaded
            node._loaded = true;
        }

        // Move to the next folder in the path
        currentPath += `${parts[i]}/`;
        console.log('part :', parts[i]);
        // Get the parent ID for the next iteration
        parentId = node[parts[i]]?._id;
    }

    console.log(`Contents of "${path}" loaded.`);
    fs.writeFile(_path.join(import.meta.dirname, 'tree.json'), JSON.stringify(driveTree, null, 2))
}


// Example usage
async function main() {
    const auth = await authorize();
    const drive = google.drive({ version: 'v3', auth });

    try {
        // Load root contents
        await tree(drive, '/A1/M1');
        console.log('-------------------------------------------------------------------------------------');
        await tree(drive, '/A1/M1', true);
        console.log('-------------------------------------------------------------------------------------');
        await tree(drive, '/A1/M3');
        console.log('-------------------------------------------------------------------------------------');
        await tree(drive, '/A1/M4/dd');

        console.log('Root:', JSON.stringify(driveTree, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
