#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DMG_PATH="${1:-$ROOT_DIR/dist/Chaoxing-macos.dmg}"
APP_NAME="超星学习通签到.app"
VOLUME_NAME="超星学习通签到"
MOUNT_POINT=""
DEVICE_ENTRY=""

get_attach_info() {
  local plist_path="$1"
  local field="$2"
  local index=0
  local mount_point=""
  local value=""

  while true; do
    mount_point="$(plutil -extract "system-entities.${index}.mount-point" raw "${plist_path}" 2>/dev/null || true)"
    if [ -z "${mount_point}" ]; then
      break
    fi

    value="$(plutil -extract "system-entities.${index}.${field}" raw "${plist_path}" 2>/dev/null || true)"
    if [ -n "${value}" ]; then
      printf '%s\n' "${value}"
      return 0
    fi

    index=$((index + 1))
  done

  return 1
}

cleanup() {
  if [ -n "$MOUNT_POINT" ] || [ -n "$DEVICE_ENTRY" ]; then
    osascript >/dev/null 2>&1 <<OSA || true
tell application "Finder"
  if exists disk "$VOLUME_NAME" then
    try
      close container window of disk "$VOLUME_NAME"
    end try
  end if
end tell
OSA
    if [ -n "$DEVICE_ENTRY" ]; then
      hdiutil detach "$DEVICE_ENTRY" -quiet 2>/dev/null || true
    fi
    if [ -n "$MOUNT_POINT" ]; then
      hdiutil detach "$MOUNT_POINT" -quiet 2>/dev/null || true
    fi
  fi
}
trap cleanup EXIT

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

[[ -f "$DMG_PATH" ]] || fail "missing DMG artifact: $DMG_PATH"

ATTACH_PLIST="$(mktemp)"
hdiutil attach -plist "$DMG_PATH" -readonly > "$ATTACH_PLIST"
MOUNT_POINT="$(get_attach_info "$ATTACH_PLIST" mount-point || true)"
DEVICE_ENTRY="$(get_attach_info "$ATTACH_PLIST" dev-entry || true)"
rm -f "$ATTACH_PLIST"

[[ -n "$MOUNT_POINT" ]] || fail "unable to determine mounted volume path"
[[ -n "$DEVICE_ENTRY" ]] || fail "unable to determine mounted device"

[[ -d "$MOUNT_POINT/$APP_NAME" ]] || fail "missing app bundle inside DMG"
[[ -L "$MOUNT_POINT/Applications" ]] || fail "missing Applications symlink inside DMG"

osascript <<OSA >/dev/null
tell application "Finder"
  open POSIX file "$MOUNT_POINT"
  delay 1

  tell disk "$VOLUME_NAME"
    if not (exists item "$APP_NAME") then error "missing app icon"
    if not (exists item "Applications") then error "missing Applications icon"
    set appPosition to position of item "$APP_NAME"
    set appsPosition to position of item "Applications"
  end tell

  set diskWindow to container window of disk "$VOLUME_NAME"
  if current view of diskWindow is not icon view then error "disk window is not in icon view"
  set arrangementValue to arrangement of icon view options of diskWindow
  if arrangementValue is not not arranged then error "icons are auto-arranged"

  if item 1 of appPosition is not less than item 1 of appsPosition then
    error "Applications icon is not positioned to the right of the app icon"
  end if

  try
    close container window of disk "$VOLUME_NAME"
  end try
end tell
OSA

echo "DMG verification passed"
