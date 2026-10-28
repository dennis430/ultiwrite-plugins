#!/usr/bin/env python3
"""Build and verify a reproducible Cursor submission ZIP without credentials."""
from pathlib import Path
import hashlib
import json
import sys
import zipfile

root = Path(__file__).resolve().parents[1]
out = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root / 'dist'
out.mkdir(parents=True, exist_ok=True)
version = json.loads((root / 'cursor/.cursor-plugin/plugin.json').read_text())['version']

def release_files(directory):
    return sorted(p for p in directory.rglob('*') if p.is_file() and not any(
        part in {'.git', 'node_modules', '__pycache__', 'dist'} for part in p.relative_to(directory).parts))

manifest_path = root / 'RELEASE_MANIFEST.json'
manifest = json.loads(manifest_path.read_text())
manifest['files'] = [
    {'path':p.relative_to(root).as_posix(), 'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
    for p in release_files(root) if p != manifest_path
]
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')

def archive(name, directory, prefix):
    target = out / name
    source = release_files(directory)
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        for p in source:
            entry = zipfile.ZipInfo(prefix + p.relative_to(directory).as_posix(), date_time=(2026,10,27,0,0,0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            z.writestr(entry, p.read_bytes())
    with zipfile.ZipFile(target) as z:
        assert z.testzip() is None
        assert len(z.namelist()) == len(set(z.namelist())) == len(source)
        for p in source:
            assert z.read(prefix + p.relative_to(directory).as_posix()) == p.read_bytes()
    return {'file':name, 'entries':len(source), 'bytes':target.stat().st_size,
            'sha256':hashlib.sha256(target.read_bytes()).hexdigest(), 'sourceBytesMatch':True}

receipts = [archive(f'ultiwrite-cursor-plugin-{version}.zip', root/'cursor', 'ultiwrite/')]
# A source snapshot lets the reviewer compare the entire proposed tree, including
# its marketplace entry, with the one-plugin import archive.
receipts.append(archive(f'ultiwrite-public-source-{version}.zip', root, 'ultiwrite-plugins/'))
receipt = {'version':version, 'packageChecks':'passed', 'hostTests':'NOT_RUN_FOR_0.7.3',
           'submitted':False, 'credentialsIncluded':False, 'archives':receipts}
(out/f'ultiwrite-package-validation-{version}.json').write_text(json.dumps(receipt, indent=2)+'\n')
print(json.dumps(receipt, indent=2))
