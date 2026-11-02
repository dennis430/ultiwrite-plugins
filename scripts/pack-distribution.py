#!/usr/bin/env python3
"""Build the reviewable seven-channel handoff without publishing any service."""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {'.git', 'node_modules', 'dist', '__pycache__', '.venv', 'build', '.cache'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'dist' / 'Ultiwrite_Remaining_MCP_Submission_Kit.zip')
    args = parser.parse_args()
    subprocess.run(['node', str(ROOT / 'scripts' / 'validate-distribution.mjs')], check=True, cwd=ROOT)
    payload = {}
    for folder in ('distribution', 'cursor'):
        for path in sorted((ROOT / folder).rglob('*')):
            rel = path.relative_to(ROOT)
            if any(part in EXCLUDED for part in rel.parts):
                continue
            if path.is_symlink():
                raise ValueError(f'Symlink cannot be packaged: {rel}')
            if path.is_file():
                if path.name.startswith('.env') or path.suffix in {'.pem', '.key', '.p12'} or '.local.' in path.name:
                    raise ValueError(f'Private/local configuration cannot be packaged: {rel}')
                payload[rel.as_posix()] = path.read_bytes()
    manifest = json.loads((ROOT / 'cursor' / '.cursor-plugin' / 'plugin.json').read_text(encoding='utf-8'))
    for rel in ('LICENSE', 'NOTICE', 'POSITIONING.md', 'evals/README.md', 'evals/discovery-prompts.json', 'scripts/validate-distribution.mjs', 'scripts/pack-distribution.py', f'release/ultiwrite-cursor-plugin-{manifest["version"]}.zip'):
        payload[rel] = (ROOT / rel).read_bytes()
    payload['START_HERE.md'] = (
        '# Ultiwrite remaining MCP submission kit\n\n'
        'Open [the seven-channel guide](distribution/README.md) for every signup link, prepared file, account step and remaining integration requirement.\n\n'
        'The prepared Cursor ZIP is in `release/`. Its editable plugin is in `cursor/`. '
        'Microsoft has a source package and builder that requires real Microsoft app/auth IDs. '
        'Other channel folders contain their supported source or clearly labeled submission worksheets.\n\n'
        'No marketplace submission, account creation or production deployment is claimed. '
        'ChatGPT, Claude and Grok packages are outside this handoff.\n'
    ).encode()
    profile = json.loads((ROOT / 'distribution/shared/profile.json').read_text(encoding='utf-8'))
    inventory = {'product': profile['product'], 'legalEntity': profile['legalEntity'], 'dba': profile['dba'], 'kitVersion': profile['kitVersion'], 'preparedPackageVersion': manifest['version'], 'preparedWorkflowContract': '0.9.2', 'files': [
        {'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
        for name, data in sorted(payload.items())
    ]}
    payload['CONTENTS.json'] = (json.dumps(inventory, indent=2) + '\n').encode()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in sorted(payload.items()):
            info = zipfile.ZipInfo(name, (2026, 11, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, data)
    with zipfile.ZipFile(args.output) as archive:
        if archive.testzip() is not None:
            raise ValueError('Archive CRC verification failed')
        for name, data in payload.items():
            if archive.read(name) != data:
                raise ValueError(f'Archive/source mismatch: {name}')
    digest = hashlib.sha256(args.output.read_bytes()).hexdigest()
    args.output.with_suffix('.sha256').write_text(f'{digest}  {args.output.name}\n', encoding='utf-8')
    print(json.dumps({'archive': str(args.output), 'files': len(payload), 'bytes': args.output.stat().st_size, 'sha256': digest, 'submitted': False}))


if __name__ == '__main__':
    main()
