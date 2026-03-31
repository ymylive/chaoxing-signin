const path = require('path');

function getPortableBaseDir({ platform, homedir, env }) {
  if (platform === 'darwin') {
    return path.join(homedir, 'Library', 'Application Support', 'ChaoxingSignin');
  }

  if (platform === 'win32') {
    return path.join(env.LOCALAPPDATA || path.join(homedir, 'AppData', 'Local'), 'ChaoxingSignin');
  }

  return path.join(homedir, '.local', 'share', 'ChaoxingSignin');
}

function resolveLaunchContext({
  isPackaged,
  isPortable,
  cwd,
  exeDir,
  snapshotDir,
  env,
  homedir,
  platform,
  hasExternalProjectFiles,
}) {
  if (!isPackaged) {
    return {
      isPortableMode: false,
      sourceDir: cwd,
      workDir: cwd,
    };
  }

  return {
    isPortableMode: true,
    sourceDir: path.resolve(snapshotDir, '..'),
    workDir: path.join(getPortableBaseDir({ platform, homedir, env }), 'app'),
  };
}

function getServerCommand({ isPackaged, processExecPath, serverPath }) {
  return {
    command: isPackaged ? processExecPath : 'node',
    args: [serverPath],
  };
}

module.exports = {
  getPortableBaseDir,
  resolveLaunchContext,
  getServerCommand,
};
