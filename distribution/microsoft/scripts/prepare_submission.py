#!/usr/bin/env python3
"""Prepare local Microsoft portal fields and, with real IDs, the Copilot upload ZIP."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
KEYS = {'appId', 'authConfigId', 'publicClientId', 'audience'}
TEMPLATE = {'appId': None, 'authConfigId': None, 'publicClientId': None, 'audience': 'public'}


def prepare(config, output, build=False):
    if not isinstance(config, dict) or set(config) - KEYS:
        raise ValueError('Use only appId, authConfigId, publicClientId and audience. Never put secrets or tokens in this file.')
    audience = config.get('audience', 'public')
    if audience not in ('public', 'organization'):
        raise ValueError('audience must be public or organization.')
    for key in ('appId', 'authConfigId', 'publicClientId'):
        value = config.get(key)
        if value is not None and (not isinstance(value, str) or not re.fullmatch(r'[A-Za-z0-9._:-]{8,256}', value)):
            raise ValueError(f'{key} must be a non-secret identifier, or null while awaiting provisioning.')
    missing = [key for key in ('appId', 'authConfigId') if not config.get(key)]
    if build and missing:
        raise ValueError('Create the Microsoft app and OAuth configuration first; missing: ' + ', '.join(missing))
    output.mkdir(parents=True, exist_ok=False)
    fields = {
        'registrationName': 'Ultiwrite Microsoft 365 Copilot',
        'baseUrl': 'https://mcp.dwsoffshorepartners.com/mcp',
        'clientId': config.get('publicClientId'),
        'clientType': 'public',
        'clientSecret': 'Not applicable: public client. Do not fabricate a secret.',
        'authorizationEndpoint': 'https://dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/authorize',
        'tokenEndpoint': 'https://mcp.dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/token',
        'refreshEndpoint': 'https://mcp.dwsoffshorepartners.com/api/integrations/ultiwrite/oauth/token',
        'callbackToRegisterWithUltiwrite': 'https://teams.microsoft.com/api/platform/v1.0/oAuthRedirect',
        'scope': 'ultiwrite:read ultiwrite:evidence',
        'pkce': 'Enabled; S256',
        'restrictUsageByApp': 'Any Teams app',
        'restrictUsageByOrg': 'Any Microsoft 365 organization' if audience == 'public' else 'My organization only',
    }
    result = {'packageStatus': 'not_built', 'missingMicrosoftIds': missing,
              'publicClientIdSupplied': bool(config.get('publicClientId')), 'audience': audience,
              'hostTested': False, 'submitted': False, 'published': False,
              'remaining': ['Confirm auth settings in Microsoft; identifiers alone do not verify a live configuration.',
                            'Sideload and test the exact ZIP in Microsoft 365 Copilot.',
                            'Capture real screenshots and complete private reviewer access in Partner Center.',
                            'Submit through the supported Microsoft 365 and Copilot offer type.']}
    if build:
        archive = output / 'ultiwrite-m365.zip'
        command = [sys.executable, str(ROOT / 'scripts/build_package.py'), '--package',
                   '--app-id', config['appId'], '--auth-id', config['authConfigId'],
                   '--output', str(archive), '--report', str(output / 'package-validation.json')]
        subprocess.run(command, check=True)
        validation = json.loads((output / 'package-validation.json').read_text())
        result.update(packageStatus='structure_validated', version=validation['version'], sha256=validation['sha256'], archive=archive.name)
    for name, data in [('portal-fields.json', fields), ('readiness.json', result)]:
        (output / name).write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')
    for name in ('README.md', 'SUBMISSION.md', 'NEXT_STEPS.md'):
        (output / name).write_bytes((ROOT / name).read_bytes())
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--init', type=Path, help='Create a new ignored *.local.json identifier file; no network calls')
    parser.add_argument('--config', type=Path, help='Local identifier file created with --init')
    parser.add_argument('--output-dir', type=Path, help='New directory; existing output is never overwritten')
    parser.add_argument('--build', action='store_true', help='Build with provisioned Microsoft IDs; no submission or sign-in')
    args = parser.parse_args()
    if args.init:
        if args.config or args.build or args.output_dir:
            parser.error('--init cannot be combined with preparation/build options')
        if not args.init.name.endswith('.local.json'):
            parser.error('Use an ignored *.local.json filename for local identifiers')
        with args.init.open('x', encoding='utf-8') as file:
            json.dump(TEMPLATE, file, indent=2)
            file.write('\n')
        print('Local identifier template created. Follow NEXT_STEPS.md; no account or app was created.')
        return
    if not args.config:
        parser.error('--config is required (create it with --init publisher.local.json)')
    output = args.output_dir or ROOT / 'build' / datetime.now(timezone.utc).strftime('publisher-%Y%m%dT%H%M%S%fZ')
    result = prepare(json.loads(args.config.read_text(encoding='utf-8')), output, args.build)
    print(json.dumps({'outputDirectory': str(output), **result}, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, subprocess.CalledProcessError):
        print('Preparation failed. Check identifier formats, missing Microsoft IDs, dependencies and output paths. Existing packages are never overwritten.', file=sys.stderr)
        sys.exit(1)
