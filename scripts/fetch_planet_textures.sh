#!/usr/bin/env bash
#
# NASA 由来 (Solar System Scope CC-BY 4.0 ベース) の正距円筒図法テクスチャを
# ダウンロードし、cwebp で WebP (q80) に変換する。
#
# 依存: curl, cwebp (`brew install webp`)
# 出力先: assets/images/planets/{name}-equirect.webp
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$REPO_ROOT/assets/images/planets"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$OUT_DIR"

# (name, slug) tuples — Solar System Scope の download path に対応
TEXTURES=(
  "mercury 2k_mercury.jpg"
  "venus 2k_venus_surface.jpg"
  "earth 2k_earth_daymap.jpg"
  "mars 2k_mars.jpg"
  "jupiter 2k_jupiter.jpg"
  "saturn 2k_saturn.jpg"
  "uranus 2k_uranus.jpg"
  "neptune 2k_neptune.jpg"
  "moon 2k_moon.jpg"
  "sun 2k_sun.jpg"
)

BASE="https://www.solarsystemscope.com/textures/download"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "ERROR: cwebp not found. Install with: brew install webp" >&2
  exit 1
fi

for entry in "${TEXTURES[@]}"; do
  read -r name slug <<< "$entry"
  url="$BASE/$slug"
  jpg="$TMP/$name.jpg"
  out="$OUT_DIR/$name-equirect.webp"

  echo "→ $name ($url)"
  curl -fsSL "$url" -o "$jpg"
  cwebp -quiet -q 80 "$jpg" -o "$out"
  echo "   wrote $out ($(wc -c <"$out" | tr -d ' ') bytes)"
done

echo "Done. Output: $OUT_DIR"
