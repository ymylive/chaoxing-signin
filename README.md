<h1 align="center">🌿超星学习通签到🌿</h1>

<p align="center">
  <b>基于 <a href="https://github.com/cxOrz/chaoxing-signin">cxOrz/chaoxing-signin</a> 的增强版本</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS">
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Windows">
  <img src="https://img.shields.io/badge/macOS-000000?style=for-the-badge&logo=apple&logoColor=white" alt="macOS">
  <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android">
</p>

## ✨ 新增特性

相比原项目，本 Fork 新增以下功能：

- **🖥️ 多平台支持** - Windows、macOS (Intel + Apple Silicon)、Android 全平台覆盖
- **📦 便携版本** - 独立可执行文件，无需安装依赖
- **🎨 黑白极简 UI** - 重新设计的现代化界面，简洁优雅
- **🚀 快速启动** - 优化启动流程，首次初始化后秒开
- **🔧 一键部署** - 提供自动化脚本，简化安装过程

## 功能列表 📋

- ✅ 普通签到、拍照签到、手势签到
- ✅ 位置签到、签到码签到、二维码签到
- ✅ 多用户凭据储存
- ✅ IM 协议自动签到（监听模式）
- ✅ QQ机器人 / 邮件 / pushplus 推送

## 快速开始 🚀

### 📥 下载

