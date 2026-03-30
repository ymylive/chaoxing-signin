#!/usr/bin/env node

// Packaged entry point for pkg
// This file is used as the bin entry when building with pkg

const path = require('path');
const { spawn } = require('child_process');

// Get the actual launcher path
const launcherPath = path.join(__dirname, 'launcher.cjs');

// Forward all arguments to the actual launcher
const child = spawn(process.execPath, [launcherPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
