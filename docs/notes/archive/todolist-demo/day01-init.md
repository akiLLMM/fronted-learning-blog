---
title: Project Initialization and Engineering Structure
description: This article documents the complete process of creating the vue-todos beginner project using Vite + Vue, and summarizes a common issue encountered during the initialization process.
date: 2026-01-15
category: archive

---
# Vue Todos 项目 · Day 1：项目初始化与工程结构

本文记录使用 **Vite + Vue** 创建 `vue-todos` 新手入门项目的完整流程，并整理了在初始化过程中遇到的一个常见坑点。

---

## Step 1：创建项目目录

首先在本地创建一个用于存放前端项目的目录：
```text
vueTODOs
```
该目录作为所有前端练习项目的统一入口。

## Step 2：使用 WebStorm 打开项目

使用 WebStorm 打开刚创建的 **vueTODOs** 目录，后续所有操作均在该目录下完成。

## Step 3：通过 Vite 创建 Vue 项目

在 WebProject 路径下，打开 WebStorm 内置终端，执行以下命令：
```bash
npm create vite@latest vue-todos
```
创建过程示例如下：
![Vite 初始化命令](images/vite_create_step.jpg)


## Step 4：选择框架与变体

执行后，会依次出现交互式选项。在交互式命令行中，选择配置如下：

- Framework：Vue
- Variant：根据需要选择（如 JavaScript / TypeScript）
- Bundler：rolldown-vite
- Install dependencies：Yes

配置选择界面示例：
![Vite 初始化交互式选项](images/framework_etc_options.jpg)

## Step 5：查看项目目录结构

项目创建完成后，进入 vue-todos 目录：
```bash
cd vue-todos
```
此时 src 目录结构如下：
![Vue项目初始结构](./images/project_%20directory_structure.jpg)

该结构是一个标准的 Vue + Vite 项目初始结构，后续所有 Todo 功能都会在此基础上逐步扩展。

## 坑点记录 ⚠️

### 问题描述
在创建项目时，如果使用下面这条命令：
```bash
npm create rolldown-vite@latest vue-todos
```
很容易出现问题：

- 不会弹出 framework（框架）选择界面
- 默认创建的不是 Vue 项目
- 默认 framework 为 vanilla

### 问题原因
rolldown-vite 模板与 vite@latest 的交互行为不同，
直接使用该命令时，不会提供完整的框架选择流程。

### 解决方案

✅ 推荐始终使用以下命令创建项目：
```bash
npm create vite@latest vue-todos
```

然后在交互过程中手动选择：

- Framework：Vue
- Bundler：rolldown-vite

这样可以避免创建到非 Vue 项目的问题。

### 小结

- 使用 npm create vite@latest 是创建 Vue 项目的最稳妥方式
- rolldown-vite 应通过交互选项选择，而不是直接作为 create 命令使用
- 项目初始化阶段的选择，会直接影响后续开发体验

后续将基于该项目逐步实现 Todo 列表渲染、组件拆分与状态管理功能。
