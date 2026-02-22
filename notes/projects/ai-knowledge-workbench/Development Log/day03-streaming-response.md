---
title: Day 03 - Streaming Assistant Response Design
description: This section describes the design and implementation of **streaming Assistant responses** in the Chat module, with a focus on **architecture, state management, and evolvability**, rather than specific model integrations.
date: 2026-01-21
category: projects
project: ai-knowledge-workbench

---

# Streaming Assistant Response 设计说明

> 本章节说明 Chat 模块中 **Assistant 流式（Streaming）输出** 的设计与实现方式，重点在于 **工程结构、状态管理以及可演进性**，而非具体模型调用。

---

## 一、为什么要做 Streaming？

在真实的 AI 对话产品中，Assistant 的回复通常不是一次性返回，而是**边生成边输出**。
Streaming 带来的好处包括：

* 提升用户感知速度（降低“等待焦虑”）
* 更贴近真实 LLM（如 GPT / Claude）的交互体验
* 为后续接入 SSE / WebSocket 等真实流式接口打基础

因此，本项目在不接入真实模型的前提下，**先完整实现了 Streaming 的前端工程结构**。

---

## 二、Streaming 的核心设计原则

### 1️⃣ Streaming 是“一条消息的过程”，不是多条消息

在本项目中：

* Streaming **不会新增多条 assistant 消息**
* 而是：

    * 先插入一条空的 assistant 消息
    * 随着生成过程逐步追加内容

这保证了：

* 消息结构干净
* 历史记录稳定
* 后续实现真实 streaming 时无需重构

---

### 2️⃣ Streaming 与 UI 解耦

UI 层 **不关心 streaming 的实现细节**：

* 不关心是一次性返回还是逐字返回
* 只根据 `messages` 的响应式变化自动渲染

所有 streaming 逻辑都封装在 `useChat` 中。

---

### 3️⃣ Thinking / Loading 状态是业务状态

在 streaming 过程中，Chat 会进入 `isThinking` 状态：

* 表示 assistant 正在生成回复
* 贯穿整个 streaming 生命周期
* 无论成功或失败，都会被正确关闭

这保证了状态不会“卡死”。

---

## 三、Streaming 的整体流程

一次完整的 Streaming 对话流程如下：

```
User 提问
  ↓
记录 user 消息
  ↓
插入一条空的 assistant 消息
  ↓
isThinking = true
  ↓
RAG streaming（逐字回调）
  ↓
不断 append 到 assistant.content
  ↓
isThinking = false
```

从 UI 角度看，表现为：

```
User: 问题
Assistant: 回答逐字出现…
```

---

## 四、RAG Streaming 接口设计（Mock）

为了模拟真实 LLM 的流式输出，本项目在 Chat 模块内定义了一个 mock 的 streaming 接口：

```ts
streamRag(context, onChunk)
```

设计特点：

* 不返回完整 answer
* 通过 `onChunk(chunk)` 回调逐步推送内容
* 与真实 SSE / streaming API 的使用方式高度一致

这使得后续替换为真实后端接口时，Chat 逻辑无需改动。

---

## 五、Chat 模块中的 Streaming 实现要点

### 1️⃣ 插入“占位 assistant 消息”

在开始 streaming 前，先插入一条空消息：

```ts
{
  role: "assistant"
  content: ""
}
```

后续所有 streaming 内容，都会 append 到这条消息中。

---

### 2️⃣ 逐字追加内容（响应式更新）

Streaming 回调中只做一件事：

```ts
assistantMessage.content += chunk
```

Vue 的响应式系统会自动触发 UI 更新，从而实现“逐字输出”的效果。

---

### 3️⃣ 使用 `try / finally` 管理 thinking 状态

```ts
isThinking = true
try {
  // streaming
} finally {
  isThinking = false
}
```

确保：

* 出现异常时也能正确退出 thinking 状态
* UI 不会进入不可恢复的中间态

---

## 六、为什么这种 Streaming 设计是可演进的？

### ✅ 易于替换为真实 LLM Streaming

后续只需要：

* 将 `streamRag` 替换为真实 SSE / fetch streaming
* 保持 `onChunk` 回调形式不变

Chat / UI / 状态管理 **无需重构**。

---

### ✅ 不污染消息结构

* 不插入“thinking 消息”
* 不生成多条临时消息
* 所有历史记录都是“真实对话内容”

---

### ✅ 与 Chat × Knowledge 数据流完全兼容

Streaming 只是：

> ChatContext → Answer 的一种“输出方式”

不影响 Knowledge 模块、不影响上下文构建。

---

## 七、阶段性总结

在当前阶段，Chat 模块已经支持：

* 会话（Session）管理
* Thinking / Loading 状态
* Assistant Streaming 输出
* 可替换的 RAG Service 抽象

在不接入真实模型和后端的前提下，**先完成工程结构和数据流验证**，是本项目的重要设计取舍。
