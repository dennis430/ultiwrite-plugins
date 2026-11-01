#!/usr/bin/env python3
"""Copy/resize the approved repo logo; never invent a replacement or publish anything."""
from pathlib import Path
import argparse, hashlib, json, sys, urllib.request

def main() -> None:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--download', action='store_true', help='Explicitly fetch the pinned public repository logo if absent locally')
    args=parser.parse_args()
    root=Path(__file__).resolve().parent.parent
    catalog=json.loads((root/'distribution/catalog.json').read_text())
    original=root/'claude/assets/logo.png'
    if not original.exists(): original=root/'distribution/assets/logo.png'
    if not original.exists() and args.download:
        with urllib.request.urlopen(catalog['brand']['logo'], timeout=30) as response: data=response.read(100_000)
        expected='65b8c13d167ae05190f0957f5880449f7133f06d'
        actual=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
        if actual != expected: raise ValueError('Pinned Git blob verification failed; refusing asset.')
        original.parent.mkdir(parents=True, exist_ok=True); original.write_bytes(data)
    if not original.exists(): raise FileNotFoundError('Approved logo absent. Run from the full repository, or explicitly use --download on a network-enabled computer.')
    from PIL import Image
    image=Image.open(original)
    if image.size != (512,512): raise ValueError('Unexpected approved logo dimensions.')
    out=root/'dist/distribution'
    if not (out/'READINESS.json').exists(): raise FileNotFoundError('Run node scripts/build-distribution.mjs first.')
    targets={'assets/logo.png':512,'cline/logo-400.png':400,'chrome/extension/icons/16.png':16,'chrome/extension/icons/48.png':48,'chrome/extension/icons/128.png':128,'n8n/nodes/Ultiwrite/ultiwrite.png':64,'microsoft/Color.png':192,'antigravity/assets/logo.png':512}
    for name,size in targets.items():
        p=out/name;p.parent.mkdir(parents=True,exist_ok=True)
        image.convert('RGB').resize((size,size),Image.Resampling.LANCZOS).save(p,'PNG',optimize=True)
    manifest_path=out/'chrome/extension/manifest.json'
    manifest=json.loads(manifest_path.read_text());manifest['icons']={str(s):f'icons/{s}.png' for s in (16,48,128)}
    manifest['action']['default_icon']=manifest['icons'];manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
    antigravity=out/'antigravity/plugin.json';m=json.loads(antigravity.read_text());m['logo']='./assets/logo.png';antigravity.write_text(json.dumps(m,indent=2)+'\n')
    receipt={'approvedLogoGitBlob':'65b8c13d167ae05190f0957f5880449f7133f06d','derived':targets,'microsoftOutline':'REQUIRES_APPROVED_WHITE_TRANSPARENT_MARK','screenshots':'NOT_CAPTURED'}
    (out/'ASSETS.json').write_text(json.dumps(receipt,indent=2)+'\n')
    readiness=out/'READINESS.json';r=json.loads(readiness.read_text());r['assets'].update({'approvedLogoIncluded':True,'nativeSizedAssets':'SEE_ASSETS_JSON'});readiness.write_text(json.dumps(r,indent=2)+'\n')
    files=[]
    for p in sorted(out.rglob('*')):
        if p.is_file() and p.name!='INVENTORY.json':
            data=p.read_bytes();files.append({'path':p.relative_to(out).as_posix(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
    (out/'INVENTORY.json').write_text(json.dumps({'preparedAt':catalog['preparedAt'],'version':catalog['version'],'files':files},indent=2)+'\n')
    print('Prepared approved-logo derivatives. Microsoft outline and actual-host screenshots are still required.')
if __name__=='__main__':
    try: main()
    except Exception as exc: print(str(exc),file=sys.stderr);sys.exit(1)
