#!/usr/bin/env python3
"""Validate the prepared Copilot source, or build a ZIP with real tenant IDs."""
from __future__ import annotations

import argparse
import binascii
import hashlib
import json
import os
from pathlib import Path
import re
import struct
import sys
import uuid
import zipfile
import zlib

try:
    from jsonschema import validators
except ImportError:
    raise SystemExit("Install the requirements in this folder before validation.")

ROOT = Path(__file__).resolve().parents[1]
FILES = ("manifest.json", "declarativeAgent.json", "ai-plugin.json", "color.png", "outline.png")
SCHEMAS = {"manifest.json": "app", "declarativeAgent.json": "agent", "ai-plugin.json": "plugin"}
TEMPLATE_APP_ID = "00000000-0000-4000-8000-000000000001"
TEMPLATE_AUTH_ID = "template-validation-only"


def check(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def validate_png(path: Path, dimensions: tuple[int, int], outline: bool = False) -> None:
    """Validate the checked-in 8-bit RGB/RGBA icons without an imaging dependency.

    Only the simple, noninterlaced PNG formats used by these assets are accepted.
    Input and decoded output are bounded before decoding; every chunk CRC is
    checked. Ancillary metadata is not interpreted or decompressed.
    """
    check(path.stat().st_size <= 1024 * 1024, f"Icon is too large: {path.name}")
    blob = path.read_bytes()
    check(blob[:8] == b"\x89PNG\r\n\x1a\n", f"Invalid PNG signature: {path.name}")
    offset, channels = 8, 0
    compressed = bytearray()
    ended = False
    while offset < len(blob):
        check(offset + 12 <= len(blob), f"Truncated PNG chunk: {path.name}")
        size = struct.unpack_from(">I", blob, offset)[0]
        kind = blob[offset + 4:offset + 8]
        end = offset + size + 12
        check(end <= len(blob), f"Truncated PNG data: {path.name}")
        data = blob[offset + 8:offset + 8 + size]
        crc = struct.unpack_from(">I", blob, end - 4)[0]
        check((binascii.crc32(kind + data) & 0xFFFFFFFF) == crc, f"PNG checksum mismatch: {path.name}")
        if kind == b"IHDR":
            check(offset == 8 and size == 13 and channels == 0, f"Invalid PNG header: {path.name}")
            width, height, depth, color, compression, filtering, interlace = struct.unpack(">IIBBBBB", data)
            check((width, height) == dimensions, f"Invalid Microsoft icon dimensions: {path.name}")
            check(depth == 8 and color in (2, 6) and (compression, filtering, interlace) == (0, 0, 0), f"Unsupported PNG encoding: {path.name}")
            channels = 3 if color == 2 else 4
            check(not outline or channels == 4, "Outline icon must support transparency.")
        elif kind == b"IDAT":
            check(channels != 0, f"PNG image data precedes its header: {path.name}")
            compressed.extend(data)
        elif kind == b"IEND":
            check(size == 0 and bool(compressed) and end == len(blob), f"Invalid PNG ending: {path.name}")
            ended = True
            break
        else:
            check(channels != 0 and bool(kind[0] & 32), f"Unsupported PNG critical chunk: {path.name}")
        offset = end
    check(ended, f"PNG end marker is missing: {path.name}")
    stride = dimensions[0] * channels
    expected = (stride + 1) * dimensions[1]
    try:
        decoder = zlib.decompressobj()
        decoded = decoder.decompress(bytes(compressed), expected + 1)
    except zlib.error as exc:
        raise ValueError(f"Invalid PNG image stream: {path.name}") from exc
    check(len(decoded) == expected and decoder.eof and not decoder.unused_data and not decoder.unconsumed_tail, f"Invalid PNG decoded size: {path.name}")
    previous = bytearray(stride)
    transparent = visible = False
    for y in range(dimensions[1]):
        start = y * (stride + 1)
        filter_type = decoded[start]
        check(filter_type <= 4, f"Unsupported PNG row filter: {path.name}")
        row = bytearray(decoded[start + 1:start + 1 + stride])
        for x in range(stride):
            left = row[x - channels] if x >= channels else 0
            above = previous[x]
            corner = previous[x - channels] if x >= channels else 0
            if filter_type == 0:
                predictor = 0
            elif filter_type == 1:
                predictor = left
            elif filter_type == 2:
                predictor = above
            elif filter_type == 3:
                predictor = (left + above) // 2
            else:
                estimate = left + above - corner
                distances = (abs(estimate - left), abs(estimate - above), abs(estimate - corner))
                predictor = (left, above, corner)[distances.index(min(distances))]
            row[x] = (row[x] + predictor) & 255
        if outline:
            for x in range(0, stride, 4):
                r, g, b, alpha = row[x:x + 4]
                transparent |= alpha == 0
                visible |= alpha > 0
                check(alpha == 0 or (r, g, b) == (255, 255, 255), "Outline icon must use a white foreground.")
        previous = row
    if outline:
        check(transparent, "Outline icon must have transparent pixels.")
        check(visible, "Outline icon is empty.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package", action="store_true", help="Build a ZIP; requires actual provisioned IDs")
    parser.add_argument("--app-id", default=os.environ.get("M365_APP_ID"))
    parser.add_argument("--auth-id", default=os.environ.get("ULTIWRITE_MCP_AUTH_ID"))
    parser.add_argument("--output", type=Path)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    if args.package:
        check(bool(args.app_id and args.auth_id), "Set M365_APP_ID and ULTIWRITE_MCP_AUTH_ID from the intended Microsoft tenant.")
        check(str(uuid.UUID(args.app_id)) == args.app_id.lower(), "M365_APP_ID must be the app's actual UUID.")
        check(args.app_id != TEMPLATE_APP_ID, "A validation fixture is not a provisioned app ID.")
        check(bool(re.fullmatch(r"[A-Za-z0-9._:-]{8,256}", args.auth_id)), "The auth-config ID is empty or malformed.")
        check(not re.search(r"placeholder|replace|template|example|your[_-]", args.auth_id, re.I), "Provide the actual auth-config ID.")
    app_id = args.app_id if args.package else TEMPLATE_APP_ID
    auth_id = args.auth_id if args.package else TEMPLATE_AUTH_ID
    rendered: dict[str, bytes] = {}
    parsed: dict[str, dict] = {}
    for filename in FILES:
        value = (ROOT / "appPackage" / filename).read_bytes()
        if filename.endswith(".json"):
            source = value.decode().replace("${{M365_APP_ID}}", app_id).replace("${{ULTIWRITE_MCP_AUTH_ID}}", auth_id)
            check("${{" not in source, f"Unresolved template token in {filename}")
            obj = json.loads(source)
            schema = json.loads((ROOT / "schemas" / f"{SCHEMAS[filename]}.schema.json").read_text(encoding="utf-8"))
            validator = validators.validator_for(schema)(schema)
            issues = list(validator.iter_errors(obj))
            check(not issues, f"{filename}: " + "; ".join(str(e.message) for e in issues))
            parsed[filename] = obj
            value = (json.dumps(obj, indent=2) + "\n").encode()
        rendered[filename] = value

    app, agent, plugin = (parsed[name] for name in FILES[:3])
    # Microsoft's published schemas contain some newer keywords while declaring
    # draft-04. Keep the essential cross-file and protocol invariants explicit.
    check(app["manifestVersion"] == "1.28" and agent["version"] == "v1.9" and plugin["schema_version"] == "v2.4", "Unexpected schema version.")
    check(app["name"]["short"] == agent["name"] == plugin["name_for_human"] == "Ultiwrite", "Names must agree across the three manifests.")
    check(app["copilotAgents"]["declarativeAgents"] == [{"id": "ultiwrite", "file": "declarativeAgent.json"}], "Broken app-to-agent reference.")
    check(agent["actions"] == [{"id": "ultiwrite", "file": "ai-plugin.json"}], "Broken agent-to-plugin reference.")
    check(len(agent["conversation_starters"]) >= 3, "Provide at least three conversation starters.")
    check(len(agent["instructions"]) <= 8000, "Agent instructions exceed the platform limit.")
    check(plugin["functions"] == [], "This package uses dynamic tool discovery.")
    runtime = plugin["runtimes"][0]
    check(len(plugin["runtimes"]) == 1 and runtime["type"] == "RemoteMCPServer", "Expected one remote MCP runtime.")
    check(runtime["run_for_functions"] == ["*"], "Dynamic tools must be enabled.")
    check(runtime["auth"] == {"type": "OAuthPluginVault", "reference_id": auth_id}, "Use the provisioned OAuth vault configuration.")
    check(runtime["spec"] == {"url": "https://mcp.dwsoffshorepartners.com/mcp"}, "Unexpected MCP endpoint or pinned tool surface.")
    check(not app.get("permissions") and not app.get("authorization") and not agent.get("capabilities"), "This wrapper does not require Microsoft data permissions.")
    for name, dimensions in (("color.png", (192, 192)), ("outline.png", (32, 32))):
        validate_png(ROOT / "appPackage" / name, dimensions, outline=name == "outline.png")

    result = {
        "status": "PASS",
        "scope": "configured-package-structure" if args.package else "template-structure-only",
        "version": app["version"],
        "checks": ["three official JSON schemas", "cross-file references", "OAuth runtime", "dynamic discovery", "identical product names", "prompt starters", "icon size and transparency", "no Microsoft data permissions"],
        "hostTested": False,
        "submitted": False,
    }
    if args.package:
        destination = args.output or ROOT / "build" / f"ultiwrite-m365-{app['version']}.zip"
        destination.parent.mkdir(parents=True, exist_ok=True)
        check(not destination.exists(), f"Output already exists: {destination}; choose a new filename to preserve the earlier archive.")
        with zipfile.ZipFile(destination, "x", compression=zipfile.ZIP_DEFLATED) as archive:
            for filename in FILES:
                info = zipfile.ZipInfo(filename, date_time=(2026, 11, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o644 << 16
                archive.writestr(info, rendered[filename])
        result["archive"] = str(destination)
        result["sha256"] = hashlib.sha256(destination.read_bytes()).hexdigest()
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
