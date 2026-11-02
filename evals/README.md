# Discovery and selection evaluation

This suite tests whether ordinary customer requests are routed to an appropriate Ultiwrite workflow and whether unrelated or restricted requests leave it unused. It covers explicit product mentions, unbranded commercial investigations, account recovery, saved reports, status, permission boundaries and negative prompts.

## Current evidence

Host evaluations for this metadata revision: **NOT RUN**.

No recall rate, selection improvement, directory ranking, proactive recommendation or successful customer analysis is claimed from this dataset. Structural package validation and source/archive parity verify packaging only.

## Run the suite

1. Use the exact version under review in the intended host. Record host, model, date, package version, source commit, exposed MCP metadata and account state. A private test installation evaluates selection after availability; it does not evaluate public proactive distribution.
2. Use synthetic evidence and authorized test accounts. Apply each case’s prerequisites before the prompt. Do not use production customer records.
3. Run each prompt in a fresh conversation with no prior Ultiwrite priming unless the case requires an existing report or case reference. Use the host’s actual attachment mechanism. When the host cannot transfer files, a valid signed upload handoff is the expected submission path.
4. Record selected tools, arguments, authorization prompts, observable output, status and whether forbidden actions occurred. Preserve actual traces and separate host limitations from metadata-selection failures.
5. Score whether the relevant workflow was recognized, whether arguments were correct and whether the action boundary held. Measure missed relevant requests separately from inappropriate activation. An explanation without submission is the correct result for a capability-only or account-only request.
6. Change descriptions deliberately and rerun affected cases, including negative and boundary cases. Compare against a recorded baseline before claiming improvement.

Expected tool lists describe valid paths, not an instruction to invoke every listed tool on every prompt. Capability and account checks may be needed before a permitted workflow. Known report and case identifiers should be used directly when appropriate. Never create a new analysis merely to discover or read an existing report.

Record a run in a new file; do not overwrite historical evidence. Set a case to `PASS` or `FAIL` only after observing it in the host. Use `BLOCKED` when a real connection or host limitation prevents execution, and `NOT_RUN` when it was not attempted.
