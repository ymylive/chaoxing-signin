#!/bin/bash
set -euo pipefail

APP_NAME="超星学习通签到"
BUNDLE_ID="com.chaoxing.signin"
VERSION="4.3.7"
EXECUTABLE_NAME="Chaoxing"
DMG_NAME="Chaoxing-macos.dmg"
ICON_NAME="ChaoxingAppIcon"
ICON_OUTPUT="dist/${ICON_NAME}.icns"

APP_DIR="dist/${APP_NAME}.app"
CONTENTS_DIR="${APP_DIR}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"

TMP_DIR="$(mktemp -d)"
STAGING_DMG="${TMP_DIR}/staging.dmg"
MOUNT_POINT="${TMP_DIR}/mount"
FINAL_DMG="dist/${DMG_NAME}"
FINDER_MOUNT_POINT=""
FINDER_DEVICE=""

cleanup() {
  hdiutil detach "${MOUNT_POINT}" -quiet 2>/dev/null || true
  if [ -n "${FINDER_DEVICE}" ]; then
    hdiutil detach "${FINDER_DEVICE}" -quiet 2>/dev/null || true
  fi
  if [ -n "${FINDER_MOUNT_POINT}" ]; then
    hdiutil detach "${FINDER_MOUNT_POINT}" -quiet 2>/dev/null || true
  fi
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

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

echo "创建应用包结构..."
mkdir -p "${MACOS_DIR}"
mkdir -p "${RESOURCES_DIR}"
if [ ! -f "${ICON_OUTPUT}" ]; then
  bash scripts/build-macos-icon.sh "${ICON_OUTPUT}"
fi
cp "${ICON_OUTPUT}" "${RESOURCES_DIR}/${ICON_NAME}.icns"

# 复制可执行文件
echo "复制可执行文件..."
cp "dist/Chaoxing-macos" "${MACOS_DIR}/${EXECUTABLE_NAME}"
chmod +x "${MACOS_DIR}/${EXECUTABLE_NAME}"
cp "dist/chaoxing-macos.bin" "${MACOS_DIR}/chaoxing-macos.bin"
chmod +x "${MACOS_DIR}/chaoxing-macos.bin"

# 创建 Info.plist
echo "创建 Info.plist..."
cat > "${CONTENTS_DIR}/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>${EXECUTABLE_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>${BUNDLE_ID}</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleDisplayName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleIconFile</key>
    <string>${ICON_NAME}</string>
    <key>CFBundleVersion</key>
    <string>${VERSION}</string>
    <key>CFBundleShortVersionString</key>
    <string>${VERSION}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSApplicationCategoryType</key>
    <string>public.app-category.education</string>
    <key>NSHumanReadableCopyright</key>
    <string>Copyright © 2026 Chaoxing Signin. All rights reserved.</string>
</dict>
</plist>
EOF

# 创建 PkgInfo
echo "APPL????" > "${CONTENTS_DIR}/PkgInfo"

echo "✓ macOS 应用包创建完成: ${APP_DIR}"

# 如果提供了签名证书，进行签名
if [ -n "${MACOS_CERTIFICATE:-}" ] && [ -n "${MACOS_CERTIFICATE_PWD:-}" ] && [ -n "${MACOS_CERTIFICATE_NAME:-}" ]; then
    echo "检测到签名证书，开始签名..."

    # 导入证书
    RUNNER_TEMP_DIR="${RUNNER_TEMP:-${TMP_DIR}}"
    KEYCHAIN_PATH="${RUNNER_TEMP_DIR}/app-signing.keychain-db"
    KEYCHAIN_PASSWORD=$(openssl rand -base64 32)
    CERTIFICATE_PATH="${TMP_DIR}/certificate.p12"

    # 创建临时keychain
    security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
    security set-keychain-settings -lut 21600 "$KEYCHAIN_PATH"
    security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"

    # 导入证书
    echo "$MACOS_CERTIFICATE" | base64 --decode > "$CERTIFICATE_PATH"
    security import "$CERTIFICATE_PATH" -k "$KEYCHAIN_PATH" -P "$MACOS_CERTIFICATE_PWD" -T /usr/bin/codesign
    security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"

    # 签名
    /usr/bin/codesign --force --deep --sign "${MACOS_CERTIFICATE_NAME}" "${APP_DIR}"

    echo "✓ 应用签名完成"

    # 验证签名
    codesign --verify --verbose "${APP_DIR}"
    spctl --assess --verbose "${APP_DIR}"

    # 清理
    security delete-keychain "$KEYCHAIN_PATH"
else
    echo "⚠️  未检测到签名证书，跳过签名步骤"
    echo "   应用未签名，用户需要手动允许运行"
fi

# 创建 DMG
echo "创建 DMG 镜像..."
rm -f "${FINAL_DMG}"
mkdir -p "${MOUNT_POINT}"

APP_SIZE_MB="$(du -sm "${APP_DIR}" | awk '{print $1 + 32}')"

hdiutil create \
  -size "${APP_SIZE_MB}m" \
  -fs HFS+ \
  -volname "${APP_NAME}" \
  -ov \
  "${STAGING_DMG}"

hdiutil attach "${STAGING_DMG}" -nobrowse -mountpoint "${MOUNT_POINT}" >/dev/null

cp -R "${APP_DIR}" "${MOUNT_POINT}/"
ln -s /Applications "${MOUNT_POINT}/Applications"

sync
hdiutil detach "${MOUNT_POINT}" >/dev/null

FINDER_ATTACH_PLIST="${TMP_DIR}/finder-attach.plist"
hdiutil attach -plist "${STAGING_DMG}" > "${FINDER_ATTACH_PLIST}"
FINDER_MOUNT_POINT="$(get_attach_info "${FINDER_ATTACH_PLIST}" mount-point || true)"
FINDER_DEVICE="$(get_attach_info "${FINDER_ATTACH_PLIST}" dev-entry || true)"
if [ -z "${FINDER_MOUNT_POINT}" ] || [ -z "${FINDER_DEVICE}" ]; then
  echo "❌ 无法检测 Finder 挂载路径"
  exit 1
fi

if ! osascript scripts/macos-dmg-layout.applescript "${APP_NAME}" "${APP_NAME}.app" "${FINDER_MOUNT_POINT}"; then
  echo "⚠️  Finder 布局设置失败，继续打包 DMG"
fi

osascript >/dev/null 2>&1 <<OSA || true
tell application "Finder"
  if exists disk "${APP_NAME}" then
    try
      close container window of disk "${APP_NAME}"
    end try
  end if
end tell
OSA

sync
sleep 1
hdiutil detach "${FINDER_DEVICE}" >/dev/null
FINDER_DEVICE=""
FINDER_MOUNT_POINT=""

hdiutil convert "${STAGING_DMG}" -format UDZO -o "${FINAL_DMG}" >/dev/null

echo "✓ DMG 创建完成: ${FINAL_DMG}"
