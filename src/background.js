import { generateMessage } from './generate.js';

const MENU_ID = 'praise-insert';
const TIMEOUT_MS = 3000;
let inFlight = false;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'PRaise',
    contexts: ['editable'],
    documentUrlPatterns: ['https://github.com/*/pull/*'],
  });
});

function insertAtCursor(text) {
  const el = document.activeElement;
  if (!(el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement)) return false;
  el.focus();
  if (document.execCommand('insertText', false, text)) return true;
  el.setRangeText(text, el.selectionStart, el.selectionEnd, 'end');
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab || inFlight) return;
  inFlight = true;
  try {
    const text = await generateMessage({
      fetch: globalThis.fetch.bind(globalThis),
      random: Math.random,
      timeoutMs: TIMEOUT_MS,
    });
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id, frameIds: [info.frameId ?? 0] },
      func: insertAtCursor,
      args: [text],
    });
    if (!result?.result) console.warn('PRaise: no text box was focused, nothing inserted.');
  } catch (err) {
    console.error('PRaise: could not insert message.', err);
  } finally {
    inFlight = false;
  }
});
