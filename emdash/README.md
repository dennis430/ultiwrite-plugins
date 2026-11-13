# Ultiwrite for EmDash — publisher package

Publisher: **@ultiwrite.co**. Product: **Ultiwrite**. Entity: **DWS Offshore Fund**.

## Publish on Windows

1. Extract this ZIP completely. Do not run the launcher inside the ZIP preview.
2. Open the extracted folder and double-click **PUBLISH.cmd**.
3. Confirm the displayed publisher is `ultiwrite.co`. The launcher runs dependency installation, tests, manifest validation and bundling before publication. It reuses the EmDash CLI login saved in your Windows user account. Follow any CLI confirmation prompts.

The launcher does not need an Ultiwrite API key to publish. Do not paste Google credentials, Bluesky passwords or tokens into this project. If the CLI says your login expired, run `npm run login` in this folder, finish the browser flow, then run the launcher again. `CHECK.cmd` performs all build checks without publishing.

Prerequisite: Node.js 22.13 or newer and npm, with network access. Both launchers stop on an error and keep the terminal open. They install the pinned official `@emdash-cms/plugin-cli` package locally, not globally. When a package-lock is present they use `npm ci`; otherwise `npm install` creates it. This project is not published to npm.

## What the plugin does

Inside an EmDash administrator-only page, connect an explicitly approved Ultiwrite API account, check account and usage, browse paginated cases, retrieve a saved Decision Brief by case/report ID, and create a single-use upload link. Uploads open Ultiwrite's own browser uploader. No CMS posts, drafts, media or visitor data are read or sent automatically. Responses are displayed as structured JSON with explicit truncation notices; the full deliverable remains in Ultiwrite.

The publishing identity and the customer API credential are separate. An EmDash user configuring this integration needs an Ultiwrite account with administrator-granted API access and a dashboard-created `ultiwrite_live_` key. The publisher does not need to create or include one in this distribution.

## Commands

```sh
npm install
npm run verify
npm run publisher
npm run release
npm run listing
```

`verify` runs the tests and the official CLI validation/bundle pipeline. `release` invokes `emdash-plugin publish`; it is the only publication command here. `listing` asks the registry for the published version's status. A successful upload is not a guarantee of public directory approval or SEO benefit.

## Safety and boundaries

The only requested capability is `network:request` to `dwsoffshorepartners.com`. The private POST admin route requires `plugins:manage`. The key is stored through EmDash's secret setting mechanism; the host must have encryption configured. No raw credential is returned in the UI. The plugin uses fixed API endpoints, rejects redirects and untrusted upload/report links, and performs no background polling. All authorized EmDash administrators share the configured Ultiwrite connection; install it only in a trusted admin workspace.

Report status is not a diligence conclusion. API requests and analysis submissions remain subject to the account's permissions, quota and commercial plan. No production engine code, account configuration or prices are changed by this package.

## Verification boundaries

Automated tests exercise the handlers with mock settings and HTTP. The official CLI verifies packaging when `npm run verify` succeeds. A live authenticated EmDash installation and an Ultiwrite customer-account round trip are separate checks, not implied by unit tests or a successful package build. Registry publication and public visibility are also separate states.

## Maintainer references

- https://docs.emdashcms.com/plugins/creating-plugins/cli/
- https://docs.emdashcms.com/plugins/creating-plugins/publishing/
- https://docs.emdashcms.com/plugins/creating-plugins/settings/
- https://dwsoffshorepartners.com/docs/api
- https://github.com/dennis430/ultiwrite-plugins

The MIT license applies to this thin connector only. Ultiwrite's service and analytical engine remain proprietary. See NOTICE and SECURITY.md.
