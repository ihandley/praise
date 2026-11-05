chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type !== 'praise-insert') return;
  const el = document.activeElement;
  if (!el || !(el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement)) return;
  el.focus();
  if (!document.execCommand('insertText', false, msg.text)) {
    el.setRangeText(msg.text, el.selectionStart, el.selectionEnd, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
});
