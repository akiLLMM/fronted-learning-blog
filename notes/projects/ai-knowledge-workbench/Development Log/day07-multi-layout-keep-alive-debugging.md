---
title: Day 07 - Multi-Layout & Keep-Alive Debugging
description: A Complete Debugging and Fix Log for Multi-Layout, Keep-Alive, and TagsView Integration.
date: 2026-02-03
category: projects
project: ai-knowledge-workbench

---

# 多 Layout + keep-alive + TagsView 的一次完整踩坑与修复实录

> ——从「点击不渲染」到「最终稳定架构」

## 背景

在搭建 **AI 知识工作台（Vue 3 + Vue Router + Pinia）** 的过程中，我为系统引入了：

* 多一级模块（Dashboard / Chat / Knowledge / Tasks / MCP）
* 公共 `Layout` 容器
* 标签页（TagsView）
* `keep-alive` 页面缓存
* 标签与缓存状态的 localStorage 持久化

目标是实现一个**接近真实后台系统的体验**：
页面可缓存、可多标签切换、刷新后状态可恢复。

但在这个过程中，我遇到了一连串**非常隐蔽、且相互叠加的问题**。

---

## 问题现象（非常诡异）

最初的现象是：

* 点击侧边栏菜单（Chat / Knowledge / Tasks）
* **右侧页面不渲染**
* 但 **刷新页面后可以正常显示**
* 不报 404、不报 JS 错误
* 行为非常“不稳定”

这是一个**典型的“不是新手 bug，也不是配置错误”的问题**。

---

## 一、第一层排查：路由结构与 404 兜底

### 问题 1：404 误判

最开始，访问 `/chat/index` 会直接命中 404。

原因是：

```ts
{
  path: "/404",
  alias: "/:pathMatch(.*)*"
}
```

这一条 **兜底路由不在 routes 的最后**，
导致合法路径被提前拦截。

✅ **修复原则**

> 带 `pathMatch(.*)` 的 404 路由，**必须放在最后**

---

## 二、第二层排查：多 Layout + 根路径劫持

在拆分 Layout 时，我最初使用了：

```ts
{
  path: "/",
  component: Layout,
  redirect: "/dashboard"
}
```

后来又给 `/chat`、`/knowledge` 等模块各自挂了 `Layout`。

结果是：

* `/` 会作为前缀命中所有路径
* 一个路由切换，**多个 Layout 同时被匹配**
* Layout 被错误复用当 Layout 路由被多个父路径同时匹配时，会导致 Layout 组件嵌套渲染，进而引发多层 router-view、keep-alive 与状态管理错位，最终表现为页面不渲染、跳转异常或只能刷新恢复。

表现出来就是：

> 点击不渲染，刷新才渲染

✅ **修复方案**

将首页改为**独立路径**：

```ts
{
  path: "/dashboard",
  component: Layout,
  children: [...]
}
```

并清理系统中所有对 `/` 的隐式依赖。

---

## 三、第三层排查：`keep-alive` 与组件 name 对齐问题

引入 `TagsView` 后，我使用了：

```vue
<keep-alive :include="tagsViewStore.cachedViews">
  <component :is="Component" />
</keep-alive>
```

但页面切换依然异常。

### 核心原因

> **`keep-alive` 的 include 只认组件的 `name`，
> 而不是路由 path 或 title**

而在 Vue 3 `<script setup>` 中，如果不显式声明：

```ts
defineOptions({ name: "Chat" })
```

那么组件是**没有 name 的**。

最终导致：

* 页面被错误缓存
* 或永远不重新渲染

✅ **统一规范**

| 层级 | 必须一致                      |
| -- | ------------------------- |
| 路由 | `route.name`              |
| 组件 | `defineOptions({ name })` |
| 缓存 | `cachedViews`             |

---

## 四、第四层排查：`router-view` + transition 的 key 问题

即便移除了 `keep-alive`，问题仍然存在。

最终发现关键在于：

```vue
<router-view v-slot="{ Component }">
  <transition>
    <component :is="Component" />
  </transition>
</router-view>
```

### 真正的问题

* `key` 放在了内部组件上
* 而 `router-view` 自身被复用
* Vue 认为 vnode 没变，不重新 mount

✅ **最终稳定写法**

```vue
<router-view v-slot="{ Component }" :key="route.fullPath">
  <transition name="el-fade-in" mode="out-in">
    <component :is="Component" />
  </transition>
</router-view>
```

并使用：

```ts
const route = useRoute()
```

而不是 `$route`（Vue 3 + TS 不支持）。

---

## 五、最后一个隐藏坑：localStorage 的“脏数据复活”

当一切逻辑都修好后，
标签栏里仍然出现了一个**空白标签**：

* 没有标题
* hover 显示路径：`#app`

### 根因

> 在早期路由尚未 ready 时，
> `addVisitedView(route)` 被调用，
> 导致一个非法路由快照被持久化到了 localStorage。

之后每次刷新，这条脏数据都会被恢复。

✅ **解决方式**

1. 清空一次 localStorage
2. 初始化时增加防御性过滤：

```ts
getVisitedViews().filter(
  v => typeof v.path === "string" && v.path.startsWith("/")
)
```

---

## 最终稳定架构总结

经过这次完整排查，我最终得到了一套**稳定、可复用的后台架构规范**：

* 多一级路由可以安全共用 Layout
* `router-view` 必须使用 `route.fullPath` 作为 key
* `keep-alive` 的缓存只基于组件 name
* TagsView 存 `name`，不是 `path`
* 本地持久化必须考虑路由结构演进

---

## 这次踩坑带来的最大收获

这不是一次简单的 bug 修复，而是一次**对 SPA 架构理解的升级**：

> 从“能写页面”，
> 到“能理解路由、缓存、组件生命周期之间的真实关系”。

这套经验，**在真实的中大型后台系统中是必然会遇到的**。

---

## 写给未来的自己

> 当你再次看到“点击不渲染，刷新才渲染”这种问题时，
> 不要只盯着路由表，
> 去看 Layout 是否被复用、
> router-view 的 key 在哪一层、
> keep-alive 是否吞掉了更新。
