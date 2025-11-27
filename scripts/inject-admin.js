const path = require('path');
const fs = require('fs');
const rcedit = require('rcedit');

(async () => {
  try {
    const exe = path.resolve(__dirname, '..', 'dist', 'ChaoxingSignin.exe');
    const manifest = path.resolve(__dirname, 'admin.manifest');
    if (!fs.existsSync(exe)) {
      console.error('EXE not found:', exe);
      process.exit(1);
    }
    if (!fs.existsSync(manifest)) {
      console.error('Manifest not found:', manifest);
      process.exit(1);
    }
    await new Promise((resolve, reject) => {
      rcedit(exe, { 'application-manifest': manifest }, (err) => (err ? reject(err) : resolve()));
    });
    console.log('Admin manifest injected into', exe);
  } catch (e) {
    console.error('rcedit error:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
