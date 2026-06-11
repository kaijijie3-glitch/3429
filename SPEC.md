# 双用户权限报价系统 - 项目规格

## 1. Concept & Vision

一个轻量级商业报价系统，为客户提供便捷的订单提交入口，为管理员提供高效的订单处理后台。界面简洁专业，操作流畅，数据清晰可见。整体风格偏向商务工具类应用，强调效率和易用性。

## 2. Design Language

### 美学方向
- 参考：企业级SaaS工具风格（如飞书、Notion商务版）
- 简洁、专业、高效，去除不必要的装饰

### 配色方案
- Primary: `#2563EB` (蓝色 - 专业可信)
- Secondary: `#1E40AF` (深蓝 - 强调)
- Accent: `#10B981` (绿色 - 成功/完成)
- Warning: `#F59E0B` (橙色 - 待处理)
- Danger: `#EF4444` (红色 - 危险/取消)
- Background: `#F8FAFC` (浅灰白)
- Surface: `#FFFFFF`
- Text Primary: `#1E293B`
- Text Secondary: `#64748B`
- Border: `#E2E8F0`

### 字体
- 主字体: Inter (英文), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif (中文)
- 代码/数字: JetBrains Mono

### 间距系统
- 基础单位: 4px
- 常用间距: 8px, 12px, 16px, 24px, 32px, 48px

### 动效
- 页面切换: 淡入淡出 200ms ease-out
- 按钮悬停: transform scale(1.02), 150ms
- 表单反馈: 轻微震动或颜色变化
- 列表加载: 逐条淡入 stagger 50ms

## 3. Layout & Structure

### 页面结构

**公共部分**
- 顶部导航栏：Logo、系统名称、当前用户、退出按钮

**客户界面**
- 仪表盘：显示我的订单列表、快速新增订单入口
- 新增订单：货品信息、尺码数量表格、提交按钮
- 订单详情：查看已报价订单详情和报价信息

**管理员界面**
- 仪表盘：今日订单统计、待处理订单提醒
- 订单管理：全部订单列表、筛选功能、录入报价功能
- 客户管理：客户账号管理（查看）

### 响应式策略
- 桌面端(>1024px)：侧边栏导航 + 主内容区
- 移动端(≤768px)：顶部汉堡菜单 + 全宽内容

## 4. Features & Interactions

### 账号系统
- 登录页面：账号密码输入，记住登录状态
- 角色区分：客户(client) / 管理员(admin)
- 登录后根据角色跳转到对应界面

### 客户功能
- **新增订单**
  - 货品名称（文本输入）
  - 货品描述（可选文本）
  - 尺码数量表格：S/M/L/XL/XXL/XXXL 六个尺码，每格输入数量
  - 提交后订单状态变为"待报价"
  - 提交成功提示，清空表单

- **我的订单**
  - 列表展示：订单号、货品名称、提交时间、状态
  - 状态标签：待报价(橙)、已报价(绿)、已取消(灰)
  - 点击查看详情
  - 筛选：全部/待报价/已报价

### 管理员功能
- **订单管理**
  - 列表展示：订单号、客户名、货品名称、提交时间、状态
  - 点击"查看"打开详情
  - 待报价订单显示"录入报价"按钮
  - 录入报价：每个尺码对应的单价输入框
  - 提交报价后订单状态变为"已报价"
  - 可取消订单（状态变为"已取消"）

- **数据导出**
  - 按时间范围筛选订单
  - 导出为CSV格式

### 状态说明
| 状态 | 标签颜色 | 说明 |
|------|---------|------|
| 待报价 | 橙色 | 客户已提交，等待管理员报价 |
| 已报价 | 绿色 | 管理员已录入价格 |
| 已取消 | 灰色 | 订单已取消 |

## 5. Component Inventory

### 按钮
- Primary: 蓝色背景，白色文字
- Secondary: 白色背景，蓝色边框文字
- Danger: 红色背景
- 状态：default / hover(亮度+10%) / active(亮度-10%) / disabled(灰色，opacity 0.5)

### 输入框
- 白色背景，灰色边框
- Focus: 蓝色边框，轻微阴影
- Error: 红色边框，错误提示文字

### 表格
- 表头：浅灰背景，加粗文字
- 行悬停：浅蓝背景
- 斑马纹可选

### 标签/徽章
- 圆角矩形，内边距 4px 8px
- 颜色根据状态变化

### 卡片
- 白色背景，轻微阴影
- 圆角 8px

### 空状态
- 居中图标 + 说明文字
- 如"暂无订单"

## 6. Technical Approach

### 技术栈
- **前端**: React 18 + Vite
- **路由**: React Router v6
- **样式**: Tailwind CSS
- **后端**: Express.js (Node.js)
- **数据库**: SQLite (better-sqlite3)
- **登录认证**: Session-based

### 项目结构
```
/project-root
├── client/          # React前端
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   └── utils/
│   └── index.html
├── server/          # Express后端
│   ├── routes/
│   ├── middleware/
│   ├── db/
│   └── index.js
├── database.sqlite
└── package.json
```

### API设计

**认证**
- POST /api/auth/login - 登录
- POST /api/auth/logout - 登出
- GET /api/auth/me - 获取当前用户

**订单**
- GET /api/orders - 获取订单列表
- POST /api/orders - 创建订单
- GET /api/orders/:id - 获取订单详情
- PUT /api/orders/:id/quote - 管理员录入报价
- PUT /api/orders/:id/cancel - 取消订单

**客户**
- GET /api/clients - 获取客户列表(管理员)

### 数据模型

**users**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| username | TEXT | 用户名 |
| password | TEXT | 密码(加密存储) |
| role | TEXT | client/admin |
| created_at | DATETIME | 创建时间 |

**orders**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| client_id | INTEGER | 客户ID |
| product_name | TEXT | 货品名称 |
| product_desc | TEXT | 货品描述 |
| sizes | TEXT | JSON格式尺码数量 |
| quotes | TEXT | JSON格式报价(管理员填写) |
| status | TEXT | pending/quoted/cancelled |
| created_at | DATETIME | 创建时间 |
| quoted_at | DATETIME | 报价时间 |

### 账号初始化
- 管理员: admin / admin123
- 测试客户: client1 / client123
