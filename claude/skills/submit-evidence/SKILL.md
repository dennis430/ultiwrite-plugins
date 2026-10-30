---
name: submit-evidence
description: "Submit authorized documents, spreadsheets, images or ZIP evidence packages to Ultiwrite for an asymmetric investigation of a business, acquisition, financing, counterparty, property, merchant, residual book or portfolio. Use when the user asks to test claims, financial consistency, business identities, document integrity, external context or cross-domain contradictions using their evidence. Follow the saved case to its report. Do not submit for an explanation, connection check, general definition or read-only request."
---

# Submit evidence to Ultiwrite

1. Confirm the files are the user's to share for this purpose. Do not fabricate, edit or silently drop files. Do not ask the user to label or classify them.
2. Call `ultiwrite_evidence_submit` with `{}`. Add `documentForensics` only when the user explicitly chose: `true` to request document forensics, `false` to decline it. When they made no choice, omit it so the engine decides relevance from the contents.
3. Claude cannot forward chat attachments to this server as file objects, so the result is a signed upload handoff. It may arrive flagged as an error with code `attachment_not_transferred`; that is expected. If it contains `uploadLink`, give the user that exact link and say:
   - it is valid for 30 minutes, for this Ultiwrite account only;
   - they upload the same files in their browser there;
   - nothing has been analyzed yet, and no analysis was used.
   Then stop and wait. Never construct, shorten or edit a link, and never pass a URL, local path or attachment id in `files`.
4. If no `uploadLink` is returned, report the tool's message as written and stop.
5. When the user says the upload finished, call `ultiwrite_cases_list` and identify the newest case. Call `ultiwrite_case_status` with its `caseId`.
6. If the status returns a continuation, call `ultiwrite_evidence_submit` with only that `caseId` to advance it. Status reads do not advance processing. Never resubmit the same files to "retry".
7. While the state is processing, tell the user it is still running and that you will check again when they ask. Do not report success, findings or a decision before a report is linked.
8. When `linkedReportId` is set, follow the `read-report` skill.

## Errors

- Missing `ultiwrite:evidence` permission: ask the user to reconnect Ultiwrite and approve evidence submission.
- `failed` or `action_required`: state exactly what the tool said is needed. A failed analysis is not a finding about the business.
- Limits and accepted file types come from `ultiwrite_capabilities_get` (`inputs`) or https://dwsoffshorepartners.com/docs/mcp#accepted-inputs. Do not guess them.
