# Third-party text generation with a local fallback

Status: accepted

## Context

PRaise inserts a varied, humorous approval Message into GitHub PR comment boxes. A fixed list gets stale. Chrome's built-in Gemini Nano needs about 22 GB free disk and 16 GB RAM, which is too heavy for a managed work laptop.

## Decision

Generate the Message by calling Pollinations (`text.pollinations.ai`, no key), with a random `seed` per request and a timeout of about 3 seconds. Validate the reply (trimmed, length-capped, not an error body, en/em dashes replaced with `-`). On any failure, pick a Fallback message from the built-in list.

The prompt is static. It must never include PR content, code, repo names or user data. The only thing sent off the machine is the request itself (including the IP address).

## Consequences

- The extension works offline and when the service is rate limited (about 1 request per 45 seconds per IP) or down.
- Reliance on an unauthenticated third-party service we do not control. If it changes, only the generator module changes.
- Gemini Nano can be added later as another source ahead of the fallback.
- Cached identical prompts return identical replies, hence the random seed.
