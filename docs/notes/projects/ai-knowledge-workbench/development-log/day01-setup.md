---
title: Day 01 - Project Initialization
description: Environment setup and project structure
date: 2026-01-18
category: projects
project: ai-knowledge-workbench

---


# AI 知识工作台 · Day 1
基于 Vue3 + RAG + MCP 的项目初始化与环境排查

今天是「AI 知识工作台」项目的第一天，主要完成了**开发环境搭建、pnpm 安装问题排查**，以及对模板项目进行第一次「删 + 改」，明确整体页面结构与功能模块。

---

## 一、项目背景

**项目名称**：AI 知识工作台  
**技术方向**：Vue 3 + RAG + MCP  
**目标**：打造一个可以写进春招简历的 AI + 前端综合项目，用于展示工程能力与 AI 应用理解。

---

## 二、问题一：根据 README 安装 pnpm 报错

在按照项目 README 安装依赖时，直接执行 `pnpm i` 报错，无法正常启动项目。  
排查后发现是 **Node / pnpm / corepack 环境未正确配置** 导致。

---

## 三、环境排查与正确配置步骤（Windows）

### 1️⃣ 安装 nvm-windows（Node 版本管理）

下载地址（官方仓库）：
https://github.com/coreybutler/nvm-windows/releases

- 下载 `nvm-setup.exe`
- 安装过程全部使用默认选项
- 安装完成后，**重新打开终端**

---

### 2️⃣ 重新安装 Node（推荐 LTS）

在新的 PowerShell / Terminal 中执行：

```bash
nvm install 20
nvm use 20
node -v
```
确认当前 Node 版本已切换成功。

---

### 3️⃣ 启用 corepack 并激活 pnpm
```bash
corepack enable
corepack prepare pnpm@latest --activate
```
⚠️ ***常见报错与解决方案***

如果在执行 corepack prepare pnpm@latest --activate 时出现权限相关报错，执行：
```bash
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
***该命令的作用***：
允许当前用户执行本地脚本（放行 pnpm 相关脚本权限）。

---

### 4️⃣ 安装依赖并启动项目
```bash
pnpm i
pnpm dev
```

至此，项目可以正常启动。

---

## 四、模板项目的第一次「删 + 改」
在项目成功跑起来之后，对模板工程进行了第一次结构整理，目的是：

- 删除无关内容
- 明确模块边界
- 为后续功能开发打基础

---

### 1️⃣ 删除无用目录

删除模板中自带的示例内容：
```text
demo/
test/
```
避免干扰真实业务结构。

---

### 2️⃣ 修改侧边栏菜单名称

将原有菜单统一调整为更符合产品定位的模块命名：

* **Knowledge Base**（知识库）
* **AI Chat**（RAG 对话）
* **MCP Tools**
* **Tasks / Logs**（任务 / 日志）

同时同步修改首页 **Dashboard** 文案，使其更贴近“AI 知识工作台”的整体定位。

---

## 五、当前页面结构设计（初版）

目前规划的页面目录结构如下：

```text
src/pages/
├─ login/        # 登录 / 权限
├─ knowledge/    # 知识库管理
├─ chat/         # AI 对话（RAG）
├─ mcp/          # MCP 工具
└─ tasks/        # 任务 / 日志
```

该结构为后续：

* 权限控制
* RAG 接入
* MCP 工具扩展
* 任务/日志记录
  预留了扩展空间。

---

## 六、Day 1 小结

* pnpm 报错的根因并不在项目本身，而在 **Node + corepack + 权限配置**
* 使用 nvm 统一管理 Node 版本可以显著降低环境问题成本
* 第一天不急着写功能，先把 **工程结构和命名语义** 理顺非常重要

---

下一步将开始：

* 拆解 Knowledge Base 页面结构
* 明确前端如何承接 RAG 的数据流
