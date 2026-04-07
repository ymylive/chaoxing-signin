## 命令解释

- `pnpm build`：转译源码，输出到 build 文件夹；必须先转译才能运行程序；
- `pnpm start`：运行程序，若有签到则手动完成，若无则退出程序；
- `pnpm serve`：启动接口服务；
- `pnpm monitor`：监听模式，检测到签到将自动签上，无需人工干预；
- `pnpm test`：运行单元测试；

## v4.4.6 安全与质量改进

本版本对代码进行了全面审查和修复，涵盖安全、性能、代码质量三大方面：

### 安全加固
- **路径遍历防护**：静态文件服务使用 `resolveStaticAssetPath` 验证路径不越界
- **URL 注入修复**：二维码签到使用 `URLSearchParams` 安全构建 URL，替代不安全的字符串拼接
- **输入验证**：关键 API 端点（`/login`、`/activity`）添加必填字段校验
- **全局错误处理**：添加全局错误中间件，避免异常时暴露堆栈信息
- **类型安全**：消除所有 `as any` 类型断言，新增 8 个 DTO 接口

### 性能优化
- **请求超时**：HTTP 请求添加 30 秒超时机制，防止连接挂起
- **临时文件清理**：上传临时文件改用同步删除，确保清理完成
- **深拷贝优化**：`JSON.parse(JSON.stringify())` 替换为 `structuredClone()`

### 代码质量
- **消除代码重复**：`GeneralSign`/`PhotoSign` 系列函数提取公共逻辑
- **错误处理规范化**：`throw 'string'` 改为 `throw new Error()`，空 catch 块全部填充
- **正则匹配安全**：消除非空断言 `!`，添加 null 检查和错误日志

## 基本使用方式

更新仓库代码之后，先构建
```bash
pnpm build
```
构建完成，后续的运行直至下次变更代码，不需要再构建，可以直接运行
```bash
pnpm start
```

【注意】对 src 目录下任何文件做出修改后，需重新构建才可生效！

## 最佳实践

部署在服务器，步骤如下：

1. 安装 Node 环境，推荐使用 LTS 版本
2. 克隆代码 `git clone https://github.com/cxOrz/chaoxing-sign-cli.git`
3. 进入项目目录，安装依赖
4. 配置项目的 env.json 文件（可选）
5. 转译源码 `pnpm build`
6. 最后，使用 GNU Screen 或者 PM2 运行接口服务

还有一些事情必需知道：

- 如果使用腾讯文字识别来解析二维码，请在 `src/env.json` 文件中配置 secretId 和 secretKey，然后重新构建代码。

<details>
<summary>使用云函数注意事项</summary>

1. 此项目可以运行在 AWS Lambda 和 腾讯云函数上运行（均不支持监听）。如有需求运行在 Serverless 容器，请修改 `src/env.json` 中的 `SERVERLESS` 为 `true`，然后重新构建代码。
2. 如使用腾讯云函数，请仔细按云函数文档操作，对代码稍作调整，安装依赖、转译源码，并配置云函数启动文件 scf_bootstrap 内容为如下命令
``` bash
#!/bin/bash
/var/lang/node16/bin/node build/serve.js
```

</details>

至此，部署完成，可通过域名或服务器 IP 访问接口的默认路径 `/` ，看到欢迎页面。
