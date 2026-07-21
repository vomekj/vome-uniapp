# Vome UniApp

[简体中文](./README.md) | English

A multi-platform consumer client built with **Vue 3 + uni-app** (H5, WeChat mini program, and more). It shares the same backend as [vome-service](https://gitee.com/vomekj/vome-service), calling **App-side** APIs (`/app/...`) via EPS (`service.user.*`, etc.). Capabilities align with [vome-web](https://gitee.com/vomekj/vome-web); UI uses **tt-shaduni**.

> Open-sourced by Vome / 威迈科技. Start Vome Service first.

## Features

| Capability | Description |
| --- | --- |
| **Multi-target builds** | H5, WeChat / Alipay and other mini programs (see `package.json`) |
| **App EPS** | `createEps({ side: 'app' })` for typed `service` clients |
| **Auth** | H5: password / register / OTP / Better Auth SSO; WeChat MP: `code` → `/app/user/login/mini` |
| **H5 proxy** | Dev `/dev` → Service |
| **Socket.IO** | `@wu-xj/uni-socket.io` adapter; optional after login |
| **Tab shell** | Home / Discover / Messages / Me; wide-screen header (≥768) |
| **tt-shaduni** | Linked into `uni_modules` via `postinstall` |
| **Theme / Remix Icon** | Light / dark + cross-platform icon component |

## Stack

- [Vue 3](https://vuejs.org) + [uni-app](https://uniapp.dcloud.net.cn) (`@dcloudio/*`)
- [Pinia](https://pinia.vuejs.org)
- [Better Auth](https://www.better-auth.com) (H5 session / social)
- tt-shaduni (UI, postinstall link)
- [vome-core](https://www.npmjs.com/package/vome-core) (EPS / HTTP client)
- Remix Icon
- Package manager: [Bun](https://bun.sh) recommended

## Requirements

| Dependency | Notes |
| --- | --- |
| **Node / Bun** | Install deps and uni CLI |
| **Vome Service** | Must be running (default `http://127.0.0.1:3000`) |
| **WeChat DevTools, etc.** | Required for mini-program targets |

## Quick start

```bash
git clone https://gitee.com/vomeshop/vome-uniapp.git
cd vome-uniapp
bun install
```

`postinstall` links tt-shaduni into `src/uni_modules/` (don’t hand-edit and commit broken symlinks).

### 1. Backend URL

H5 proxy in `src/config/proxy.ts`:

```ts
'/dev/': {
  target: 'http://127.0.0.1:3000',
  // …
}
```

Mini programs cannot use the Vite proxy — set a reachable Service `host` in `src/config/dev.ts` / `prod.ts` (LAN IP or public URL), and whitelist request domains in the mini-program console.

### 2. Run H5

Start [vome-service](https://gitee.com/vomekj/vome-service) first, then:

```bash
bun run dev:h5
```

| Item | Notes |
| --- | --- |
| URL | [http://localhost:6600](http://localhost:6600) |
| API prefix | `/dev` → Service |
| Login | `pages/login/login` |

### 3. WeChat mini program (example)

```bash
bun run dev:mp-weixin
```

Open the output dir (usually `dist/dev/mp-weixin`) in WeChat DevTools and configure Service domains.

### 4. Mapping to the backend

| UniApp | Service |
| --- | --- |
| Password login / register | `POST /app/user/login/password`, `/register` |
| OTP | `/app/user/login/otpCode`, `/otp` |
| Social list / H5 SSO | `/app/user/login/socialProviders` + Better Auth |
| WeChat MP login | `POST /app/user/login/mini` (`uni.login` → `code`) |
| Profile | `service.user.*` (EPS) |
| Socket | Service Socket.IO (optional Redis adapter) |

Configure OAuth / mini-program secrets in Service `src/config`.

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev:h5` | H5 dev (port **6600**) |
| `bun run build:h5` | H5 production build |
| `bun run dev:mp-weixin` | WeChat MP dev |
| `bun run build:mp-weixin` | WeChat MP build |
| `bun run type-check` | `vue-tsc` |
| `dev:mp-*` / `build:mp-*` | Other platforms (see `package.json`) |

## Port map

| App | Port |
| --- | --- |
| Service | 3000 |
| Admin | 9000 |
| Web | 9900 |
| **UniApp H5** | **6600** |

## vs Web

| Item | UniApp | Web |
| --- | --- | --- |
| Routing | `pages.json` | vue-router glob |
| UI | tt-shaduni | shadcn-vue |
| Socket | `@wu-xj/uni-socket.io` | `socket.io-client` |
| Storage prefix | `vome_uni_*` | `vome_web_*` |
| Mini-program login | `/app/user/login/mini` | N/A (browser SSO) |

## Project layout

```text
vome-uniapp/
├── src/
│   ├── pages/
│   │   ├── tabBar/            # Tab shell + home / discover / message / mine
│   │   └── login/login.vue
│   ├── windows/               # Wide-screen header, etc.
│   ├── components/            # vm-ri-icon, vm-app-tabbar…
│   ├── api/client.ts          # request, tokens, bootEps, service
│   ├── lib/auth-client.ts     # Better Auth (H5)
│   ├── stores/                # user / theme / app
│   ├── utils/                 # storage, route-auth, socket…
│   ├── config/                # index / proxy / dev / prod
│   ├── styles/
│   ├── uni_modules/tt-shaduni/  # from postinstall — don’t hand-commit
│   ├── pages.json
│   ├── manifest.json
│   └── main.ts
├── scripts/link-tt-shaduni.mjs
├── typings/
└── package.json
```

## Boot flow (sketch)

1. `bootEps()` → App-side EPS  
2. Route auth (token / refresh)  
3. `connectWs()` when a token exists  
4. Mobile / wide dual layout (Tab + `topWindow`)  

## Adding a page

1. Add a page under `src/pages/` and register it in `pages.json`  
2. Tab pages go under `pages/tabBar/` with tab config updated  
3. Prefer EPS via `service` from `api/client`  

## Configuration

All config lives under `src/config/` :

| File | Purpose |
| --- | --- |
| `index.ts` | App name, host / baseUrl merge |
| `proxy.ts` | H5 Vite proxy to Service |
| `dev.ts` / `prod.ts` | Env host & baseUrl (direct for mini programs) |

## Related projects

| Project | Role |
| --- | --- |
| [vome-service](https://gitee.com/vomekj/vome-service) | Bun + Elysia backend (required) |
| [vome-web](https://gitee.com/vomekj/vome-web) | Consumer Web (same App side) |
| [vome-admin](https://gitee.com/vomekj/vome-admin) | Admin console |
| [vome-core](https://www.npmjs.com/package/vome-core) | EPS & shared client |

## Contributing

1. Fork this repo  
2. Create `feat/xxx`  
3. Commit and push  
4. Open a Pull / Merge Request  

Issues and PRs in Chinese or English are welcome.

## License

[MIT](./LICENSE) © VomeShop / 威迈科技

---

If this project helps you, a Star ⭐ is appreciated.
