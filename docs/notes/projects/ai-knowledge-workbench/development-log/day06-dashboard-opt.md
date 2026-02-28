---
title: Day 06 - Dashboard Optimization
description: Transforming the Dashboard from a feature list page into a one-stop entry point for the core RAG workflow.
date: 2026-02-02
category: projects
project: ai-knowledge-workbench

---

# Day 06 - Dashboard 优化：打造 RAG 最小闭环的工程化入口

> 项目：**AI Knowledge Workbench**（Vue 3 + RAG + MCP）
> 定位：面向个人的 AI 知识工作台，强调工程化的 RAG 工作流，而非单一 AI Demo

---

## 背景与目标

在前几天的开发中，我已经完成了 **Login / Knowledge / Chat** 等核心功能模块。但在整体使用体验上，我逐渐意识到一个问题：

> **功能已经存在，但系统“主流程”并不清晰。**

对于一个以 **RAG（Retrieval-Augmented Generation）** 为核心的系统来说，用户（包括面试官）第一次进入时，应该在极短时间内理解：

> **“这个系统的最小闭环是什么？我应该从哪里开始？”**

因此，Day 04 的目标非常明确：

* 把 Dashboard 从「功能列表页」
* 优化为「**RAG 主流程的一站式入口**」

最终希望达到的效果是：

> 打开首页 → 理解 Knowledge → Chat 的关系 → 自然进入使用路径

---

## 优化步骤概览

本次 Dashboard 优化主要分为三个步骤：

1. **结构化卡片设计：可点击、可引导的主流程入口**
2. **引入 Lucide Icons：统一、工程化的图标语言**
3. **一次性 Welcome Overlay：显式但不打扰的主流程引导**

这三个步骤并不是单纯的 UI 美化，而是围绕 **“RAG 最小闭环”** 进行的工程设计。

---

## Step 1：结构化卡片 —— 让“功能”变成“路径”

### 问题

最初的 Dashboard 更接近 README：

* 文字描述偏多
* 缺少清晰的操作入口
* 用户需要自己理解“先做什么、后做什么”

这对于工程工具来说并不友好。

### 设计思路

我将首页的角色重新定义为：

> **系统主流程的可视化入口（Dashboard as Workflow Entry）**

具体做法是：

* 将核心模块拆成 **结构化卡片（Card-based Layout）**
* 每个卡片：

    * 代表一个系统能力
    * 同时也是一个明确的行动入口

### 卡片结构设计

每张卡片都遵循统一结构：

* 模块 Icon
* 模块名称（英文，保持技术语境）
* 简要说明（中文，保证可读性）
* 行动引导（可点击）

示例（简化）：

```vue
<div class="card card-knowledge" @click="goToKnowledge">
  <BookOpen class="icon" />
  <h3>Knowledge Base</h3>
  <p>构建并管理用于 RAG 的知识上下文</p>
  <span class="action">Open Knowledge →</span>
</div>
```

### 这样设计的好处

* **功能即入口**：避免“看得到但不知道怎么用”
* **流程显性化**：Knowledge → Chat 的关系一目了然
* **为后续引导（Overlay）提供锚点**

---

## Step 2：引入 Lucide Icons —— 建立工程化视觉语言

### 为什么不用默认图标？

原有框架自带 Element Plus Icons，虽然稳定，但整体风格偏“通用后台”。

而我的项目定位是：

> **AI / Knowledge / Tooling 型工程产品**

因此我希望图标具备以下特征：

* 风格克制、线性
* 语义清晰（知识 / 对话 / 工具）
* 接近真实工程产品（而非运营后台）

### 选择 Lucide Icons

最终选择了 **Lucide Icons**：

* 线性风格，工程感强
* 图标语义贴合 AI / 数据 / 工具场景
* Vue 3 使用成本低

安装与使用：

```bash
pnpm add lucide-vue-next
```

```ts
import { BookOpen, Bot } from 'lucide-vue-next'
```

```vue
<BookOpen :size="28" />
```

### 设计收益

* 首页卡片的“主视觉”更加明确
* 与侧边栏形成「功能识别 vs 视觉引导」的分工
* 整体气质从“学生项目”向“工程工具”靠拢

---

## Step 3：Welcome Overlay —— 一次性引导 RAG 主流程

### 为什么需要 Overlay？

即使有了结构化卡片，**第一次进入系统的用户仍然需要被明确引导**：

> 这个系统的“正确打开方式”是什么？

但我并不希望：

* 顶部堆一块“新手教程文字”
* 或者每次进入都被强制打断

### 设计原则

Welcome Overlay 的设计遵循四个原则：

1. **只出现一次**（localStorage 控制）
2. **强绑定主流程（Knowledge → Chat）**
3. **引导贴近卡片，而不是居中说教**
4. **随时可跳过，不干扰后续使用**

### 引导文案（AI 工程语气）

我刻意避免教学式文案，而使用“系统流程描述”的方式：

* Step 1（Knowledge 卡片旁）：

> **Ingest and structure your knowledge**

* Step 2（Chat 卡片旁）：

> **Query with AI via retrieval-augmented context**

### WelcomeOverlay 关键实现

Overlay 本身是 **Dashboard 的页面级组件**，是否展示由父组件控制：

```ts
const showWelcome = ref(
  localStorage.getItem('welcome_seen') !== 'true'
)

function closeWelcome() {
  showWelcome.value = false
  localStorage.setItem('welcome_seen', 'true')
}
```

Overlay 内部只负责：

* 高亮真实卡片
* 计算引导文案位置
* 控制 step 切换

示意代码（节选）：

```ts
function highlight(selector: string) {
  const el = document.querySelector(selector)
  if (!el) return

  el.classList.add('welcome-highlight')

  const rect = el.getBoundingClientRect()
  hintStyle.value = {
    top: `${rect.top + rect.height / 2}px`,
    left: `${rect.right + 16}px`,
    transform: 'translateY(-50%)'
  }
}
```

### 这样设计的好处

* **主流程被显式强调，但不破坏布局**
* **Overlay 是一次性的，不增加长期认知负担**
* **设计语义与 RAG 架构一致**

---

## 总结：从功能完成到工程体验

通过这次 Dashboard 优化，我最大的收获并不是“页面更好看了”，而是：

> **我开始从“功能实现”转向“系统使用路径设计”。**

这一版 Dashboard 的价值在于：

* 明确了 **RAG 的最小闭环**
* 让 Knowledge 与 Chat 的关系可感知
* 用工程化方式处理新手引导，而非堆教程

这也是我希望在春招简历中重点展示的一点：

> **不仅能写功能，也能为 AI 系统设计合理的使用体验与工程结构。**
