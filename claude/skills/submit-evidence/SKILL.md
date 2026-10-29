---
name: submit-evidence
description: Submit the user's authorized commercial evidence (documents, spreadsheets, images, ZIP packages) to Ultiwrite and follow the case until its report is released. Use when the user asks to investigate, underwrite, diligence or check a business, merchant, residual book, portfolio, property or transaction from their files.
---

# Submit evidence to Ultiwrite

1. Confirm the files are the user's to share for this purpose. Do not fabricate, edit or silently drop files. Do not ask the user to label or classify them.
2. Call `ultiwrite_evidence_submit` with `{ "files": [], "caseId": null, "handoffId": null, "documentForensics": null }`. These four fields are required by the tool schema. Set `documentForensics` to `true` to request document forensics or `false` to decline it only when the user explicitly chose; otherwise keep `null` so the engine decides relevance from the contents.
3. Claude cannot forward chat attachments to this server as file objects, so the result is a signed upload handoff. It may arrive flagged as an error with code `attachment_not_transferred`; that is expected. If it contains `uploadLink`, give the user that exact link and say:
   - it is valid for 30 minutes, for this Ultiwrite account only;
   - they upload the same files in their browser there;
   - nothing has been analyzed yet, and no analysis was used.
   Then stop and wait. Never construct, shorten or edit a link, and never pass a URL, local path or attachment id in `files`.
4. Retain the returned `handoffId` and `continuation` in this conversation. They identify this upload, including after reconnecting. If no `uploadLink` is returned, report the tool's message as written and stop.
5. When the user says the upload finished, follow the returned continuation: call `ultiwrite_evidence_submit` with `{ "files": [], "caseId": null, "handoffId": "<exact returned handoffId>", "documentForensics": null }`, replacing the placeholder with that exact returned value. Do not add file objects, a non-null `caseId`, or a new forensics choice. It resolves this upload to its saved case and resumes that case. Never guess the newest case from `ultiwrite_cases_list`, invent an identifier, or ask the user to recreate the task. If it returns `upload_pending`, wait for the browser upload to finish and retry the same selector. If it returns `upload_expired` before files were received, request a new upload link with `{ "files": [], "caseId": null, "handoffId": null, "documentForensics": null }`.
6. Retain the returned `caseId`. Call `ultiwrite_case_status` for progress. If the status returns a continuation, call `ultiwrite_evidence_submit` with `{ "files": [], "caseId": "<exact returned caseId>", "handoffId": null, "documentForensics": null }`, replacing the placeholder with that exact returned value, to advance it. Status reads do not advance processing. Never resubmit the same files to "retry".
7. While the state is processing, tell the user it is still running and that you will check again when they ask. Do not report success, findings or a decision before a report is linked.
8. When `linkedReportId` is set, follow the `read-report` skill.

## Errors

- Missing `ultiwrite:evidence` permission: ask the user to reconnect Ultiwrite and approve evidence submission.
- `failed` or `action_required`: state exactly what the tool said is needed. A failed analysis is not a finding about the business.
- Limits and accepted file types come from `ultiwrite_capabilities_get` (`inputs`) or https://dwsoffshorepartners.com/docs/mcp#accepted-inputs. Do not guess them.
