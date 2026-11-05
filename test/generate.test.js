import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateMessage, FALLBACK_MESSAGES } from '../src/generate.js';

const reply = (body, status = 200) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => body,
});

test('returns the generated reply, trimmed', async () => {
  const msg = await generateMessage({
    fetch: reply('  Ship it, this code is tidier than my desk.\n'),
    random: () => 0.5,
    timeoutMs: 100,
  });
  assert.equal(msg, 'Ship it, this code is tidier than my desk.');
});

test('replaces en and em dashes with a plain dash', async () => {
  const msg = await generateMessage({
    fetch: reply('Nice work \u2014 clean \u2013 tidy'),
    random: () => 0.5,
    timeoutMs: 100,
  });
  assert.equal(msg, 'Nice work - clean - tidy');
});

test('falls back when the reply is longer than 120 characters', async () => {
  const msg = await generateMessage({ fetch: reply('a'.repeat(121)), random: () => 0, timeoutMs: 100 });
  assert.ok(FALLBACK_MESSAGES.includes(msg));
});

test('falls back on an error JSON body', async () => {
  const body = '{"status":503,"success":false,"error":{"code":"SERVICE_UNAVAILABLE"}}';
  const msg = await generateMessage({ fetch: reply(body), random: () => 0, timeoutMs: 100 });
  assert.ok(FALLBACK_MESSAGES.includes(msg));
});

test('falls back on a non-2xx status', async () => {
  const msg = await generateMessage({ fetch: reply('Nice job', 503), random: () => 0, timeoutMs: 100 });
  assert.ok(FALLBACK_MESSAGES.includes(msg));
});

test('falls back on an empty reply', async () => {
  const msg = await generateMessage({ fetch: reply('   '), random: () => 0, timeoutMs: 100 });
  assert.ok(FALLBACK_MESSAGES.includes(msg));
});

test('falls back when fetch rejects', async () => {
  const msg = await generateMessage({
    fetch: async () => { throw new Error('offline'); },
    random: () => 0,
    timeoutMs: 100,
  });
  assert.ok(FALLBACK_MESSAGES.includes(msg));
});

test('falls back when the request exceeds the timeout', async () => {
  const hang = (url, { signal }) => new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')));
  });
  const started = Date.now();
  const msg = await generateMessage({ fetch: hang, random: () => 0, timeoutMs: 30 });
  assert.ok(FALLBACK_MESSAGES.includes(msg));
  assert.ok(Date.now() - started < 1000);
});

test('sends a different seed on each call', async () => {
  const urls = [];
  const capture = async (url) => { urls.push(url); return { ok: true, status: 200, text: async () => 'Nice work' }; };
  let n = 0;
  const random = () => [0.11, 0.22][n++ % 2];
  await generateMessage({ fetch: capture, random, timeoutMs: 100 });
  await generateMessage({ fetch: capture, random, timeoutMs: 100 });
  const seeds = urls.map((u) => new URL(u).searchParams.get('seed'));
  assert.equal(seeds.length, 2);
  assert.notEqual(seeds[0], seeds[1]);
});

test('requests the Pollinations text endpoint', async () => {
  let seen;
  const capture = async (url) => { seen = url; return { ok: true, status: 200, text: async () => 'Nice' }; };
  await generateMessage({ fetch: capture, random: () => 0.5, timeoutMs: 100 });
  assert.equal(new URL(seen).host, 'text.pollinations.ai');
});

test('fallback choice follows random', async () => {
  const fail = async () => { throw new Error('x'); };
  const first = await generateMessage({ fetch: fail, random: () => 0, timeoutMs: 100 });
  const last = await generateMessage({ fetch: fail, random: () => 0.999, timeoutMs: 100 });
  assert.equal(first, FALLBACK_MESSAGES[0]);
  assert.equal(last, FALLBACK_MESSAGES[FALLBACK_MESSAGES.length - 1]);
});

test('no fallback message contains an en or em dash', () => {
  for (const m of FALLBACK_MESSAGES) assert.doesNotMatch(m, /[\u2013\u2014]/);
});
