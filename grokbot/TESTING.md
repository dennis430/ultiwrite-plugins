# Draft testing instructions

Status: NOT_RUN.

Sequence 1 checked manifests, the opaque logo, unauthenticated production discovery, and the public HTTP behavior of the MCP URL. It did not complete a Grok Bot tool call, a Cursor host install, a Claude host install, or a ChatGPT host install.

Do not write that Grok Bot, Cursor, or consumer Grok passed.

When a later sequence runs the host test, use a dedicated ordinary Ultiwrite account and authorized synthetic files only:

1. Connect with OAuth. Confirm no API key was required.
2. Call `ultiwrite_capabilities_get` and keep the returned commercial wording.
3. Submit one small authorized file, or complete the signed upload handoff if the host cannot attach bytes.
4. Record the case id. Poll `ultiwrite_case_status` until the service reports a real terminal state.
5. Read findings with exactly one id. Confirm a second account cannot read that id.
6. Open the export link in the same account's browser.
7. Save the host transcript, the case id, and the time. Do not store tokens in the repository.

Failure of any step stays a failure. A local schema check cannot replace it.
