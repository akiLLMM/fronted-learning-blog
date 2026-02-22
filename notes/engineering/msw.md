# 前端工程化 / AI 项目 mock 数据

---

## 一、MSW 是什么？

**MSW（Mock Service Worker）** 是一个 **API Mock 工具**。

一句话解释👇

> **它通过拦截浏览器里的网络请求（fetch / XHR），在“网络层”返回你定义的假数据，而不是在代码里写死 mock。**

官方定位是：

> API mocking library for browsers and Node.js

---

## 二、为什么不用传统 mock，而用 MSW？

### 1️⃣ 传统 mock 的问题

```ts
if (isDev) {
  return mockData
} else {
  return fetch('/api/chat')
}
```

❌ 缺点：

* 污染业务代码
* mock 和真实 API 行为不一致
* 一到联调就要删 mock
* 不利于测试 / RAG / 流式接口模拟

---

### 2️⃣ MSW 的核心优势

| 能力           | 说明                         |
| ------------ | -------------------------- |
| 🌐 拦截真实请求    | 不改业务代码                     |
| 🧠 mock 在网络层 | fetch / axios 都能拦          |
| 🔁 切换零成本     | mock / real API 一行开关       |
| 🧪 测试友好      | Jest / Vitest / Playwright |
| 🚀 支持流式      | 非常适合 AI / Chat 场景          |

👉 **这点于做 AI 知识工作台特别重要**
可以 mock：

* `/api/chat`
* `/api/knowledge/search`
* `/api/rag/stream`

---

## 三、MSW 的工作原理（很关键）

> MSW 在浏览器里注册了一个 **Service Worker**
> 所有请求先经过它 → 决定：

* 返回 mock 数据
* 还是放行给真实后端

```text
你的前端代码
   ↓ fetch('/api/chat')
Service Worker (MSW)
   ↓
返回 mock response（你写的）
```

📌 所以它是 **“假后端”，但是真请求流程**

---

## 四、安装 MSW（Vue / Vite 项目）

### 1️⃣ 安装依赖

```bash
pnpm add -D msw
# 或
npm install -D msw
```

> MSW 只在开发 / 测试用，一般是 devDependency

---

### 2️⃣ 初始化 Service Worker（很重要）

```bash
npx msw init public/ --save
```

执行后会生成：

```text
public/
└── mockServiceWorker.js
```

📌 **这个文件必须能被浏览器访问到**

* Vite 默认会把 `public/` 原样拷贝
* 不要手动改它

---

## 五、基础目录结构（推荐）

```text
src/
├─ mocks/
│  ├─ handlers.ts      # 定义 mock 接口
│  ├─ browser.ts       # 浏览器入口
│  └─ index.ts         # 启动逻辑
├─ main.ts
```

---

## 六、写第一个 mock 接口

### 1️⃣ handlers.ts

```ts
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/knowledge/list', () => {
    return HttpResponse.json([
      { id: '1', title: 'Vue 3 响应式原理', status: 'ready' },
      { id: '2', title: 'RAG 基础概念', status: 'processing' }
    ])
  }),

  http.post('/api/chat', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      role: 'assistant',
      content: `你刚刚问的是：${body.prompt}`
    })
  })
]
```

📌 注意：

* 路径写 **真实 API 路径**
* 将来接真后端不用改一行代码

---

### 2️⃣ browser.ts

```ts
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

---

### 3️⃣ index.ts（启动）

```ts
// src/mocks/index.ts
import { worker } from './browser'

export async function startMock() {
  return worker.start({
    onUnhandledRequest: 'bypass' // 未 mock 的请求直接放行
  })
}
```

---

## 七、在 main.ts 启动 MSW

```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { startMock } = await import('./mocks')
    await startMock()
  }

  createApp(App).mount('#app')
}

bootstrap()
```

🎯 效果：

* 开发环境自动启用 mock
* 生产环境完全不影响

---

## 八、在 AI 知识工作台里，MSW 的正确用法

结合当前的项目 👇

### ✅ 非常适合 mock 的模块

* `rag.service.ts`
* `chat.service.ts`
* `knowledge.service.ts`

比如：

```ts
// rag.service.ts
export function chat(prompt: string) {
  return fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  })
}
```

👆 **不改一行代码**
MSW 在下面拦住它。

---

### 🚀 进阶

* mock **streaming response**
* mock **错误状态**
* mock **loading / delay**

```ts
http.get('/api/chat', async () => {
  await delay(1000)
  return HttpResponse.json({ ... })
})
```

---

## 九、总结

> **MSW 是一个在网络层拦截请求的 mock 工具，通过 Service Worker 实现，不侵入业务代码，非常适合前端独立开发、测试以及 AI/RAG 场景下的接口模拟。**
