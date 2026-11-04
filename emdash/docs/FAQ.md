# Frequently asked questions

## Do I need Bluesky to use the plugin?
No. Bluesky/Atmosphere is used by the publisher to release this package. Customers use their approved Ultiwrite API account.

## Does the plugin analyze my CMS content automatically?
No. It has no CMS content permission or publish hook. It connects administrators to account checks, case browsing, saved Decision Briefs and an explicit secure-upload action.

## Is an API key enough?
The Ultiwrite account must also have explicit API approval. The key needs the relevant scopes, and account request and analysis limits still apply.

## Why did a request return 403 or 404?
403 can mean missing API approval or scope. 404 can mean the resource is unavailable to this account or the API is not active on the service. The plugin does not bypass either condition.

## Where are files and reports stored?
Evidence is uploaded directly in Ultiwrite's uploader. This connector does not persist files, reports or signed upload links. EmDash stores the encrypted connection key; result data is temporarily returned to authorized administrators for display.

## Does a completed case mean a business is approved?
No. Workflow status is not a diligence conclusion. Review the full report, limitations and evidence before making a decision.

## Is the service free?
The connector code is MIT-licensed. Ultiwrite service access, quotas, features and charges depend on the customer account and commercial terms.
