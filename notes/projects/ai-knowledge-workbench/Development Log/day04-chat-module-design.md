---
title: Day 04 - Chat Module Design
description: The Chat module adopts a composable + service layered architecture, supporting streaming output, error recovery, and context injection, while maintaining strong engineering maintainability and closely simulating the interaction experience of real-world AI products.
date: 2026-01-22
category: projects
project: ai-knowledge-workbench

---

# Chat 模块设计总结（Chat × Knowledge × Streaming）

## 1. 设计目标

Chat 模块的目标不是实现一个“功能堆叠”的聊天页面，而是**构建一个可扩展、可替换、可讲清楚的 AI 对话核心**，用于承载：

* AI 多轮对话
* 知识库上下文注入（RAG）
* 流式响应（Streaming）
* 稳定的错误与重试机制

该模块被设计为整个系统的**交互核心与价值汇聚点**。

---

## 2. 模块职责与边界

Chat 模块遵循 **“页面展示 / 状态管理 / 服务调用” 分层原则**：

```text
Chat Page (UI)
  ↓
useChat (业务状态与流程)
  ↓
rag.service (AI / RAG 服务抽象)
```

### 各层职责：

* **Chat 页面**

    * 负责 UI 渲染与用户交互
    * 不直接处理业务逻辑
* **useChat composable**

    * 统一管理对话状态（messages / thinking / error）
    * 负责对话流程编排（send → stream → complete）
* **rag.service**

    * 封装 AI / RAG 调用
    * 当前为 mock 实现，后续可无缝替换为真实后端 API

> 通过该分层，Chat 模块在不修改 UI 的情况下即可接入真实模型或后端服务。

---

## 3. Chat × Knowledge 数据流设计

Chat 模块不直接管理知识数据，而是通过 **显式参数传递** 与 Knowledge 模块解耦。

### 数据流简化如下：

```text
Knowledge Page
  └─ selectedKnowledgeIds
        ↓
Chat Page
  └─ 调用 useChat.ask(question, selectedKnowledgeIds)
        ↓
useChat
  └─ 构建 RAG Context
        ↓
rag.service
  └─ 基于上下文生成回答
```

这种设计避免了全局状态污染，使 Chat 可以在不同知识上下文下复用。

---

## 4. Streaming（流式输出）设计

Chat 模块采用 **逐字流式输出** 的方式模拟真实 LLM 响应：

* 在发送问题后，立即插入一条空的 assistant 消息
* streaming 过程中持续 append 内容
* 保证 UI 稳定，不产生消息闪烁或重排

```text
User Message
→ Assistant (empty)
→ Assistant (逐字填充)
→ 完成
```

### 关键设计点：

* streaming 与 UI 解耦，仅更新 message.content
* auto-scroll 保证用户始终看到最新输出
* streaming 失败不会破坏对话时间线

---

## 5. 错误处理与 Retry / Regenerate 语义区分

Chat 模块明确区分了 **Retry** 与 **Regenerate** 两种行为：

| 行为         | 触发条件    | 语义           |
| ---------- | ------- | ------------ |
| Retry      | 上一次请求失败 | 重试失败请求       |
| Regenerate | 上一次请求成功 | 基于同一问题重新生成回答 |

### 实现要点：

* 使用 `lastQuestion` 保存最近一次用户提问
* Retry / Regenerate 均复用 `ask()` 主流程
* 不覆盖历史消息，始终以 append 方式追加 assistant 消息

该设计既符合真实 AI 产品的交互习惯，也避免了复杂的状态回滚逻辑。

---

## 6. 用户体验优化（不增加系统复杂度）

在保持业务逻辑稳定的前提下，Chat 页面补充了高频、低风险的体验增强：

* **User / Assistant 头像与气泡区分**
* **AI 回复一键复制**
* **重新生成回答（Regenerate）**
* **Thinking / Disabled 状态明确**
* **空状态与引导文案**

这些优化均作用于 UI 层，不影响核心数据流与服务接口。

---

## 7. 可扩展性说明

当前 Chat 模块已为后续扩展预留接口：

* rag.service 可替换为真实后端 API
* Knowledge 注入方式可从“显式选择”升级为向量检索
* Regenerate / Retry 可结合模型参数或工具调用扩展

在不重构现有代码的情况下，Chat 模块可自然演进为更复杂的 AI 应用。

---

## 8. 小结

Chat 模块并非单纯的对话页面，而是一个：

* **职责清晰**
* **数据流可解释**
* **体验接近真实 AI 产品**
* **工程结构可扩展**

的 AI 应用核心模块。

---

> Chat 模块采用 composable + service 分层设计，支持流式输出、错误恢复与上下文注入，在保证工程可维护性的前提下，尽量贴近真实 AI 产品的交互体验。
