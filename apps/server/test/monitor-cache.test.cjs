const test = require('node:test');
const assert = require('node:assert/strict');

const { MonitorPendingQRStore } = require('../src/utils/monitor-cache');

test('stores pending qr context per activity and consumes latest first', () => {
  const store = new MonitorPendingQRStore({ timeoutMs: 30_000, now: () => 1_000 });

  store.setPending('chat-1', 'activity-1', { activeId: 'activity-1' });
  store.setPending('chat-1', 'activity-2', { activeId: 'activity-2' });

  const first = store.consumeLatest('chat-1');
  assert.equal(first.expiredCount, 0);
  assert.equal(first.entry?.activityId, 'activity-2');

  const second = store.consumeLatest('chat-1');
  assert.equal(second.expiredCount, 0);
  assert.equal(second.entry?.activityId, 'activity-1');
});

test('clearPending removes stale non-qr state', () => {
  const store = new MonitorPendingQRStore({ timeoutMs: 30_000, now: () => 1_000 });
  store.setPending('chat-1', 'activity-1', { activeId: 'activity-1' });

  store.clearPending('chat-1', 'activity-1');
  const consumed = store.consumeLatest('chat-1');

  assert.equal(consumed.entry, undefined);
  assert.equal(consumed.expiredCount, 0);
});

test('consumeLatest clears expired pending qr context', () => {
  let now = 1_000;
  const store = new MonitorPendingQRStore({ timeoutMs: 100, now: () => now });

  store.setPending('chat-1', 'activity-1', { activeId: 'activity-1' });
  now = 1_500;

  const consumed = store.consumeLatest('chat-1');
  assert.equal(consumed.entry, undefined);
  assert.equal(consumed.expiredCount, 1);
  assert.equal(store.size, 0);
});
