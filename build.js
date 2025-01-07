import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Build the project using Vite
console.log("[INFO] Building the project with Vite...");
runCommand("npx vite build");

// Directories and paths
const distDir = path.resolve("dist");
const srcDataDir = path.resolve("src", "app", "data");
const destDataDir = path.join(distDir, "data");

// Copy data directory
if (fs.existsSync(srcDataDir)) {
    console.log(`[INFO] Copying data from "${srcDataDir}" to "${destDataDir}".`);
    fs.cpSync(srcDataDir, destDataDir, { recursive: true });
} else {
    console.warn(`[WARNING] Source data directory "${srcDataDir}" does not exist.`);
}

console.log("[INFO] Build process completed.");


// Function to execute a command
function runCommand(command) {
    try {
        execSync(command, { stdio: "inherit" });
    } catch (error) {
        console.error(`[ERROR] Command failed: ${command}`);
        process.exit(1);
    }
}