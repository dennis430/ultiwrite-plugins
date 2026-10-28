# Ultiwrite for Cursor and Grok Bot reviewers

Version 0.7.3. Publisher: DWS Offshore Fund dba Ultiwrite. Submitter/support contact: dennisl@dwsoffshorepartners.com.

Ultiwrite is an asymmetric diligence engine with document forensics capability. Upload authorized evidence for a commercial opportunity, counterparty, financing, acquisition, or portfolio and read the service's saved, source-backed assessment. One service supports these workflows; specialist skills are not separate products or analysis modes.

MCP: https://dwsoffshorepartners.com/api/integrations/ultiwrite/mcp
Setup: https://dwsoffshorepartners.com/docs/mcp
Public source: https://github.com/dennis430/ultiwrite-plugins (`cursor/`)

This folder contains the Cursor manifest, four skills, a safety rule, and remote MCP configuration. The MIT license covers only the original thin connector and its documentation. The remote analytical engine and customer data are not included or licensed. See LICENSE and NOTICE. The square opaque logo reuses the existing public connector artwork.

For local installation, copy this folder's CONTENTS to `~/.cursor/plugins/local/ultiwrite/`, including hidden `.cursor-plugin`, then reload Cursor. Verify the actual version and components in Customize. Back up a pre-existing local copy. Connect through OAuth with an Ultiwrite account; do not paste an API key. Use only advertised file/handoff inputs and actual returned report identifiers. Limits, allowance, and staff release follow the service's current policy.

Core skill: `ultiwrite`; specialist skills: `ultiwrite-underwriting-coherence`, `ultiwrite-acquisition-intelligence`, `ultiwrite-retention-monitoring`.

Reviewer instructions and fictional files are in `review/`. Dedicated account credentials are supplied privately, never in this source. Local/in-app testing for 0.7.3 is not claimed. This package has not been submitted or listed. Grok Bot installation is separate from the Cursor local plugin; consumer Grok is not targeted.

Earlier website downloads labeled 0.7.0 and public source 0.7.1 are different releases. A prepared source branch does not update those hosted downloads. Use the version/hash of this bundle and its source branch rather than assuming the website was deployed.
