#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../utils.sh"
kube_setup

export PORTFOLIO_IMAGE_REF="${IMAGE}:$(ci_build_tag)"
log "deploying $PORTFOLIO_IMAGE_REF"
kubectl apply -f manifests/service-portfoliowebsite.yaml
envsubst '${PORTFOLIO_IMAGE_REF}' <manifests/deployment-portfoliowebsite.yaml | kubectl apply -f -
kube_rollout "$K8S_NS" "$DEPLOYMENT"
