import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';

const __dirname = import.meta.dirname;

// Configuration
const manifestUrl = "https://example.com/releases/version.json";
const appPath = path.join(__dirname, 'app'); // Path to the app's files
const tempDir = path.join(__dirname, 'temp'); // Temporary directory for downloads

// Access localStorage in Electron's renderer process

// Utility: Load state from localStorage
function loadState() {
  const state = localStorage.getItem('updaterState');
  return state ? JSON.parse(state) : { files: [] };
}

// Utility: Save state to localStorage
function saveState(state) {
  localStorage.setItem('updaterState', JSON.stringify(state));
}

// Utility: Calculate file checksum (SHA-256)
function calculateChecksum(filePath) {
  const hash = crypto.createHash('sha256');
  const fileData = fs.readFileSync(filePath);
  hash.update(fileData);
  return hash.digest('hex');
}

// Utility: Download a file to a temporary location
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => reject(err)); // Cleanup on error
    });
  });
}

// Update function
async function updateApp() {
  console.log("Fetching update manifest...");
  https.get(manifestUrl, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', async () => {
      try {
        const manifest = JSON.parse(data);
        console.log(`New version: ${manifest.version}`);

        // Load state
        const state = loadState();

        // Add new files to state if not already present
        manifest.modifiedFiles.forEach((file) => {
          const existingFile = state.files.find((f) => f.path === file.path);
          if (!existingFile) {
            state.files.push({ ...file, finished: false });
          }
        });

        // Save updated state
        saveState(state);

        // Ensure temp directory exists
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        // Process each file
        for (const file of state.files) {
          if (!file.finished) {
            const tempFilePath = path.join(tempDir, path.basename(file.path));

            // Download file
            console.log(`Downloading: ${file.path}`);
            await downloadFile(file.url, tempFilePath);

            // Validate checksum
            const downloadedChecksum = calculateChecksum(tempFilePath);
            if (downloadedChecksum !== file.checksum) {
              console.error(`Checksum mismatch for: ${file.path}`);
              continue;
            }

            // Move file to destination
            const destFilePath = path.join(appPath, file.path);
            const destDir = path.dirname(destFilePath);
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }
            fs.renameSync(tempFilePath, destFilePath);

            // Mark file as finished
            file.finished = true;
            saveState(state);

            console.log(`Updated: ${file.path}`);
          }
        }

        console.log("Update completed!");
      } catch (error) {
        console.error("Failed to process manifest:", error);
      }
    });
  }).on('error', (err) => {
    console.error("Failed to fetch manifest:", err);
  });
}

// On app start, check for pending downloads
async function resumePendingDownloads() {
  const state = loadState();
  if (state.files.some((file) => !file.finished)) {
    console.log("Resuming pending downloads...");
    await updateApp();
  } else {
    console.log("No pending updates.");
  }
}

// Start the updater
resumePendingDownloads();
