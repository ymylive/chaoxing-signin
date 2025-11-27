<h1 align="center">🌿超星学习通签到🌿</h1>

<p align="center">
  <b>基于 <a href="https://github.com/cxOrz/chaoxing-signin">cxOrz/chaoxing-signin</a> 的增强版本</b>
</p>

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)

## ✨ 新增特性

相比原项目，本 Fork 新增以下功能：

- **🖥️ Windows 便携版** - 一键打包成独立 EXE，可放置任意位置运行
- **🎨 黑白极简 UI** - 重新设计的现代化界面，简洁优雅
- **🚀 快速启动** - 优化启动流程，首次初始化后秒开
- **📦 一键部署** - 提供 BAT 脚本，双击即可启动

## 功能列表 📋

- ✅ 普通签到、拍照签到、手势签到
- ✅ 位置签到、签到码签到、二维码签到
- ✅ 多用户凭据储存
- ✅ IM 协议自动签到（监听模式）
- ✅ QQ机器人 / 邮件 / pushplus 推送

## 快速开始 🚀

### Windows 用户（推荐）

1. 下载 Release 中的 `Chaoxing.exe`
2. 双击运行，首次会自动初始化
3. 浏览器自动打开 http://localhost:5000

或使用批处理脚本：
- `START.bat` - 普通启动
- `START-ADMIN.bat` - 管理员权限启动（推荐）

### 从源码运行

```bash
# 克隆仓库
git clone https://github.com/ymylive/chaoxing-signin.git
cd chaoxing-signin

# 安装依赖
pnpm install

# 开发模式运行
pnpm dev
```

### 制作便携版

```bash
# 1. 构建 EXE
pnpm win:build-exe

# 2. 运行制作脚本
双击运行: 制作便携版.bat

# 3. 完成！EXE 可复制到任意位置
```

详细说明：[便携版完整说明.md](./便携版完整说明.md)

## 运行 ⚙

### 命令解释

根目录下：
- `pnpm dev`：运行Web开发服务器、后端接口；
- `pnpm build`：构建前端页面、转译后端代码；
- `pnpm start`：运行手动签到；
- `pnpm serve`：启动后端接口；
- `pnpm monitor`：启动监听模式，检测到签到将自动签上，无需人工干预；

apps/server 目录下：
- `pnpm build`：转译代码；
- `pnpm start`：运行手动签到功能，若有签到则手动完成，若无则退出程序；
- `pnpm serve`：启动接口；
- `pnpm monitor`：启动监听模式，检测到签到将自动签上，无需人工干预；

apps/web 目录下：
- `pnpm dev`：运行 Web 开发服务器；
- `pnpm build`：构建静态页面；

### 基本使用方式

进入 `apps/server` 目录下，执行以下步骤：

构建代码
```bash
pnpm build
```
构建完成，后续的运行直至下次变更代码，不需要再构建，可以直接运行
```bash
pnpm start
```

## 使用须知 📄

为了节约资源，只对2小时以内的活动签到。若同时有多个有效签到活动，只签最新发布的。将结束的课程移入其他文件夹，减少根目录的课程能够提高活动检测速度。

### 二维码签到

在运行之前需要做些准备，请找一位挚友，拍一张二维码的照片，识别二维码，得到一个字符串，复制其中的 `enc` 参数值，例如 `1D0A628CK317F44CCC378M5KD92`，询问时填入。若使用 UI 仓库的项目(查看`高级`)，可以直接选择图片并自动解析得到enc参数。如果遇到10s变换的二维码，参考 [#178](https://github.com/cxOrz/chaoxing-signin/issues/178)

### 位置签到

根据运行时的提示输入**经纬度**和**详细地址**，经纬度在这里获取 [百度拾取坐标系统](https://api.map.baidu.com/lbsapi/getpoint/index.html)，点击某位置，经纬度将出现在网页右上方，复制该值，询问时填入。详细地址样例：河南省郑州市中原区华中师范大学附属郑州万科城小学，该地址将显示在教师端。

### 拍照签到

需要事先准备一张用来提交的照片。浏览器访问超星云盘：https://pan-yz.chaoxing.com ，在根目录上传一张你准备的照片，命名为 `0.jpg` 或 `0.png` 。若使用 UI 仓库的项目(查看`高级`)，不需要上传云盘，可以直接选择图片提交签到。

### 普通签到&手势签到&签到码签到

没有需要准备的，直接运行即可。

### 监听模式

支持开启QQ机器人、邮件推送、pushplus推送；

**QQ 机器人**：根据 [go-cqhttp](https://docs.go-cqhttp.org/guide/quick_start.html) 文档，配置正向 WebSocket、QQ号、密码，并运行 go-cqhttp 程序，即可运行监听模式并启用该选项。

如需发送二维码让机器人识别并签到，请配置 `env.json` 的 `SecretId` 和 `SecretKey`，将使用腾讯云OCR进行识别和处理。

监听模式每次需要时启用 2 - 4 小时较为合适，最好不要挂着不关。

## 高级 🎲

除了简单的 `pnpm start` 来手动签到，也可以部署到服务器使用网页版本，别忘了这也是个 Web 项目。

- 前端界面，查看 [前端](/apps/web) 的详细说明。
- 后端服务，查看 [服务端](/apps/server) 的详细说明。

### 一键运行

方案一：根目录下执行 `pnpm dev` 将运行前后端服务，并在浏览器弹出项目首页，注意这是开发模式！

方案二：使用原项目 Docker 镜像

```bash
docker pull ghcr.io/cxorz/chaoxing-signin:latest
docker run -d -p 80:80 -p 5000:5000 ghcr.io/cxorz/chaoxing-signin
```

> 遇到问题？请先查阅相关文档，仍无法解决可提交 issue

## 目录结构 📁

```
chaoxing-signin/
├── apps/
│   ├── server/          # 后端服务 (Koa + TypeScript)
│   └── web/             # 前端界面 (React + Material UI)
├── packages/            # 共享包
├── launcher/            # Windows 启动器
├── START.bat            # Windows 启动脚本
├── START-ADMIN.bat      # 管理员启动脚本
└── 制作便携版.bat        # 便携版制作脚本
```

## 致谢 🙏

本项目基于 [cxOrz/chaoxing-signin](https://github.com/cxOrz/chaoxing-signin) 开发，感谢原作者的开源贡献！

## 免责声明 ⚠️

本项目仅作为交流学习使用，通过本项目加深网络通信、接口编写、交互设计等方面知识的理解，请勿用作商业用途，任何人或组织使用项目中代码进行的任何违法行为与本人无关。
