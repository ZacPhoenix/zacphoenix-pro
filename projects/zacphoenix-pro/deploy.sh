#!/usr/bin/env bash
# Deploy projects/zacphoenix-pro/site/ to GitHub Pages (gh-pages branch) -> https://zacphoenix.pro
# Usage: bash projects/zacphoenix-pro/deploy.sh
set -euo pipefail

SITE_DIR="$(cd "$(dirname "$0")/site" && pwd)"
REPO_URL="https://github.com/ZacPhoenix/zacphoenix-pro.git"
DOMAIN="zacphoenix.pro"
SRC_SHA="$(git -C "$SITE_DIR" rev-parse --short HEAD 2>/dev/null || echo local)"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cp -R "$SITE_DIR/." "$TMP/"
echo "$DOMAIN" > "$TMP/CNAME"      # required: without it the custom domain detaches
touch "$TMP/.nojekyll"              # serve files as-is, skip Jekyll

cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$SITE_DIR" config user.name || echo deploy)" \
    -c user.email="$(git -C "$SITE_DIR" config user.email || echo deploy@localhost)" \
    commit -q -m "Deploy site from $SRC_SHA"
git push -q -f "$REPO_URL" gh-pages

echo "Pushed. Pages status:"
gh api "repos/ZacPhoenix/zacphoenix-pro/pages" --jq '{status, html_url, source: .source.branch}' || true
echo "Live in ~1-3 min at https://$DOMAIN"
