#!/bin/sh
set -eu
cd "$(dirname "$0")"
node scripts/verify-distribution.mjs
printf '\nPrepared packs: dist/distribution. No publication occurred.\n'
