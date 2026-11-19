#!/usr/bin/env bash
source "$CI_LIB"
declare -F registry_login >/dev/null || die "this bash-ci worker has no registry_login: redeploy it"

readonly REGISTRY="registry.registry.svc.cluster.local:5000"
readonly IMAGE="${REGISTRY}/portfolio-website"
readonly K8S_NS="portfolio-website"
readonly DEPLOYMENT="portfolio-website-deployment"
readonly PUBLIC_URL="https://williamdoyle.co.uk"

ci_build_tag() { echo "ci-${CI_COMMIT_SHA:0:12}"; }
