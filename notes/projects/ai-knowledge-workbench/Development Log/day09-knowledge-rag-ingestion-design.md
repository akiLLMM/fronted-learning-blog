---
title: Day 09 - Knowledge Module Design Evolution
description: From a CRUD List to a RAG Ingestion Panel
date: 2026-02-08
category: projects
project: ai-knowledge-workbench

---

# Knowledge 模块设计演进：从 CRUD 列表到 RAG Ingestion Panel

> 本文记录了我在构建 **AI 知识工作台（Vue3 + RAG）** 过程中，
> 对 Knowledge 模块的一次重要设计升级：
> **从“简单的知识列表 CRUD”，演进为“RAG 构建过程可感知的知识资产管理面板”。**

---

## 一、背景与问题：为什么“普通列表”不够用？

在项目初期，Knowledge 页面是一个典型的 CRUD 列表：

* 仅展示知识标题
* 标记处理状态（processing / ready）
* 提供“在 Chat 中使用”按钮

这个版本在功能上是**可用的**，但在实际使用和对标真实系统（如 FastGPT）时，我逐渐意识到几个问题：

### 1️⃣ 页面信息密度过低

* 新增了一条“知识”，但页面只反馈一个 title
* 无法感知知识的规模、处理方式、是否参与检索
* 整体观感偏“玩具化”

### 2️⃣ 没有体现 RAG 的核心过程

RAG 系统的关键并不只是“有没有内容”，而在于：

* 是否参与索引（Index）
* 如何分块（Chunking）
* 使用何种 Embedding 模型

而这些信息在原始列表中是**完全不可见的**。

---

## 二、设计目标：让 UI 映射 RAG 构建过程

这次改动我并没有追求“功能复杂”，而是明确了一个设计目标：

> **即使不真正实现 RAG pipeline，也要在 UI 与数据模型中体现对 RAG 构建过程的理解。**

因此我为 Knowledge 模块设定了新的定位：

> **Knowledge = RAG Ingestion / Knowledge Asset Panel**

它不是内容展示页，而是一个**知识资产 + RAG 配置的管理视图**。

---

## 三、字段设计：哪些 RAG 信息值得被用户看到？

从一个标准 RAG ingestion 流程出发：

```
Raw Content
 → Chunking
 → Embedding
 → Indexing
```

我筛选出了**最值得在前端暴露的控制点**：

| 字段             | 对应 RAG 阶段 | 说明         |
| -------------- | --------- | ---------- |
| 是否启用索引         | Indexing  | 决定是否参与检索   |
| 分块大小 / overlap | Chunking  | 文本如何被拆分    |
| Embedding 模型   | Embedding | 向量化策略      |
| 状态             | Pipeline  | 是否可用于 Chat |
| 数据规模           | Feedback  | 内容体量感知     |

这些字段**不要求现在就支持复杂配置**，
但必须在系统抽象中“存在”。

---

## 四、数据模型升级：从 CRUD 到 RAG 感知型

### 原始模型（简化版）

```ts
export interface KnowledgeItem {
  id: string
  title: string
  type: "file" | "text"
  status: "processing" | "ready"
  updatedAt: string
}
```

### 升级后的模型（RAG 感知型）

```ts
export interface KnowledgeItem {
  id: string
  title: string
  type: "file" | "text"

  content?: string

  indexEnabled: boolean
  chunk: {
    size: number
    overlap: number
  }
  embeddingModel: string

  status: "processing" | "ready"
  size?: number
  updatedAt: string
}
```

这个升级的关键不在字段数量，而在于：

> **数据模型已经可以完整映射 RAG ingestion 的关键阶段。**

---

## 五、状态管理设计：为什么改 composable，而不是 service？

在当前阶段，我选择：

* **保留 service 的简洁**
* **将 RAG 抽象集中在 composable 层**

### useKnowledge 的职责定位

* 承载知识资产的生命周期
* 管理 ingestion 状态（processing → ready）
* 持久化数据（localStorage）
* 不模拟 embedding / chunk 的真实计算

这让系统结构非常清晰：

```
UI（Editor / List）
  ↓
useKnowledge（RAG 抽象 + 状态管理）
  ↓
service（数据来源，未来替换）
```

---

## 六、列表布局设计：高信息密度而非卡片化

在 UI 形式上，我刻意**没有使用卡片或分页表格**，而选择了：

> **高信息密度的“双行资产列表”**

### 单条 Knowledge 的信息结构

```
标题 + 状态
Index / Chunk / Embedding
Size / UpdatedAt
[ 使用于 Chat ]
```

这种设计的好处是：

* 信息密度高，但不杂乱
* 非常接近真实后台系统
* 不与 Dashboard 的卡片入口产生冲突

---

## 七、空状态设计：不仅是占位，而是“教学引导”

一个容易被忽视但非常重要的点是**空状态**。

我保留并强化了原有的空状态设计：

* 明确说明 Knowledge 在 RAG 中的作用
* 给出内容书写建议
* 告知 processing → ready 的生命周期
* 提供明确 CTA（新建知识）

空状态在这个模块中承担的是：

> **RAG 概念教育 + 新手引导**

而不是简单的“暂无数据”。

---

## 八、为什么现在不实现完整 RAG pipeline？

这是一个刻意的工程取舍。

当前阶段我选择：

* ❌ 不做真实 embedding / chunk
* ❌ 不对接向量数据库
* ✅ 先把数据模型、UI 结构和系统抽象设计正确

原因很简单：

> **结构正确，比功能完整更重要。**

当未来接入后端 RAG 服务时：

* UI 无需重构
* 数据模型无需推翻
* 只需替换 composable / service 的实现

---

## 九、总结：这次改动真正解决了什么？

这次 Knowledge 模块的改造，让项目发生了三个本质变化：

1. **从 CRUD 页面 → RAG 系统面板**
2. **从“功能展示” → “系统认知表达”**
3. **从学生项目 → 可被工程师理解的设计**
