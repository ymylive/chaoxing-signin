const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const path = require('path');

const {
  resolveStaticAssetPath,
  getHeaderToken,
  getDefaultListenHost,
  getUploadToken,
  attachProcessExitCleanup,
} = require('../src/serve-boundary.ts');

const webRoot = path.resolve(__dirname, '../../web/dist');

test('resolveStaticAssetPath returns index.html for root requests', () => {
  assert.equal(resolveStaticAssetPath(webRoot, '/'), path.join(webRoot, 'index.html'));
});

test('resolveStaticAssetPath rejects traversal attempts even with allowed extension', () => {
  assert.equal(resolveStaticAssetPath(webRoot, '/../../danger.js'), null);
  assert.equal(resolveStaticAssetPath(webRoot, '/../../package.json'), null);
  assert.equal(resolveStaticAssetPath(webRoot, '/../../secrets.txt'), null);
});

test('getHeaderToken only accepts explicit string headers', () => {
  assert.equal(getHeaderToken('monitor-token'), 'monitor-token');
  assert.equal(getHeaderToken(['monitor-token']), '');
  assert.equal(getHeaderToken(undefined), '');
});

test('getDefaultListenHost binds local server traffic to localhost', () => {
  assert.equal(getDefaultListenHost(false), '127.0.0.1');
  assert.equal(getDefaultListenHost(true), null);
});

test('getUploadToken reads X-Upload-Token first and keeps query fallback', () => {
  assert.equal(getUploadToken('header-token', 'query-token'), 'header-token');
  assert.equal(getUploadToken('', 'query-token'), 'query-token');
  assert.equal(getUploadToken(undefined, 'query-token'), 'query-token');
  assert.equal(getUploadToken(undefined, undefined), '');
});

test('attachProcessExitCleanup clears map entry only for the matching process', () => {
  const processMap = new Map();
  const oldProcess = new EventEmitter();
  const activeProcess = new EventEmitter();

  processMap.set('13800000000', { process: oldProcess, token: 'token-a', state: 'running' });
  attachProcessExitCleanup(processMap, '13800000000', oldProcess);

  processMap.set('13800000000', { process: activeProcess, token: 'token-b', state: 'running' });
  oldProcess.emit('exit', 0, null);
  assert.equal(processMap.get('13800000000').process, activeProcess);

  attachProcessExitCleanup(processMap, '13800000000', activeProcess);
  activeProcess.emit('exit', 0, null);
  assert.equal(processMap.has('13800000000'), false);
});
