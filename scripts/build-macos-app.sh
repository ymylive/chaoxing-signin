#!/bin/bash
set -e

# 超星学习通签到 macOS 应用打包脚本

APP_NAME="超星学习通签到"
BUNDLE_ID="com.chaoxing.signin"
VERSION="4.3.7"
EXECUTABLE_NAME="Chaoxing"

# 创建应用包结构
APP_DIR="dist/${APP_NAME}.app"
CONTENTS_DIR="${APP_DIR}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"

echo "创建应用包结构..."
mkdir -p "${MACOS_DIR}"
mkdir -p "${RESOURCES_DIR}"

# 复制可执行文件
echo "复制可执行文件..."
cp "dist/Chaoxing-macos" "${MACOS_DIR}/${EXECUTABLE_NAME}"
chmod +x "${MACOS_DIR}/${EXECUTABLE_NAME}"

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
if [ -n "${MACOS_CERTIFICATE}" ] && [ -n "${MACOS_CERTIFICATE_PWD}" ]; then
    echo "检测到签名证书，开始签名..."

    # 导入证书
    KEYCHAIN_PATH=$RUNNER_TEMP/app-signing.keychain-db
    KEYCHAIN_PASSWORD=$(openssl rand -base64 32)

    # 创建临时keychain
    security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
    security set-keychain-settings -lut 21600 "$KEYCHAIN_PATH"
    security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"

    # 导入证书
    echo "$MACOS_CERTIFICATE" | base64 --decode > certificate.p12
    security import certificate.p12 -k "$KEYCHAIN_PATH" -P "$MACOS_CERTIFICATE_PWD" -T /usr/bin/codesign
    security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"

    # 签名
    /usr/bin/codesign --force --deep --sign "${MACOS_CERTIFICATE_NAME}" "${APP_DIR}"

    echo "✓ 应用签名完成"

    # 验证签名
    codesign --verify --verbose "${APP_DIR}"
    spctl --assess --verbose "${APP_DIR}"

    # 清理
    rm certificate.p12
    security delete-keychain "$KEYCHAIN_PATH"
else
    echo "⚠️  未检测到签名证书，跳过签名步骤"
    echo "   应用未签名，用户需要手动允许运行"
fi

# 创建 DMG
echo "创建 DMG 镜像..."
hdiutil create -volname "${APP_NAME}" -srcfolder "${APP_DIR}" -ov -format UDZO "dist/${APP_NAME}.dmg"

echo "✓ DMG 创建完成: dist/${APP_NAME}.dmg"
