---
title: Day 02 - Chat × Knowledge Data Flow Design
description: This section explains the data flow design and responsibility boundaries between the Chat and Knowledge modules in the AI Knowledge Workbench. It focuses on system decoupling, scalability, and establishing stable interfaces for future RAG and LLM integration.
date: 2026-01-20
category: projects
project: ai-knowledge-workbench

---

# Chat × Knowledge 数据流设计说明

> 本章节用于说明 **AI 知识工作台** 中 Chat 模块与 Knowledge 模块之间的数据流设计与职责划分，重点在于系统解耦、可扩展性以及为后续 RAG / LLM 接入预留稳定接口。

---

## 一、设计背景与目标

在构建 AI 知识工作台时，我刻意没有一开始就接入大模型或后端接口，而是**优先完成系统内部的数据流与模块边界设计**。

本阶段的设计目标是：

* 明确 **Chat 与 Knowledge 的职责边界**
* 保证 **模块之间通过清晰接口协作，而非相互侵入**
* 为后续接入 **RAG / FastAPI / MCP** 提供稳定的演进路径
* 让系统在当前阶段就具备「完整但可替换」的业务闭环

---

## 二、核心设计原则

### 1️⃣ 模块单一职责（Single Responsibility）

* **Knowledge 模块**

    * 管理知识的生命周期
    * 维护知识状态（`processing / ready`）
    * 对外仅暴露“可用知识”的只读视图

* **Chat 模块**

    * 管理会话（Session）
    * 管理消息流（Message）
    * 组织一次完整的提问流程

* **页面层（UI）**

    * 仅负责用户输入与选择
    * 不承载业务规则

---

### 2️⃣ Chat 不拥有 Knowledge，只消费 Knowledge

Chat 模块**不存储完整的 Knowledge 对象**，而是只维护：

* 用户选择的 `knowledgeId`
* 提问时通过依赖注入获取 Knowledge 的只读视图

这种设计可以避免：

* 数据重复
* 状态不同步
* 模块间强耦合

---

### 3️⃣ 显式的中间层：ChatContext

在 Chat 内部引入 **ChatContext** 作为中间数据结构，用于承载一次提问所需的最小信息集合：

* 用户问题
* 被选中的知识的最小引用（id + title）

这使得后续接入 RAG 或 LLM 时，只需要替换最内层实现，而无需改动 Chat 或 Knowledge 的结构。

---

## 三、Chat × Knowledge 数据流总览

下面这张图描述了一次完整提问的核心数据流。

### 系统数据流示意图（Mermaid）

```mermaid
flowchart TD
    UI[Chat Page UI\n(question + knowledge selection)]
    UIState[Page State\nquestion\nselectedKnowledgeIds]

    Knowledge[useKnowledge\nlist\nreadyKnowledge]
    Chat[useChat\nsession\nmessages\nask()]

    Context[ChatContext\nquestion\nknowledge refs]
    AI[Mock AI / RAG / LLM]
    Answer[Assistant Message]

    UI --> UIState
    UIState -->|ask(question, selectedIds)| Chat

    Knowledge -->|readyKnowledge (read-only)| Chat

    Chat --> Context
    Context --> AI
    AI --> Answer
    Answer --> Chat
```

---

## 四、关键数据流说明（逐步）

### Step 1：用户输入与选择（页面层）

* 用户在 Chat 页面中：

    * 输入问题（`question`）
    * 勾选可用知识（`selectedKnowledgeIds`）
* 这些状态**只存在于页面层**，不进入业务模块

---

### Step 2：触发提问（useChat.ask）

页面在点击「提问」时，调用：

```ts
ask(question, selectedKnowledgeIds)
```

此时页面只做“传参”，不做任何业务判断。

---

### Step 3：构建 ChatContext（业务核心）

在 `useChat` 内部：

* 根据 `selectedKnowledgeIds`
* 从注入的 `readyKnowledge` 中筛选出对应知识
* 构建 `ChatContext`

```ts
ChatContext = {
  question,
  knowledge: [{ id, title }]
}
```

这是后续 RAG / Prompt 生成的**唯一入口结构**。

---

### Step 4：生成回复（当前为 mock）

当前阶段：

* 使用 mock 逻辑生成 Assistant Message
* 用于验证完整数据流是否正确

未来阶段：

* 该步骤将被替换为：

    * RAG 服务
    * FastAPI 后端
    * MCP 工具调用

**Chat × Knowledge 的其余结构无需改动。**

---

## 五、为什么这种设计是“可演进的”

### ✅ 模块解耦

* Knowledge 不感知 Chat
* Chat 不感知 Knowledge 的内部实现
* 通过只读依赖完成协作

---

### ✅ 易于替换 AI 能力

后续只需要替换：

```ts
mockAnswer → ragService.ask(context)
```

无需重构页面、会话结构或状态管理。

---

### ✅ 面向真实工程，而非 Demo

这种设计方式更接近真实 AI 应用中的做法，而不是“页面直连模型”的实验性写法。

---

## 六、阶段性总结

在当前阶段，系统已经具备：

* 清晰的模块边界
* 单向、可追踪的数据流
* 可被验证的业务闭环
* 面向 RAG / LLM 的结构预留

在不依赖后端和真实模型的前提下，**先完成系统设计与工程验证**，是本项目的重要设计取舍。
