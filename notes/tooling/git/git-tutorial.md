# 个人项目 Git 完整闭环流程（推荐标准版）

---

## 0️⃣ 初始状态（主干干净）

```text
master (或 main)
↑
origin/master
```

要求：

* 本地主干是干净的
* 和远程同步

```bash
git checkout master
git pull
```

---

## 1️⃣ 新建功能分支（从主干出发）

### 场景

> 我要开发一个新功能：login / chat / knowledge

### 操作

```bash
git checkout -b feature/login
```

结果：

```text
master
  \
   feature/login   ← HEAD
```

✅ 分支只在本地
✅ 远程还没有任何变化

---

## 2️⃣ 在功能分支上开发 & 提交

```bash
# 改代码
git add .
git commit -m "feat: implement login form"
```

可以多次 commit（没问题）：

```text
feature/login:
A → B → C
```

---

## 3️⃣ （可选但强烈推荐）合并前整理提交历史

### 目的

* 历史干净
* 面试友好
* 降低冲突概率

### 操作

```bash
git rebase master
# 或
git rebase -i master
```

你可以：

* squash 修修补补的 commit
* 保留“一个完整功能”的提交

---

## 4️⃣ 第一次推送功能分支到远程（只做一次）

### 场景

> 我想备份 / 或之后在别的机器继续写

```bash
git push -u origin feature/login
```

效果：

```text
本地 feature/login ↔ 远程 origin/feature/login
```

以后你只需要：

```bash
git push
git pull
```

---

## 5️⃣ 功能完成 → 合并到主干（关键步骤）

### ① 切回主干

```bash
git checkout master
```

### ② 合并功能分支（本地）

```bash
git merge feature/login
```

此时：

```text
本地 master：✅ 已包含 login 功能
远程 master：❌ 还没变
```

---

## 6️⃣ 推送主干到远程（闭环的最后一步）

```bash
git push origin master
```

现在才是真正的：

```text
master
↑
origin/master
```

🎉 **功能正式进入主干**

---

## 7️⃣ （可选）清理功能分支

### 本地删除

```bash
git branch -d feature/login
```

### 远程删除（可选）

```bash
git push origin --delete feature/login
```

---

# 一张完整 ASCII 流程图（你可以截图保存）

```text
origin/master
      ↑
   master
      |
      | git checkout -b feature/login
      ↓
 feature/login
      |
      | 开发 + commit
      |
      | (可选) git rebase master
      |
      | git push -u origin feature/login
      |
      ↓
   功能完成
      |
      | git checkout master
      | git merge feature/login
      |
      | git push origin master   ← 最容易忘的一步
      ↓
 origin/master（最新）
```

---

# 你可以直接记住的 5 条「不乱 Git 铁律」

1️⃣ **所有开发都在功能分支，不在 master**
2️⃣ **merge 只改本地，不会自动同步远程**
3️⃣ **merge 主干后，一定要 push**
4️⃣ **新分支第一次 push，一定加 `-u`**
5️⃣ **rebase 用在合并前，merge 用在进主干**
