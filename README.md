<p align="center"><img src="icons/128.png" alt="PRaise icon" width="128" height="128"></p>

# PRaise

Positive PR affirmations. Right-click in a text box on a github.com pull request page, choose "PRaise", and a short, friendly, humorous Message is inserted at the cursor. The comment is never submitted.

Messages come from [Pollinations](https://text.pollinations.ai) with a 3 second timeout. On any failure a Fallback message from a built-in list is used instead. The prompt is static and never contains PR or code content (see `docs/adr/0001-*`). Terms are defined in `GLOSSARY.md`.

## Install (unpacked)

1. Open `chrome://extensions` and turn on Developer mode.
2. Click "Load unpacked" and choose this folder.

## Test

    npm test

Uses Node's built-in test runner; no dependencies.

## Manual checklist

- [ ] Right-click in a PR comment box: "PRaise" appears.
- [ ] Right-click on a non-PR github.com page: it does not appear.
- [ ] Right-click on a non-editable area of a PR page: it does not appear.
- [ ] Clicking inserts a Message at the cursor; a selection is replaced.
- [ ] Undo (Cmd+Z) removes the inserted text.
- [ ] Clicking twice quickly inserts only one Message.
- [ ] With the network off, a Fallback message is inserted.
- [ ] The comment is not submitted.
