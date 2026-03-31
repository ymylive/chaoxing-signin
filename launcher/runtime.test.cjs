const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const {
  getPortableBaseDir,
  resolveLaunchContext,
  getServerCommand,
} = require('./runtime.cjs');

test('getPortableBaseDir uses Application Support on macOS', () => {
  assert.equal(
    getPortableBaseDir({
      platform: 'darwin',
      homedir: '/Users/tester',
      env: {},
    }),
    '/Users/tester/Library/Application Support/ChaoxingSignin'
  );
});

test('resolveLaunchContext uses snapshot root for packaged portable mode', () => {
  const snapshotRoot = '/snapshot/chaoxing-signin';
  const result = resolveLaunchContext({
    isPackaged: true,
    isPortable: false,
    cwd: '/worktree',
    exeDir: '/Applications/超星学习通签到.app/Contents/MacOS',
    snapshotDir: path.join(snapshotRoot, 'launcher'),
    env: {},
    homedir: '/Users/tester',
    platform: 'darwin',
    hasExternalProjectFiles: false,
  });

  assert.deepEqual(result, {
    isPortableMode: true,
    sourceDir: snapshotRoot,
    workDir: '/Users/tester/Library/Application Support/ChaoxingSignin/app',
  });
});

test('getServerCommand uses packaged runtime when bundled', () => {
  assert.deepEqual(
    getServerCommand({
      isPackaged: true,
      processExecPath: '/Applications/超星学习通签到.app/Contents/MacOS/chaoxing-macos-arm64.bin',
      serverPath: '/Users/tester/Library/Application Support/ChaoxingSignin/app/apps/server/build/index.js',
    }),
    {
      command: '/Applications/超星学习通签到.app/Contents/MacOS/chaoxing-macos-arm64.bin',
      args: ['/Users/tester/Library/Application Support/ChaoxingSignin/app/apps/server/build/index.js'],
    }
  );
});
