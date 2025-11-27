# Windows EXE 使用说明

## 构建 EXE

在项目根目录运行：

```bash
pnpm win:build-exe
```

构建完成后会生成 `dist/Chaoxing.exe`

## 启动程序

### 方法1：以管理员身份运行（推荐）

**选项 A**: 右键点击 `dist\Chaoxing.exe` → 选择"以管理员身份运行"

**选项 B**: 右键点击 `START-ADMIN.bat` → 选择"以管理员身份运行"

### 方法2：普通启动（可能功能受限）

双击 `START.bat` - 程序会显示警告但仍然可以运行

### 方法3：直接运行 EXE

双击 `dist\Chaoxing.exe` - 会显示警告提示需要管理员权限，5秒后继续运行

## 访问界面

程序启动后，浏览器会自动打开：

- **前端界面**: http://localhost:3000
- **后端 API**: http://localhost:5000

## 跳过管理员权限（调试模式）

如果不需要管理员权限（仅用于调试），可以在命令行运行：

```bash
dist\Chaoxing.exe --no-elevate --debug
```

## 查看日志

日志文件位置：

```
%LOCALAPPDATA%\ChaoxingSignin\logs\
```

通常为：`C:\Users\你的用户名\AppData\Local\ChaoxingSignin\logs\`

## 常见问题

### 1. 需要管理员权限吗？

**推荐以管理员身份运行**，否则某些功能可能无法正常工作。

如果不以管理员身份运行：
- 程序会显示警告，但仍然可以继续
- 某些系统配置功能可能无法使用
- 日志会记录权限不足的警告

### 2. 如何以管理员身份运行？

**方法 1**: 右键点击 `dist\Chaoxing.exe` → "以管理员身份运行"

**方法 2**: 右键点击 `START-ADMIN.bat` → "以管理员身份运行"  

### 3. 程序闪退怎么办？

1. 检查日志：`%LOCALAPPDATA%\ChaoxingSignin\logs\`
2. 确保已安装 Node.js
3. 尝试调试模式：`dist\Chaoxing.exe --no-elevate --debug`

### 4. 找不到 Node.js 工具

程序需要 npm/pnpm，请先安装 Node.js：
https://nodejs.org/

### 5. 端口被占用

如果 3000 或 5000 端口被占用，请先关闭占用端口的程序。

## 开发模式

如果你是开发者，想在开发模式下运行（不打包 EXE）：

```bash
# 运行启动器脚本
pnpm win:debug-launcher

# 或直接运行
node launcher/launcher.cjs --debug --no-elevate
```

## 为什么需要管理员权限？

程序需要管理员权限以便：
1. 安装和配置依赖
2. 创建系统任务计划（可选）
3. 确保网络访问权限

如果不需要这些功能，可以使用 `--no-elevate` 参数跳过。
