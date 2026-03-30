# macOS 安装和使用指南

## 检查你的Mac芯片类型

在下载前，先确认你的Mac使用的芯片：

**方法一：使用终端**
```bash
uname -m
```
- 输出 `arm64` = Apple Silicon (M1/M2/M3)
- 输出 `x86_64` = Intel

**方法二：查看系统信息**
1. 点击左上角  菜单
2. 选择"关于本机"
3. 查看"芯片"或"处理器"字段
   - 显示"Apple M1/M2/M3" = Apple Silicon
   - 显示"Intel Core" = Intel

## 下载和安装

### 方式一：使用 DMG 安装包（推荐）

**适用于：所有Mac（Intel和Apple Silicon）**

1. **下载 DMG 文件**
   - 从 [Releases](https://github.com/ymylive/chaoxing-signin/releases) 页面下载 `超星学习通签到.dmg`
   - 这是 Universal Binary，同时支持Intel和Apple Silicon

2. **安装应用**
   - 双击打开 DMG 文件
   - 将"超星学习通签到"图标拖到"应用程序"文件夹

3. **首次运行**
   - 打开"应用程序"文件夹
   - 右键点击"超星学习通签到"
   - 选择"打开"（不要双击）
   - 在弹出的对话框中点击"打开"

### 方式二：使用命令行可执行文件

根据你的芯片类型选择：

#### Universal Binary（推荐）
**适用于：所有Mac**

```bash
# 下载 Chaoxing-macos
chmod +x Chaoxing-macos
xattr -cr Chaoxing-macos
./Chaoxing-macos
```

#### Apple Silicon 专用版本
**适用于：M1/M2/M3 芯片**

```bash
# 下载 Chaoxing-macos-arm64
chmod +x Chaoxing-macos-arm64
xattr -cr Chaoxing-macos-arm64
./Chaoxing-macos-arm64
```

#### Intel 专用版本
**适用于：Intel 芯片**

```bash
# 下载 Chaoxing-macos-x64
chmod +x Chaoxing-macos-x64
xattr -cr Chaoxing-macos-x64
./Chaoxing-macos-x64
```

## 版本选择指南

| 文件名 | 芯片支持 | 文件大小 | 推荐度 |
|--------|---------|---------|--------|
| 超星学习通签到.dmg | Intel + Apple Silicon | ~120MB | ⭐⭐⭐⭐⭐ |
| Chaoxing-macos | Intel + Apple Silicon | ~450MB | ⭐⭐⭐⭐ |
| Chaoxing-macos-arm64 | 仅 Apple Silicon | ~430MB | ⭐⭐⭐ |
| Chaoxing-macos-x64 | 仅 Intel | ~430MB | ⭐⭐⭐ |

**建议：**
- 不确定？下载 DMG 或 Universal Binary
- 想要最小文件？根据芯片下载对应版本

## 常见问题

### 问题1: "无法打开，因为无法验证开发者"

**解决方法A: 通过系统偏好设置**
1. 打开"系统偏好设置"
2. 点击"安全性与隐私"
3. 在"通用"标签页底部，点击"仍要打开"
4. 再次尝试打开应用

**解决方法B: 使用终端命令**
```bash
# 对于 .app 应用
sudo xattr -rd com.apple.quarantine /Applications/超星学习通签到.app

# 对于可执行文件
xattr -cr Chaoxing-macos
```

### 问题2: "应用已损坏，无法打开"

这通常是因为 Gatekeeper 的隔离属性。运行以下命令：

```bash
# 对于 .app 应用
sudo xattr -cr /Applications/超星学习通签到.app

# 对于可执行文件
xattr -cr Chaoxing-macos
```

### 问题3: 应用无法启动或闪退

1. **检查系统版本**
   - 确保 macOS 版本 >= 10.15 (Catalina)

2. **查看日志**
   ```bash
   # 查看应用日志
   log show --predicate 'process == "Chaoxing"' --last 5m
   ```

3. **从终端启动查看错误**
   ```bash
   # 对于 .app 应用
   /Applications/超星学习通签到.app/Contents/MacOS/Chaoxing

   # 对于可执行文件
   ./Chaoxing-macos
   ```

### 问题4: 端口被占用

如果提示端口 5000 或 3000 被占用：

```bash
# 查找占用端口的进程
lsof -i :5000
lsof -i :3000

# 结束进程（替换 PID 为实际进程ID）
kill -9 PID
```

## 后台运行

### 使用 nohup
```bash
nohup ./Chaoxing-macos > chaoxing.log 2>&1 &
```

### 使用 screen
```bash
screen -S chaoxing
./Chaoxing-macos
# 按 Ctrl+A 然后按 D 分离会话
```

### 创建 LaunchAgent（开机自启）

1. 创建配置文件：
```bash
nano ~/Library/LaunchAgents/com.chaoxing.signin.plist
```

2. 添加以下内容：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.chaoxing.signin</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Applications/超星学习通签到.app/Contents/MacOS/Chaoxing</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/chaoxing.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/chaoxing.error.log</string>
</dict>
</plist>
```

3. 加载服务：
```bash
launchctl load ~/Library/LaunchAgents/com.chaoxing.signin.plist
```

4. 卸载服务：
```bash
launchctl unload ~/Library/LaunchAgents/com.chaoxing.signin.plist
```

## 卸载

### 卸载应用
```bash
rm -rf /Applications/超星学习通签到.app
```

### 删除用户数据
```bash
rm -rf ~/Library/Application\ Support/ChaoxingSignin
rm -rf ~/Library/Logs/ChaoxingSignin
```

### 删除 LaunchAgent
```bash
launchctl unload ~/Library/LaunchAgents/com.chaoxing.signin.plist
rm ~/Library/LaunchAgents/com.chaoxing.signin.plist
```

## 代码签名说明

### 当前状态
- 如果 Release 说明中显示"已签名"，表示应用已通过 Apple Developer 证书签名
- 如果显示"未签名"，需要手动允许运行（见上述解决方法）

### 验证签名
```bash
# 检查签名状态
codesign -dv --verbose=4 /Applications/超星学习通签到.app

# 验证签名
codesign --verify --deep --strict --verbose=2 /Applications/超星学习通签到.app

# 检查 Gatekeeper 评估
spctl -a -vv /Applications/超星学习通签到.app
```

## 性能优化

### 减少内存占用
应用基于 Node.js，可以通过环境变量限制内存：

```bash
export NODE_OPTIONS="--max-old-space-size=512"
./Chaoxing-macos
```

### 禁用自动更新检查
如果应用有自动更新功能，可以禁用：

```bash
export DISABLE_AUTO_UPDATE=1
./Chaoxing-macos
```

## 技术支持

如果遇到其他问题：
1. 查看 [GitHub Issues](https://github.com/ymylive/chaoxing-signin/issues)
2. 提交新的 Issue 并附上：
   - macOS 版本
   - 错误信息
   - 终端输出日志

## 开发者选项

### 从源码构建
```bash
# 克隆仓库
git clone https://github.com/ymylive/chaoxing-signin.git
cd chaoxing-signin

# 安装依赖
pnpm install

# 构建
pnpm run prepack:build

# 打包 macOS 可执行文件
pnpm dlx pkg@5.8.1 -t node18-macos-x64 -o dist/Chaoxing-macos .

# 创建 .app bundle
bash scripts/build-macos-app.sh
```

### 本地签名
如果你有 Apple Developer 证书：

```bash
# 签名应用
codesign --force --deep --sign "Developer ID Application: Your Name" /Applications/超星学习通签到.app

# 公证（需要 Apple ID）
xcrun notarytool submit 超星学习通签到.dmg --apple-id your@email.com --team-id TEAMID --password app-specific-password
```
