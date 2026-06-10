export async function fetchPosts(config) {
  const headers = {
    accept: 'application/json',
    'user-agent': 'truth-social-email-monitor/1.0'
  };
  if (config.truthSocialAuthToken) {
    headers.authorization = `Bearer ${config.truthSocialAuthToken}`;
  }

  const response = await fetch(config.truthSocialSourceUrl, { headers });
  if (!response.ok) {
    const detail = await safeReadText(response);
    throw new Error(
      `Truth Social source returned ${response.status} ${response.statusText}${detail ? `: ${detail}` : ''}`
    );
  }

  const payload = await response.json();
  console.info('Successfully fetched CNN feed');
  return normalizePosts(payload);
}

export function normalizePosts(payload) {
  const rawPosts = pickPostArray(payload);
  return rawPosts
    .map(normalizePost)
    .filter(Boolean)
    .sort(compareNewestFirst);
}

function pickPostArray(payload) {
  if (Array.isArray(payload)) return payload;

  for (const key of ['statuses', 'posts', 'results', 'data', 'items']) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  throw new Error(
    'Truth Social source JSON must be an array or contain statuses, posts, results, data, or items.'
  );
}

function normalizePost(post) {
  const id = post?.id ?? post?.post_id ?? post?.uuid ?? post?.url;
  if (!id) return null;

  return {
    id: String(id),
    url: post.url ?? post.uri ?? post.link ?? null,
    content: cleanPostContent(post.content ?? post.text ?? post.body ?? post.message ?? ''),
    createdAt: post.created_at ?? post.createdAt ?? post.date ?? null,
    raw: post
  };
}

function cleanPostContent(value) {
  return String(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function compareNewestFirst(a, b) {
  const aTime = Date.parse(a.createdAt ?? '');
  const bTime = Date.parse(b.createdAt ?? '');
  if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
    return bTime - aTime;
  }
  return b.id.localeCompare(a.id, undefined, { numeric: true });
}

async function safeReadText(response) {
  try {
    const text = await response.text();
    return text.slice(0, 500);
  } catch {
    return '';
  }
}
