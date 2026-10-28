# Reviewer connection setup

Use `https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp` with Ultiwrite OAuth. No shared API key is supported. Use the dedicated reviewer account supplied in the submission's private instructions, and verify read/evidence consent and current account allowance.

Grok Bot: open Connect apps and inspect the existing Ultiwrite connection or the marketplace's supported development/reviewer install. Do not assume that arbitrary remote URLs or unpublished local bundles can be imported in every version. Record an unavailable install path as BLOCKED_EXTERNAL. A connected app still needs successful provider authentication.

Cursor: follow `../cursor/review/TESTING.md`. The package root must directly contain the hidden manifest, mcp.json, skills, and rules. Confirm 0.7.3 before testing.

Use only real returned upload links, case/report identifiers, and entitled export links. The host's file-input schema controls what can be submitted. No payment is taken by the connection, and connection does not increase account allowance.
