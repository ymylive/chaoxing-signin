#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE_SVG="$ROOT_DIR/assets/macos/app-icon-frosted-beacon.svg"
DIST_DIR="$ROOT_DIR/dist"
ICON_NAME="ChaoxingAppIcon"
OUTPUT_ICNS="${1:-$DIST_DIR/${ICON_NAME}.icns}"
TMP_DIR="$(mktemp -d)"
MASTER_PNG="$TMP_DIR/master.png"
ICONSET_DIR="$TMP_DIR/${ICON_NAME}.iconset"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$DIST_DIR" "$ICONSET_DIR"
[[ -f "$SOURCE_SVG" ]] || {
  echo "missing source SVG: $SOURCE_SVG" >&2
  exit 1
}

qlmanage -t -s 1024 -o "$TMP_DIR" "$SOURCE_SVG" >/dev/null 2>&1
cp "$TMP_DIR/$(basename "$SOURCE_SVG").png" "$MASTER_PNG"

sips -z 16 16   "$MASTER_PNG" --out "$ICONSET_DIR/icon_16x16.png" >/dev/null
sips -z 32 32   "$MASTER_PNG" --out "$ICONSET_DIR/icon_16x16@2x.png" >/dev/null
sips -z 32 32   "$MASTER_PNG" --out "$ICONSET_DIR/icon_32x32.png" >/dev/null
sips -z 64 64   "$MASTER_PNG" --out "$ICONSET_DIR/icon_32x32@2x.png" >/dev/null
sips -z 128 128 "$MASTER_PNG" --out "$ICONSET_DIR/icon_128x128.png" >/dev/null
sips -z 256 256 "$MASTER_PNG" --out "$ICONSET_DIR/icon_128x128@2x.png" >/dev/null
sips -z 256 256 "$MASTER_PNG" --out "$ICONSET_DIR/icon_256x256.png" >/dev/null
sips -z 512 512 "$MASTER_PNG" --out "$ICONSET_DIR/icon_256x256@2x.png" >/dev/null
sips -z 512 512 "$MASTER_PNG" --out "$ICONSET_DIR/icon_512x512.png" >/dev/null
cp "$MASTER_PNG" "$ICONSET_DIR/icon_512x512@2x.png"

iconutil -c icns "$ICONSET_DIR" -o "$OUTPUT_ICNS"
echo "Generated $OUTPUT_ICNS"
