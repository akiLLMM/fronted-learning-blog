---
title: Day 08 - Vite HMR Exception Debugging
description: A Full Postmortem of a Vue Internal Exception Triggered by Vite HMR —— Investigating invalidateTypeCache.
date: 2026-02-05
category: projects
project: ai-knowledge-workbench

---
# 一次由 Vite HMR 引发的 Vue 内部异常排查：`invalidateTypeCache` 的完整复盘

> **关键词**：Vue 3 · Vite · HMR · plugin-vue · 工具链排错
---

## 一、问题现象

在 Vue 3 + Vite 的开发环境中，项目会**不定期报错**：

```text
Cannot read properties of null (reading 'invalidateTypeCache')
```

典型表现包括：

* 仅在 `pnpm dev` / `vite dev` 下出现
* 页面功能大多数时候是正常的
* 偶尔在启动、文件变更或 HMR 触发时闪出错误
* 错误有时会“自己消失”
* `pnpm build` / `preview` **完全不会复现**

---

## 二、一个重要澄清：这不是业务 Bug

在排查初期，这个错误**非常容易被误判**为：

* keep-alive 生命周期问题
* router-view / Layout 渲染问题
* 动态路由或登录跳转问题

但实际上：

> **`invalidateTypeCache` 与页面逻辑、路由结构、登录流程没有直接关系。**

即使你把：

* 路由改成最简单结构
* 去掉 keep-alive
* 只保留一个空页面

在某些情况下，这个错误仍然会出现。

---

## 三、关键转折：查看完整调用栈（Stack Trace）

真正的突破来自于**查看错误调用栈，而不是继续改业务代码**。

### 关键堆栈信息（简化）

```text
Cannot read properties of null (reading 'invalidateTypeCache')
at BasicMinimalPluginContext.handleHotUpdate
at handleHMRUpdate (@vitejs/plugin-vue)
at onHMRUpdate
at FSWatcher.<anonymous>
```

从堆栈可以明确看出：

* ❌ 错误不是发生在 Vue 组件 render
* ❌ 不是发生在路由切换
* ❌ 不是发生在 keep-alive 生命周期
* ✅ 发生在 **Vite 的 HMR（热更新）阶段**
* ✅ 来源是 **@vitejs/plugin-vue 内部逻辑**

👉 这意味着：
**问题已经从“业务层”转移到了“工具链层”。**

---

## 四、真正的根因：`.d.ts` 文件触发了错误的 HMR 流程

### 1️⃣ 项目中使用的插件特征

项目中使用了多个**自动生成类型声明文件**的插件，例如：

* `unplugin-auto-import`
* `unplugin-vue-components`
* 自定义 SVG 组件生成插件（开启 `dts`）

这些插件的共同点是：

* 在 **dev 模式运行期间**
* 会持续或按需写入 `.d.ts` 文件
* `.d.ts` 文件位于项目目录中

---

### 2️⃣ Vite 的默认行为

Vite dev server：

* 会使用 **FSWatcher 监听整个项目目录**
* 任意文件变更都会触发 HMR 流程

于是出现了下面的情况：

```text
插件写入 .d.ts 文件
↓
Vite 监听到文件变化
↓
@vitejs/plugin-vue 尝试处理 HMR
↓
但这是“类型声明文件”，不是 Vue SFC
↓
内部缓存实例为 null
↓
invalidateTypeCache(null)
↓
💥 报错
```

⚠️ **关键点**：
`.d.ts` 文件并不是 Vue 运行时模块，但却被误纳入了 HMR 处理流程。

---

## 五、为什么回退 Vite / plugin-vue 版本无效？

曾尝试回退到较稳定版本：

```bash
pnpm add -D vite@6.x @vitejs/plugin-vue@5.x
```

但问题依旧存在。

原因是：

> **这不是某一个版本的单点 Bug，而是监听范围设计上的问题。**

只要：

* `.d.ts` 文件仍在监听范围内
* plugin-vue 仍然尝试处理这些变更

就**始终存在触发该异常的可能性**。

---

## 六、最终解决方案（工程级、根治）

### 核心原则

> **类型声明文件（`.d.ts`）是构建产物，不应该参与 HMR。**

---

### 实际修复方式

在 `vite.config.ts` 中，显式忽略类型文件的监听：

```ts
export default defineConfig({
  server: {
    watch: {
      ignored: [
        '**/types/**',
        '**/*.d.ts'
      ]
    },
    hmr: {
      overlay: false // 可选：关闭红色错误遮罩
    }
  }
})
```

同时，将所有自动生成的类型文件**集中到一个目录**（如 `types/`），进一步降低风险。

---

## 七、修复结果

完成上述配置后：

* ❌ `invalidateTypeCache` 错误彻底消失
* ❌ 开发环境不再出现“闪错 / 假死”
* ✅ HMR 正常工作
* ✅ 无需在业务代码中添加额外防御逻辑
* ✅ 原有 Vue / Router / keep-alive 代码可保持简洁

---

## 八、经验总结

### 1️⃣ 不要把所有错误都当成“业务 Bug”

当错误：

* 只在 dev 环境出现
* 调用栈集中在构建工具 / 插件
* 行为不稳定、难以复现

应优先怀疑 **工具链或 HMR**。

---

### 2️⃣ `.d.ts` ≠ 运行时代码

这是本次问题的核心教训：

> **类型声明文件是给 TypeScript 用的，不是给 Vite HMR 用的。**

---

## 九、结语

`invalidateTypeCache` 并不是一个常见错误，但它暴露了一个现实问题：

> 当前端工程复杂到一定程度时，
> **构建工具与插件之间的协作方式，本身就可能成为问题源头。**

理解并正确隔离这些边界，是前端工程化能力的重要组成部分。
