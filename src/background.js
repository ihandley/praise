import { generateMessage } from './generate.js';

const MENU_ID = 'praise-insert';
const TIMEOUT_MS = 3000;
let inFlight = false;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Insert LGTM',
    contexts: ['editable'],
    documentUrlPatterns: ['https://github.com/*/pull/*'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab || inFlight) return;
  inFlight = true;
  try {
    const text = await generateMessage({
      fetch: globalThis.fetch.bind(globalThis),
      random: Math.random,
      timeoutMs: TIMEOUT_MS,
    });
    await chrome.tabs.sendMessage(tab.id, { type: 'praise-insert', text }, { frameId: info.frameId });
  } catch (err) {
    console.warn('PRaise: could not insert message. Reload the page and try again.', err);
  } finally {
    inFlight = false;
  }
});
