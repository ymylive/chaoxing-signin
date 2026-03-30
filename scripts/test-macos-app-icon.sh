#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_PATH="${1:-$ROOT_DIR/dist/超星学习通签到.app}"
PLIST_PATH="$APP_PATH/Contents/Info.plist"
ICON_BASENAME="ChaoxingAppIcon"
ICON_PATH="$APP_PATH/Contents/Resources/${ICON_BASENAME}.icns"

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

[[ -d "$APP_PATH" ]] || fail "missing app bundle: $APP_PATH"
[[ -f "$PLIST_PATH" ]] || fail "missing Info.plist: $PLIST_PATH"
[[ -f "$ICON_PATH" ]] || fail "missing icon asset: $ICON_PATH"

ICON_VALUE="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIconFile' "$PLIST_PATH" 2>/dev/null || true)"
[[ -n "$ICON_VALUE" ]] || fail "missing CFBundleIconFile in Info.plist"

if [[ "$ICON_VALUE" != "$ICON_BASENAME" && "$ICON_VALUE" != "${ICON_BASENAME}.icns" ]]; then
  fail "unexpected CFBundleIconFile value: $ICON_VALUE"
fi

echo "App icon verification passed"
