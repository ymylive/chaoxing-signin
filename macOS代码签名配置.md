# macOS 代码签名配置指南

本文档说明如何为 macOS 应用配置代码签名，以便用户可以直接安装运行，无需手动允许。

## 前提条件

1. **Apple Developer 账号**
   - 个人或组织开发者账号（$99/年）
   - 登录 [Apple Developer](https://developer.apple.com/)

2. **开发者证书**
   - Developer ID Application 证书（用于分发到 Mac App Store 之外）

## 步骤1: 创建证书

### 在 Apple Developer 网站

1. 登录 [Apple Developer](https://developer.apple.com/account/)
2. 进入 "Certificates, Identifiers & Profiles"
3. 点击 "Certificates" > "+" 创建新证书
4. 选择 "Developer ID Application"
5. 按照指引创建 CSR（证书签名请求）
6. 上传 CSR 并下载证书（.cer 文件）

### 在 Mac 上

1. 双击下载的 .cer 文件，导入到"钥匙串访问"
2. 在"钥匙串访问"中找到证书
3. 右键点击证书 > "导出"
4. 选择格式为 ".p12"
5. 设置密码（记住这个密码）

## 步骤2: 配置 GitHub Secrets

1. 进入 GitHub 仓库
2. 点击 "Settings" > "Secrets and variables" > "Actions"
3. 添加以下 Secrets：

### MACOS_CERTIFICATE
- 证书的 Base64 编码
- 获取方法：
  ```bash
  base64 -i certificate.p12 | pbcopy
  ```
- 将复制的内容粘贴到 Secret 值中

### MACOS_CERTIFICATE_PWD
- 导出 .p12 时设置的密码

### MACOS_CERTIFICATE_NAME
- 证书的完整名称
- 获取方法：
  ```bash
  security find-identity -v -p codesigning
  ```
- 示例：`Developer ID Application: Your Name (TEAM_ID)`

## 步骤3: 配置公证（可选但推荐）

公证（Notarization）是 Apple 的额外安全检查，推荐配置。

### 创建 App-Specific Password

1. 登录 [appleid.apple.com](https://appleid.apple.com/)
2. 进入"安全"部分
3. 生成"App专用密码"
4. 记录密码

### 添加 GitHub Secrets

添加以下额外的 Secrets：

- `APPLE_ID`: 你的 Apple ID 邮箱
- `APPLE_TEAM_ID`: 你的 Team ID（在 Apple Developer 账号页面查看）
- `APPLE_APP_PASSWORD`: 刚才生成的 App专用密码

### 更新构建脚本

在 `scripts/build-macos-app.sh` 中添加公证步骤：

```bash
# 公证应用
if [ -n "${APPLE_ID}" ] && [ -n "${APPLE_APP_PASSWORD}" ]; then
    echo "开始公证..."

    # 提交公证
    xcrun notarytool submit "dist/${APP_NAME}.dmg" \
        --apple-id "${APPLE_ID}" \
        --team-id "${APPLE_TEAM_ID}" \
        --password "${APPLE_APP_PASSWORD}" \
        --wait

    # 装订公证票据
    xcrun stapler staple "dist/${APP_NAME}.dmg"

    echo "✓ 公证完成"
fi
```

## 步骤4: 测试签名

### 本地测试

```bash
# 构建应用
bash scripts/build-macos-app.sh

# 验证签名
codesign --verify --deep --strict --verbose=2 "dist/超星学习通签到.app"

# 检查 Gatekeeper
spctl -a -vv "dist/超星学习通签到.app"
```

### GitHub Actions 测试

1. 推送代码到 GitHub
2. 创建新的 tag 触发构建
3. 检查 Actions 日志，确认签名步骤成功
4. 下载构建的 DMG 文件测试

## 验证签名是否成功

下载发布的 DMG 后：

```bash
# 挂载 DMG
hdiutil attach 超星学习通签到.dmg

# 验证签名
codesign -dv --verbose=4 /Volumes/超星学习通签到/超星学习通签到.app

# 检查公证状态
spctl -a -vv /Volumes/超星学习通签到/超星学习通签到.app

# 卸载 DMG
hdiutil detach /Volumes/超星学习通签到
```

成功的输出应该包含：
- `Signature=adhoc` 或你的证书信息
- `accepted` 或 `source=Notarized Developer ID`

## 常见问题

### Q: 签名失败，提示找不到证书

**A:** 检查证书名称是否正确：
```bash
security find-identity -v -p codesigning
```
确保 `MACOS_CERTIFICATE_NAME` 与输出完全匹配。

### Q: 公证失败

**A:** 常见原因：
1. App-Specific Password 错误
2. Team ID 不正确
3. 应用包含不允许的内容

查看详细错误：
```bash
xcrun notarytool log <submission-id> --apple-id your@email.com --team-id TEAMID --password app-password
```

### Q: 用户仍然看到安全警告

**A:** 可能原因：
1. 签名未成功（检查 Actions 日志）
2. 未进行公证（推荐配置）
3. 用户的 macOS 版本过旧

## 成本说明

- **Apple Developer 账号**: $99/年
- **代码签名**: 包含在开发者账号中
- **公证**: 免费

## 替代方案

如果不想购买 Apple Developer 账号：

1. **提供详细的安装说明**
   - 告诉用户如何手动允许运行
   - 参考 `macOS安装指南.md`

2. **使用自签名证书**
   - 用户仍需手动允许
   - 但可以验证应用完整性

3. **通过 Homebrew 分发**
   - 创建 Homebrew Cask
   - 用户通过 `brew install` 安装

## 参考资源

- [Apple 代码签名指南](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [公证你的 macOS 软件](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution/customizing_the_notarization_workflow)
- [Gatekeeper 和运行时保护](https://support.apple.com/guide/security/gatekeeper-and-runtime-protection-sec5599b66df/web)
