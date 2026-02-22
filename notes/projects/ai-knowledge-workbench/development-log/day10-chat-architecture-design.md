---
title: Day 10 - Chat Architecture Design
description: In the Chat module, a layered architecture is designed to separate the RAG logic, environment adaptation layer, and UI layer.
date: 2026-02-13
category: projects
project: ai-knowledge-workbench

---

# 前端分层架构设计说明

## 一、设计目标

在实现 Chat 模块时，我希望达成以下目标：

* ✅ 支持流式输出（Stream）
* ✅ 支持开发环境 MSW Mock
* ✅ 支持生产环境 Demo（无后端）
* ✅ 未来可以无缝接入真实后端
* ✅ UI 层不感知环境差异

为此，我采用了分层架构设计。

---

# 🧩 二、整体分层结构

```
UI 层
  ↓
Application 层（chat.service）
  ↓
Domain 层（rag.service）
  ↓
Infrastructure 层（API / MSW / Local Mock）
```

---

## 1️⃣ UI Layer（展示层）

位置：

```
src/pages/chat/
```

职责：

* 展示消息
* 调用 chatService
* 逐字拼接流式内容

特点：

* 不关心数据来源
* 不关心 DEV / PROD
* 只依赖统一接口

示例调用方式：

```ts
await chatStream(context, (chunk) => {
  message.value += chunk
})
```

---

## 2️⃣ Application Layer（chat.service.ts）

位置：

```
src/services/chat.service.ts
```

职责：

* 环境判断（DEV / PROD）
* 流式控制
* 调用不同实现

核心代码结构：

```ts
export async function chatStream(context, onChunk) {
  if (import.meta.env.PROD) {
    return localStream(context, onChunk)
  } else {
    return apiStream(context, onChunk)
  }
}
```

特点：

* 环境隔离
* UI 与数据源解耦
* 可扩展为真实后端

---

## 3️⃣ Domain Layer（rag.service.ts）

位置：

```
src/services/rag.service.ts
```

职责：

* 纯 RAG 逻辑
* 输入 context
* 返回 answer

示例：

```ts
export async function askRag(context) {
  return { answer: "..." }
}
```

特点：

* 无环境依赖
* 无网络依赖
* 可独立测试

---

## 4️⃣ Infrastructure Layer（底层实现）

包括：

* fetch API stream
* MSW mock
* 本地模拟流式

示例：

```ts
async function apiStream(...)
async function localStream(...)
```

---

# 🔄 三、环境切换策略

| 环境   | 行为           |
| ---- | ------------ |
| DEV  | MSW 拦截真实 API |
| PROD | 本地 mock 流式输出 |
| 未来   | 替换为真实后端      |

设计原则：

> 环境差异只存在于 Application 层。

UI 层完全不感知。

---

# 🎯 四、为什么这样设计？

## 1️⃣ 单一职责原则（SRP）

* rag.service 只负责生成回答
* chat.service 只负责环境适配
* UI 只负责展示

---

## 2️⃣ 可扩展性

未来接入真实后端时：

只需修改：

```ts
apiStream()
```

UI 不用改。

---

## 3️⃣ 环境隔离

避免：

```ts
if (PROD) { ... }
```

出现在 UI 或业务逻辑中。

---

## 4️⃣ 便于面试表达

我可以清晰说明：

* 如何分层
* 如何抽象
* 如何隔离环境
* 如何设计可扩展架构

---

# 🧠 五、与传统“混写”的区别

如果把所有逻辑写在 Chat.vue：

* 环境判断混在 UI
* mock 与 fetch 混在一起
* 难以扩展
* 难以维护

而分层后：

* 职责清晰
* 扩展简单
* 结构可讲
* 符合工程实践

---

# 🚀 六、未来可扩展方向

* 接入真实 RAG 后端
* 加入 AbortController 支持中断流
* 加入错误重试机制
* 接入角色权限控制

---

> 在 Chat 模块中，我采用了分层架构设计，将 RAG 逻辑、环境适配层和 UI 层分离。开发环境使用 MSW 模拟流式 API，生产环境使用本地 mock，同时保持统一接口，方便未来接入真实后端。

这句话非常加分。

---

# 🧭 七、总结

这次重构的核心收获：

* 从功能实现 → 架构设计
* 从能跑 → 可扩展
* 从 Demo → 工程表达
