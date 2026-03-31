#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const os = require('os');
const { getServerCommand, resolveLaunchContext } = require('./runtime.cjs');

// Parse command line arguments
const args = process.argv.slice(2);
const isDebug = args.includes('--debug');
const noElevate = args.includes('--no-elevate');
const isPortable = args.includes('--portable');
const syncUI = args.includes('--sync');

// Determine if running as packaged executable
const isPackaged = typeof process.pkg !== 'undefined';

// Determine working directory
const exeDir = path.dirname(process.execPath);
const launchContext = resolveLaunchContext({
  isPackaged,
  isPortable,
  cwd: process.cwd(),
  exeDir,
  snapshotDir: __dirname,
  env: process.env,
  homedir: os.homedir(),
  platform: os.platform(),
  hasExternalProjectFiles: fs.existsSync(path.join(exeDir, 'package.json')),
});
const workDir = launchContext.workDir;
const isPortableMode = launchContext.isPortableMode;

if (isPortableMode) {
  if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir, { recursive: true });
  }
}

if (isDebug) {
  console.log('Working directory:', workDir);
  console.log('Portable mode:', isPortableMode);
  console.log('Packaged:', isPackaged);
}

// Start the server
const serverPath = isPackaged
  ? path.join(launchContext.sourceDir, 'apps', 'server', 'build', 'index.js')
  : path.join(workDir, 'apps', 'server', 'build', 'index.js');

if (!fs.existsSync(serverPath)) {
  console.error('Error: Server build not found at', serverPath);
  console.error('Please run: pnpm run prepack:build');
  process.exit(1);
}

// Check if node_modules exists
const nodeModulesPath = path.join(workDir, 'node_modules');
const serverNodeModulesPath = path.join(workDir, 'apps', 'server', 'node_modules');
if (!isPackaged && !fs.existsSync(nodeModulesPath) && !fs.existsSync(serverNodeModulesPath)) {
  if (isPackaged) {
    console.error('Error: Embedded dependencies missing at', serverNodeModulesPath);
    process.exit(1);
  }
  console.log('Installing dependencies...');
  installDependencies(workDir);
}

// Start the server
console.log('Starting Chaoxing Signin...');
const { command, args: serverArgs } = getServerCommand({
  isPackaged,
  processExecPath: process.execPath,
  serverPath,
});
const server = spawn(command, serverArgs, {
  cwd: workDir,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production', CHAOXING_DATA_DIR: workDir }
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
  const dirsToCopy = ['apps/server/build', 'apps/server/node_modules', 'apps/web/dist'];

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

  const entries = fs.readdirSync(src);

  for (const entry of entries) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const isDirectory = fs.statSync(srcPath).isDirectory();

    if (isDirectory) {
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
