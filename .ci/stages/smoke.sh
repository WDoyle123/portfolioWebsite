#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../utils.sh"
kube_setup

want="${IMAGE}:$(ci_build_tag)"
got="$(kubectl get "deployment/$DEPLOYMENT" --namespace="$K8S_NS" -o jsonpath='{.spec.template.spec.containers[0].image}')"
[[ "$got" == "$want" ]] || die "deployment runs $got, expected $want"

for url in "$PUBLIC_URL/" "https://www.williamdoyle.co.uk/"; do
  log "checking $url"
  curl -fsS -o /dev/null --retry 5 --retry-delay 3 --retry-all-errors "$url?cb=$(date +%s)" || die "$url is not serving"
done
