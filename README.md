# Vome UniApp

[English](./README.en.md) | 简体中文

基于 **Vue 3 + uni-app** 的多端 C 端脚手架（H5、微信小程序等）。与 [vome-service](https://gitee.com/vomekj/vome-service) 共用同一后端，走 **App 侧** API（`/app/...`）与 EPS（`service.user.*` 等）；与 [vome-web](https://gitee.com/vomekj/vome-web) 能力对齐，UI 使用 **tt-shaduni**。

> 威迈科技开源项目。需先启动 Vome Service。

## 特性

| 能力 | 说明 |
| --- | --- |
| **多端编译** | H5、微信 / 支付宝等小程序（见 `package.json` 脚本） |
| **App EPS** | `createEps({ side: 'app' })` 类型化 `service` 客户端 |
| **登录体系** | H5：密码 / 注册 / OTP / Better Auth SSO；微信小程序：`code` → `/app/user/login/mini` |
| **同源代理（H5）** | 开发态 `/dev` 转发到 Service |
| **Socket.IO** | `@wu-xj/uni-socket.io` 适配，登录后可选连接 |
| **Tab 壳** | 首页 / 发现 / 消息 / 我的；宽屏顶栏（≥768） |
| **tt-shaduni** | `postinstall` 自动 link 到 `uni_modules` |
| **主题 / Remix Icon** | 亮暗主题与跨端图标组件 |

## 技术栈

- [Vue 3](https://vuejs.org) + [uni-app](https://uniapp.dcloud.net.cn)（`@dcloudio/*`）
- [Pinia](https://pinia.vuejs.org)
- [Better Auth](https://www.better-auth.com)（H5 会话 / 社交）
- [tt-shaduni](https://uni_modules)（UI，postinstall link）
- [vome-core](https://www.npmjs.com/package/vome-core)（EPS / 请求客户端）
- Remix Icon
- 推荐包管理器：[Bun](https://bun.sh)

## 环境要求

| 依赖 | 说明 |
| --- | --- |
| **Node / Bun** | 安装依赖与 uni CLI |
| **Vome Service** | 必须先启动（默认 `http://127.0.0.1:3000`） |
| **微信开发者工具等** | 跑小程序时需要对应 IDE |

## 快速开始

```bash
git clone https://gitee.com/vomeshop/vome-uniapp.git
cd vome-uniapp
bun install
```

`postinstall` 会自动把 tt-shaduni link 到 `src/uni_modules/`（勿手改后强行提交错误软链）。

### 1. 确认后端地址

H5 代理：`src/config/proxy.ts` 默认：

```ts
'/dev/': {
  target: 'http://127.0.0.1:3000',
  // …
}
```

小程序无法走 Vite 代理，请在 `src/config/dev.ts` / `prod.ts` 配置可访问的 Service `host`（真机需公网或局域网 IP），并在小程序后台配置合法 request 域名。

### 2. 启动 H5

先启动 [vome-service](https://gitee.com/vomekj/vome-service)，再：

```bash
bun run dev:h5
```

| 项 | 说明 |
| --- | --- |
| 地址 | [http://localhost:6600](http://localhost:6600) |
| API 前缀 | `/dev` → Service |
| 登录页 | `pages/login/login` |

### 3. 微信小程序（示例）

```bash
bun run dev:mp-weixin
```

用微信开发者工具打开输出目录（一般为 `dist/dev/mp-weixin`），并配置 Service 域名。

### 4. 与后端的对应关系

| UniApp | Service |
| --- | --- |
| 密码登录 / 注册 | `POST /app/user/login/password`、`/register` |
| 验证码 | `/app/user/login/otpCode`、`/otp` |
| 社交列表 / H5 SSO | `/app/user/login/socialProviders` + Better Auth |
| 微信小程序登录 | `POST /app/user/login/mini`（`uni.login` 换 `code`） |
| 用户资料 | `service.user.*`（EPS） |
| Socket | Service Socket.IO（可选 Redis Adapter） |

社交 / 小程序能力需在 Service `src/config` 中配置对应密钥与 AppId。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `bun run dev:h5` | H5 开发（端口 **6600**） |
| `bun run build:h5` | H5 生产构建 |
| `bun run dev:mp-weixin` | 微信小程序开发 |
| `bun run build:mp-weixin` | 微信小程序构建 |
| `bun run type-check` | `vue-tsc` |
| `dev:mp-*` / `build:mp-*` | 其它小程序平台（见 `package.json`） |

## 端口对照

| 端 | 端口 |
| --- | --- |
| Service | 3000 |
| Admin | 9000 |
| Web | 9900 |
| **UniApp H5** | **6600** |

## 与 Web 的差异

| 项 | UniApp | Web |
| --- | --- | --- |
| 路由 | `pages.json` | vue-router glob |
| UI | tt-shaduni | shadcn-vue |
| Socket | `@wu-xj/uni-socket.io` | `socket.io-client` |
| 存储前缀 | `vome_uni_*` | `vome_web_*` |
| 小程序登录 | `/app/user/login/mini` | 无（浏览器 SSO） |

## 目录结构

```text
vome-uniapp/
├── src/
│   ├── pages/
│   │   ├── tabBar/            # Tab 壳 + home / discover / message / mine
│   │   └── login/login.vue
│   ├── windows/               # 宽屏顶栏等
│   ├── components/            # vm-ri-icon、vm-app-tabbar…
│   ├── api/client.ts          # request、Token、bootEps、service
│   ├── lib/auth-client.ts     # Better Auth（H5）
│   ├── stores/                # user / theme / app
│   ├── utils/                 # storage、route-auth、socket…
│   ├── config/                # index / proxy / dev / prod
│   ├── styles/
│   ├── uni_modules/tt-shaduni/  # postinstall 生成，勿手改提交
│   ├── pages.json
│   ├── manifest.json
│   └── main.ts
├── scripts/link-tt-shaduni.mjs
├── typings/
└── package.json
```

## 启动流程（简述）

1. `bootEps()` → App 侧 EPS  
2. 路由鉴权（token / 刷新）  
3. 有 token 时 `connectWs()`  
4. 移动 / 宽屏双布局（Tab + `topWindow`）  

## 新增页面

1. 在 `src/pages/` 下建页面，并在 `pages.json` 注册  
2. Tab 页放在 `pages/tabBar/` 并维护 tab 配置  
3. 调后端优先用 EPS：`api/client` 导出的 `service`  

## 配置说明

配置在 `src/config/`：

| 文件 | 用途 |
| --- | --- |
| `index.ts` | 应用名、合并 host / baseUrl |
| `proxy.ts` | H5 Vite 代理到 Service |
| `dev.ts` / `prod.ts` | 环境 host、baseUrl（小程序直连） |

## 相关项目

| 项目 | 说明 |
| --- | --- |
| [vome-service](https://gitee.com/vomekj/vome-service) | Bun + Elysia 后端（必配） |
| [vome-web](https://gitee.com/vomekj/vome-web) | C 端 Web（同 App 侧） |
| [vome-admin](https://gitee.com/vomekj/vome-admin) | 管理后台 |
| [vome-core](https://www.npmjs.com/package/vome-core) | EPS 与共享客户端 |

## 贡献

1. Fork 本仓库  
2. 新建分支 `feat/xxx`  
3. 提交并推送  
4. 发起 Pull Request / Merge Request  

Issue / PR 欢迎中英文。

## 许可证

[MIT](./LICENSE) © VomeShop / 威迈科技

---

若本仓库对你有帮助，欢迎 Star ⭐
