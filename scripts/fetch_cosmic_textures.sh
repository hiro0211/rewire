#!/usr/bin/env bash
#
# ESA/Webb (JWST) と ESA/Hubble の deep-sky 実写画像をダウンロードし、
# センタークロップ → 512x512 → WebP に変換する。
# いずれも CC BY 4.0（クレジット: docs/asset-credits.md 参照）。
#
# 惑星テクスチャ (scripts/fetch_planet_textures.sh) と異なり、被写体が球体では
# ないため equirectangular ではなく「正方形センタークロップ」で取り込み、
# CosmicFieldRenderer 側でソフト放射状マスク + 輝度キーで発光体として描く。
#
# 依存: curl, cwebp (`brew install webp`), sips (macOS 標準)
# 出力先: assets/images/cosmic/{id}-field.webp
#
# 予算: 8 枚合計 <= 400KB / 1 枚上限 60KB。超過すると exit 1。
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$REPO_ROOT/assets/images/cosmic"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$OUT_DIR"

# (id, url, quality, crop_bias_x, size) タプル。
#   crop_bias_x: 0.5=中央, <0.5=左寄り, >0.5=右寄り（横長画像の構図調整用）
#   quality:     予算超過分は個別に落とす（既定 78）
#   size:        出力の一辺(px)。既定 512。高周波な星団は 384 に落として予算内に収める。
#
# stellarSystem は Wolf-Rayet 140 の同心円ダストリング (weic2501d) が本命だが、
# 濃色で輝度キーが効きにくいので WR140a（背景の暗い版）を採用。
# stardust の Sagittarius Star Cloud は点像が密でWebP圧縮が効きにくいため 384px。
TEXTURES=(
  "stardust      https://cdn.esahubble.org/archives/images/large/opo9828d.jpg  60  0.5  384"
  "nebula        https://cdn.esawebb.org/archives/images/large/weic2205a.jpg   76  0.5  512"
  "protostar     https://cdn.esawebb.org/archives/images/large/weic2219a.jpg   80  0.5  512"
  "whiteDwarf    https://cdn.esawebb.org/archives/images/large/weic2207b.jpg   80  0.5  512"
  "stellarSystem https://cdn.esawebb.org/archives/images/large/WR140a.jpg      80  0.5  512"
  "starCluster   https://cdn.esahubble.org/archives/images/large/heic1509a.jpg 74  0.5  448"
  "galaxy        https://cdn.esawebb.org/archives/images/large/potm2208a.jpg   74  0.5  512"
  "cosmos        https://cdn.esawebb.org/archives/images/large/weic2209a.jpg   74  0.5  512"
)

PER_FILE_MAX=$((60 * 1024))
TOTAL_MAX=$((400 * 1024))

if ! command -v cwebp >/dev/null 2>&1; then
  echo "ERROR: cwebp not found. Install with: brew install webp" >&2
  exit 1
fi
if ! command -v sips >/dev/null 2>&1; then
  echo "ERROR: sips not found (macOS 標準ツール)" >&2
  exit 1
fi

total=0
over_budget=0

for entry in "${TEXTURES[@]}"; do
  read -r id url quality bias size <<< "$entry"
  src="$TMP/$id.jpg"
  out="$OUT_DIR/$id-field.webp"

  echo "→ $id ($url)"
  curl -fsSL "$url" -o "$src"

  # sips で寸法取得
  w=$(sips -g pixelWidth "$src" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$src" | awk '/pixelHeight/{print $2}')

  # 正方形センタークロップ座標を算出
  if [ "$w" -lt "$h" ]; then s="$w"; else s="$h"; fi
  # x = clamp((w - s) * bias), y = (h - s) / 2
  x=$(awk -v w="$w" -v s="$s" -v b="$bias" 'BEGIN{v=int((w-s)*b); if(v<0)v=0; m=w-s; if(v>m)v=m; print v}')
  y=$(awk -v h="$h" -v s="$s" 'BEGIN{print int((h-s)/2)}')

  # crop -> resize -> webp。-m 6 で圧縮効率優先、-sharp_yuv で星雲のクロマ滲み抑制。
  cwebp -quiet -q "$quality" -m 6 -sharp_yuv \
    -crop "$x" "$y" "$s" "$s" -resize "$size" "$size" \
    "$src" -o "$out"

  bytes=$(wc -c <"$out" | tr -d ' ')
  total=$((total + bytes))
  echo "   wrote $out (${bytes} bytes, q=$quality)"
  if [ "$bytes" -ge "$PER_FILE_MAX" ]; then
    echo "   ⚠️  ${id}: ${bytes} bytes >= 60KB 上限。quality を下げるか 448 に縮小せよ" >&2
    over_budget=1
  fi
done

echo ""
echo "合計: ${total} bytes (上限 ${TOTAL_MAX})"
if [ "$total" -ge "$TOTAL_MAX" ]; then
  echo "ERROR: cosmic テクスチャ合計が 400KB を超過。quality/寸法を調整せよ。" >&2
  over_budget=1
fi

if [ "$over_budget" -ne 0 ]; then
  exit 1
fi

echo "Done. Output: $OUT_DIR"
