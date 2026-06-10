import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { StateStore } from '../src/stateStore.js';

test('persists and reads the last post id', async () => {
  const filePath = path.join(
    os.tmpdir(),
    `truth-social-monitor-${Date.now()}-${Math.random()}`,
    'state.json'
  );
  const store = new StateStore(filePath);

  assert.deepEqual(await store.read(), { lastPostId: null, updatedAt: null });

  await store.writeLastPostId('abc123');
  const state = await store.read();

  assert.equal(state.lastPostId, 'abc123');
  assert.match(state.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
});
