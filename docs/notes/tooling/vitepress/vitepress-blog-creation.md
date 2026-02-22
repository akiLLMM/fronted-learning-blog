---
title: Git Tutorial
description: Complete Git Workflow for Personal Projects
date: 2026-01-14
category: tooling

---

# 搭建个人博客：从 0 开始使用 WebStorm + VitePress

本文记录从零开始，使用 **WebStorm + VitePress** 搭建个人博客的完整流程，适合前端新手作为长期学习博客的起点。

---

## Step 1：用 WebStorm 创建项目目录

1. 打开 **WebStorm**
2. 点击 `File → New → Project`
3. 选择 **Empty Project**
4. 项目名填写：`frontend-learning-blog`
5. 选择你平时存放前端项目的路径

> 到这一步，你只是创建了一个**普通文件夹**，还没有任何前端框架或博客功能。

---

## Step 2：打开 WebStorm 的 Terminal（很重要）

打开 WebStorm 内置终端：

- 快捷键：`Alt + F12`
- 或点击底部的 **Terminal**

确认本地 Node 版本（要求 ≥ 18）：

```bash
node -v
```
## Step 3：安装并初始化 VitePress

在 Terminal 中依次执行以下命令：
```bash
npm init -y
npm install -D vitepress
npx vitepress init
```
初始化过程中会出现一些交互式问题，推荐选择如下：

- Where should VitePress initialize the config?
👉 直接回车（默认 docs）
- Use TypeScript for config?
👉 Yes（推荐）
- Add npm scripts?
👉 Yes
- Add VitePress npm scripts to package.json?
👉 Yes

初始化完成后，package.json 中会自动添加以下脚本：
```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}

```
这些脚本用于：
- 本地开发
- 构建静态站点
- 构建后预览

## Step 4：创建博客内容目录（notes）
在项目目录下新建 notes 文件夹，用于存放博客内容。
notes 文件夹下可以继续细分子目录，用于分类不同类型的博客文章，例如：
```text
notes
├─ vue
│  └─ day01-v-if.md
├─ javascript
└─ engineering
```
说明：
- 每一篇博客对应一个 .md 文件
- .md 文件就是你的“输出内容”

在 index.md 中配置文章入口
需要在 index.md 中手动添加文章链接，例如：
```text
- [Vue Day 1：v-if / v-show](./notes/vue/day01-v-if)
```
⚠️ 注意：
- 链接路径 不要加 .md 后缀
- 路径应与文件夹结构保持一致

## Step 5：启动博客页面

在终端运行：
```bash
npm run docs:dev
```
终端会输出一个本地访问地址（如 http://localhost:5173），
在浏览器中打开即可看到博客首页。

## 小结

- WebStorm + VitePress 非常适合搭建学习型个人博客
- 博客的核心是 Markdown 内容，而不是复杂配置
- 所有输出内容都应写在 notes 目录下的 .md 文件中
- 页面是否可见，取决于是否在 index.md 或侧边栏中配置入口 
- 后续可以在此基础上逐步完善侧边栏、样式和部署方案。
