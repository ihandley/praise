export const FALLBACK_MESSAGES = [
  'Looks good to me, ship it!',
  'Approved. This code is tidier than my desk.',
  'Clean, clear, and mergeable. Nice work!',
  'Chef\'s kiss. Merge away.',
  'No notes. Well, one: great job.',
  'This diff sparks joy. Approved.',
  'Ship it before I find something to nitpick.',
  'Reads like a good book. Approved.',
  'Tests pass, vibes pass. Merge it!',
  'Smooth as butter. Looks good!',
  'Nothing to see here but excellent code.',
  'You make this look easy. Approved!',
  'Solid work. I would merge this on a Friday.',
  'Bug-free as far as these eyes can tell. Nice!',
  'Beautifully done. Go forth and merge.',
  'Gold star for this one. Approved.',
  'I looked for problems and came up empty. Great job!',
  'Crisp, clean, and ready to ship.',
  'Two thumbs up, zero nitpicks.',
  'This is the way. Approved.',
];

const MAX_LENGTH = 120;
const ENDPOINT = 'https://text.pollinations.ai/';
const PROMPT =
  'Write one short humorous friendly code review approval, max 12 words, no quotes, no emoji';

function buildUrl(random) {
  const seed = Math.floor(random() * 1e9);
  return `${ENDPOINT}${encodeURIComponent(PROMPT)}?seed=${seed}`;
}

export async function generateMessage({ fetch, random, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(buildUrl(random), { signal: controller.signal });
    if (!res.ok) return pickFallback(random);
    const text = clean(await res.text());
    if (!text || text.length > MAX_LENGTH || text.startsWith('{')) return pickFallback(random);
    return text;
  } catch {
    return pickFallback(random);
  } finally {
    clearTimeout(timer);
  }
}

function clean(text) {
  return text
    .trim()
    .replace(/^["'\u201c\u2018]+|["'\u201d\u2019]+$/g, '')
    .trim()
    .replace(/[\u2013\u2014]/g, '-');
}

function pickFallback(random) {
  return FALLBACK_MESSAGES[Math.floor(random() * FALLBACK_MESSAGES.length)];
}
