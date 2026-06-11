# 🚀 Railway 快速部署指南

## ⏱️ 预计时间：10-15 分钟

## 📋 前提准备

### 1. 注册 GitHub 账号
访问：https://github.com
- 点击 "Sign up" 注册
- 验证邮箱

### 2. 注册 Railway 账号
访问：https://railway.app
- 点击 "Start New Project"
- 选择 "Continue with GitHub"
- 授权 GitHub 登录

---

## 🔧 步骤 1：推送到 GitHub

### 1.1 初始化 Git（在本地项目目录）
在 `d:\123456789\` 目录右键，选择 "Git Bash Here"（如果没有 Git Bash，先安装 Git）

或者直接在 Trae IDE 里打开终端，执行：

```bash
cd d:\123456789
git init
```

### 1.2 配置用户信息（第一次）
```bash
git config user.name "你的GitHub用户名"
git config user.email "你的GitHub邮箱"
```

### 1.3 提交代码
```bash
git add .
git commit -m "first commit"
```

### 1.4 在 GitHub 创建仓库
1. 访问 https://github.com/new
2. 仓库名：`quote-system`（随便起）
3. 选择 Public 或 Private
4. **不要**勾选 "Initialize this repository"
5. 点击 "Create repository"

### 1.5 推送到 GitHub
```bash
# 根据 GitHub 页面上的提示执行，类似：
git remote add origin https://github.com/你的用户名/quote-system.git
git branch -M main
git push -u origin main
```

---

## 🚀 步骤 2：在 Railway 部署

### 2.1 创建新项目
1. 登录 https://railway.app
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 找到你的仓库，点击 "Deploy"

### 2.2 等待部署完成
- 等待 2-5 分钟
- 看到 "Successfully deployed" 就成功了！

### 2.3 获取访问链接
1. 在项目首页，点击 "Settings"
2. 在 "Domains" 部分
3. 点击 "Generate Domain"（免费域名）
4. 或者添加你自己的域名

### 2.4 配置持久化存储（重要！）

**Railway 的文件系统是临时的，重启后会丢失数据！**

所以我们需要配置数据库持久化：

#### 方案 A：使用简单 JSON 文件（适合小项目）
但需要注意：
1. 定期从 Railway 下载 `database.json` 备份
2. 或者改用真实数据库

#### 方案 B：升级到真实数据库（推荐长期使用）
1. 项目首页 → "New Database"
2. 选择 "PostgreSQL"
3. 等待创建
4. 连接数据库（需要修改后端代码）

---

## 🎯 部署后测试

### 1. 访问你的网站
打开 Railway 给你的域名（类似：`https://quote-system-production.up.railway.app`）

### 2. 登录测试
- 用户名：`kane`
- 密码：`342922202`

---

## ⚠️ 重要注意事项

### 1. 数据备份
Railway 的文件存储不是持久化的，建议：
- 定期下载 `database.json` 和 `uploads` 文件夹
- 在 GitHub 建立私有仓库定期备份

### 2. 修改管理员密码
部署后，用 SSH 连接到 Railway 实例：
1. Railway 项目首页 → "Settings"
2. "Environment" → "View Logs"
3. 或者直接在 Railway 的控制台中操作

### 3. 免费额度
Railway 免费额度：
- 每月 $5.00 额度
- 足够小项目使用
- 超出后按使用量付费

---

## 🔧 常见问题

### Q: 部署失败怎么办？
A: 检查 Railway 的 "Logs" 查看错误信息，常见原因：
- Node.js 版本不对
- 依赖安装失败
- 端口配置不对

### Q: 怎么查看日志？
A: Railway 项目首页 → "Deployments" → 选择最新部署 → "View Logs"

### Q: 数据丢失了怎么办？
A: 
1. 尽快备份本地 `database.json`
2. 考虑使用 PostgreSQL 数据库

### Q: 可以用自己的域名吗？
A: 可以！
1. Railway 项目 → "Settings" → "Domains"
2. 添加自定义域名
3. 在域名服务商添加 DNS 记录

### Q: 想换平台部署？
A: 可以！这个项目也支持：
- Vercel（前端）+ Railway（后端）
- Fly.io
- Render
- 传统云服务器

---

## 📚 下一步

1. ✅ 完成部署
2. 🔐 修改默认密码
3. 📱 测试所有功能
4. 💾 设置定期备份
5. 🌐 分享给用户使用

---

## 🆘 需要帮助？

1. 查看 Railway 官方文档：https://docs.railway.app
2. 保留好这个项目的所有文件
3. 记住 GitHub 和 Railway 的账号密码

---

## 🎉 恭喜！

完成这些步骤，你就有了一个可以在互联网上访问的报价系统了！
