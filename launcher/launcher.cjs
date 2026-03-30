#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const os = require('os');

// Parse command line arguments
const args = process.argv.slice(2);
const isDebug = args.includes('--debug');
const noElevate = args.includes('--no-elevate');
const isPortable = args.includes('--portable');
const syncUI = args.includes('--sync');

// Determine if running as packaged executable
const isPackaged = typeof process.pkg !== 'undefined';

// Determine working directory
let workDir;
let isPortableMode = false;

if (isPackaged) {
  const exeDir = path.dirname(process.execPath);
  const hasProjectFiles = fs.existsSync(path.join(exeDir, 'package.json'));

  if (isPortable || !hasProjectFiles) {
    // Portable mode: use AppData
    isPortableMode = true;
    const appDataDir = path.join(os.homedir(), 'AppData', 'Local', 'ChaoxingSignin');
    workDir = path.join(appDataDir, 'app');

    // Create directories if they don't exist
    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir, { recursive: true });
    }

    // Initialize portable mode on first run
    if (!fs.existsSync(path.join(workDir, 'package.json'))) {
      console.log('Initializing portable mode...');
      initializePortableMode(exeDir, workDir, syncUI);
    }
  } else {
    // Project mode: use exe directory
    workDir = exeDir;
  }
} else {
  // Development mode: use current directory
  workDir = process.cwd();
}

if (isDebug) {
  console.log('Working directory:', workDir);
  console.log('Portable mode:', isPortableMode);
  console.log('Packaged:', isPackaged);
}

// Start the server
const serverPath = path.join(workDir, 'apps', 'server', 'build', 'index.js');

if (!fs.existsSync(serverPath)) {
  console.error('Error: Server build not found at', serverPath);
  console.error('Please run: pnpm run prepack:build');
  process.exit(1);
}

// Check if node_modules exists
const nodeModulesPath = path.join(workDir, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('Installing dependencies...');
  installDependencies(workDir);
}

// Start the server
console.log('Starting Chaoxing Signin...');
const server = spawn('node', [serverPath], {
  cwd: workDir,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

server.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle process termination
process.on('SIGINT', () => {
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
});

// Helper functions
function initializePortableMode(sourceDir, targetDir, syncUI) {
  console.log('Copying project files...');

  // Files to copy
  const filesToCopy = [
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'turbo.json'
  ];

  // Directories to copy
  const dirsToCopy = ['apps', 'packages'];

  // Copy files
  filesToCopy.forEach(file => {
    const src = path.join(sourceDir, file);
    const dest = path.join(targetDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied: ${file}`);
    }
  });

  // Copy directories
  dirsToCopy.forEach(dir => {
    const src = path.join(sourceDir, dir);
    const dest = path.join(targetDir, dir);
    if (fs.existsSync(src)) {
      copyRecursive(src, dest);
      console.log(`Copied: ${dir}/`);
    }
  });

  // Install dependencies
  console.log('Installing dependencies...');
  installDependencies(targetDir);

  console.log('Portable mode initialized successfully!');
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function installDependencies(workDir) {
  const { execSync } = require('child_process');

  try {
    // Check if pnpm is available
    execSync('pnpm --version', { stdio: 'ignore' });

    // Install with pnpm
    console.log('Running: pnpm install');
    execSync('pnpm install', {
      cwd: workDir,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    console.error('Please install pnpm: npm install -g pnpm');
    process.exit(1);
  }
}
