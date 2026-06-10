import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePosts } from '../src/truthSocialSource.js';

test('normalizes array payloads newest first', () => {
  const posts = normalizePosts([
    {
      id: '1',
      content: '<p>Older &amp; escaped</p>',
      created_at: '2026-06-09T10:00:00Z',
      url: 'https://truthsocial.com/@realDonaldTrump/posts/1'
    },
    {
      id: '2',
      content: '<p>Newer</p>',
      created_at: '2026-06-09T11:00:00Z'
    }
  ]);

  assert.equal(posts[0].id, '2');
  assert.equal(posts[1].content, 'Older & escaped');
});

test('normalizes wrapped statuses payloads', () => {
  const posts = normalizePosts({
    statuses: [{ post_id: 123, text: 'Hello', createdAt: '2026-06-09T11:00:00Z' }]
  });

  assert.deepEqual(posts.map((post) => post.id), ['123']);
});

test('throws on unsupported source shape', () => {
  assert.throws(() => normalizePosts({ account: {} }), /must be an array/);
});