前往 [Releases](https://github.com/ymylive/chaoxing-signin/releases/latest) 页面下载对应平台的版本。

### 🪟 Windows 用户

**方式一：使用 EXE（推荐）**
1. 下载 `Chaoxing.exe`
2. 右键选择"以管理员身份运行"
3. 浏览器自动打开 http://localhost:5000

**方式二：使用批处理脚本**
- `START.bat` - 普通启动
- `START-ADMIN.bat` - 管理员权限启动（推荐）

### 🍎 macOS 用户

**方式一：使用 DMG（推荐）**
1. 下载 `超星学习通签到.dmg`（Universal Binary，支持 Intel 和 Apple Silicon）
2. 双击打开，拖动到"应用程序"文件夹
3. **右键点击应用**选择"打开"（首次运行必须）
4. 在对话框中再次点击"打开"

**方式二：使用命令行版本**
1. 下载对应版本的可执行文件
2. **右键点击文件**，选择"打开"（首次运行必须）
3. 在对话框中点击"打开"
4. 之后可以直接双击运行

**版本选择：**
- `Chaoxing-macos` - Universal Binary（推荐，支持所有Mac）
- `Chaoxing-macos-arm64` - Apple Silicon (M1/M2/M3)
- `Chaoxing-macos-x64` - Intel

**⚠️ 重要提示**
- **首次运行必须右键选择"打开"**，这是 macOS 安全机制
- 不能直接双击运行未签名的应用
- 详细说明：[macOS安全警告解决方案.md](./macOS安全警告解决方案.md)

### 🤖 Android 用户

1. 下载 `chaoxing-signin.apk`
2. 允许安装未知来源应用
3. 安装并打开应用

### 💻 从源码运行

```bash
# 克隆仓库
git clone https://github.com/ymylive/chaoxing-signin.git
cd chaoxing-signin

# 安装依赖
pnpm install

# 开发模式运行
pnpm dev
```

## 平台支持 🌐

| 平台 | 架构 | 文件 | 状态 |
|------|------|------|------|
| Windows | x64 | Chaoxing.exe | ✅ 支持 |
| macOS | Universal | 超星学习通签到.dmg | ✅ 支持 |
| macOS | Universal | Chaoxing-macos | ✅ 支持 |
| macOS | Apple Silicon | Chaoxing-macos-arm64 | ✅ 支持 |
| macOS | Intel | Chaoxing-macos-x64 | ✅ 支持 |
| Android | ARM/x86 | chaoxing-signin.apk | ✅ 支持 |

## 使用说明 📖

### 命令解释

**根目录下：**
- `pnpm dev` - 运行Web开发服务器、后端接口
- `pnpm build` - 构建前端页面、转译后端代码
- `pnpm start` - 运行手动签到
- `pnpm serve` - 启动后端接口
- `pnpm monitor` - 启动监听模式，自动签到

**apps/server 目录下：**
- `pnpm build` - 转译代码
- `pnpm start` - 运行手动签到功能
- `pnpm serve` - 启动接口
- `pnpm monitor` - 启动监听模式

**apps/web 目录下：**
- `pnpm dev` - 运行 Web 开发服务器
- `pnpm build` - 构建静态页面

### 签到类型说明

#### 二维码签到
拍摄二维码照片，识别后复制 `enc` 参数值（例如 `1D0A628CK317F44CCC378M5KD92`），在询问时填入。

参考：[#178](https://github.com/cxOrz/chaoxing-signin/issues/178)

#### 位置签到
使用 [百度拾取坐标系统](https://api.map.baidu.com/lbsapi/getpoint/index.html) 获取经纬度，并提供详细地址。

示例：河南省郑州市中原区华中师范大学附属郑州万科城小学

#### 拍照签到
访问 [超星云盘](https://pan-yz.chaoxing.com)，在根目录上传照片，命名为 `0.jpg` 或 `0.png`。

#### 普通签到 / 手势签到 / 签到码签到
无需准备，直接运行即可。

### 监听模式

支持以下推送方式：
- **QQ机器人** - 配合 [go-cqhttp](https://docs.go-cqhttp.org/guide/quick_start.html) 使用
- **邮件推送**
- **pushplus推送**

**注意：** 监听模式建议每次启用 2-4 小时，不要长时间挂载。

## 高级功能 🎲

### Web 部署

可以部署到服务器使用网页版本：

- 前端界面：查看 [apps/web](/apps/web) 的详细说明
- 后端服务：查看 [apps/server](/apps/server) 的详细说明

### Docker 部署

```bash
docker pull ghcr.io/cxorz/chaoxing-signin:latest
docker run -d -p 80:80 -p 5000:5000 ghcr.io/cxorz/chaoxing-signin
```

### 制作便携版

```bash
# 1. 构建项目
pnpm run prepack:build

# 2. 打包 Windows EXE
pnpm run win:build-exe

# 3. 运行制作脚本
# Windows: 双击运行 制作便携版.bat
```

详细说明：[便携版完整说明.md](./便携版完整说明.md)

## 文档 📚

- [多平台支持说明.md](./多平台支持说明.md) - 所有平台的使用说明
- [macOS安装指南.md](./macOS安装指南.md) - macOS 详细安装步骤
- [macOS安全警告解决方案.md](./macOS安全警告解决方案.md) - 解决 Gatekeeper 警告
- [macOS代码签名配置.md](./macOS代码签名配置.md) - 配置 Apple 证书
- [便携版完整说明.md](./便携版完整说明.md) - Windows 便携版说明
- [Windows使用说明.md](./Windows使用说明.md) - Windows 使用指南
- [DockerGuide.md](./DockerGuide.md) - Docker 部署指南

## 目录结构 📁

```
chaoxing-signin/
├── apps/
│   ├── server/          # 后端服务 (Koa + TypeScript)
│   └── web/             # 前端界面 (React + Material UI)
├── packages/            # 共享包
├── launcher/            # Windows 启动器
├── scripts/             # 构建和工具脚本
│   ├── build-macos-app.sh       # macOS 应用打包
│   └── fix-macos-security.sh    # macOS 安全修复
├── .github/workflows/   # GitHub Actions 自动化构建
├── START.bat            # Windows 启动脚本
├── START-ADMIN.bat      # 管理员启动脚本
└── 制作便携版.bat        # 便携版制作脚本
```

## 常见问题 ❓

### Windows 提示"Windows已保护你的电脑"？
点击"更多信息"，然后选择"仍要运行"。应用未签名是正常的。

### macOS 提示"无法验证开发者"？
查看 [macOS安全警告解决方案.md](./macOS安全警告解决方案.md) 获取详细解决方法。

### Android 无法安装？
前往"设置" > "安全"，允许"未知来源"或"安装未知应用"。

### 如何检查 Mac 芯片类型？
```bash
uname -m
# arm64 = Apple Silicon (M1/M2/M3)
# x86_64 = Intel
```

## 贡献 🤝

欢迎提交 Issue 和 Pull Request！

## 致谢 🙏

本项目基于 [cxOrz/chaoxing-signin](https://github.com/cxOrz/chaoxing-signin) 开发，感谢原作者的开源贡献！

## 许可证 📄

[MIT License](./LICENSE)

## 免责声明 ⚠️

本项目仅作为交流学习使用，通过本项目加深网络通信、接口编写、交互设计等方面知识的理解，请勿用作商业用途，任何人或组织使用项目中代码进行的任何违法行为与本人无关。
