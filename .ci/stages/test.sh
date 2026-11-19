#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../utils.sh"
cd "${CI_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"

trap nginx_serve_cleanup EXIT
nginx_serve_image
html="$(curl -fsS "$CI_SERVE_URL/")"
grep -qi '<title>' <<<"$html" || die "index.html has no <title>"
grep -q '<script' <<<"$html" || die "index.html loads no script"
for asset in $(grep -oE '(src|href)="/assets/[^"]+"' <<<"$html" | cut -d'"' -f2); do
  curl -fsS -o /dev/null "$CI_SERVE_URL$asset" || die "built asset $asset is missing"
done
log "site serves index.html and its assets"
