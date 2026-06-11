# 报价系统 - 项目说明文档

## 📋 项目概述
这是一个专业的多角色报价管理系统，支持客户下单、管理员报价、员工处理货物和物流等完整工作流程。

## 🚀 快速启动

### 1. 启动后端服务
```bash
cd server
npm install  # 首次运行需要安装依赖
npm start    # 或 node index.js
```
后端服务运行在：http://localhost:3001

### 2. 启动前端服务
```bash
cd client
npm install  # 首次运行需要安装依赖
npm run dev
```
前端服务运行在：http://localhost:5174

## 👥 用户角色和账号

### 默认管理员账号
- **用户名**：`kane`
- **密码**：`342922202`
- **权限**：最高权限，可管理所有功能

### 其他角色
| 角色 | 权限 |
|------|------|
| 客户 | 创建订单、查看自己的订单 |
| 货物处理员 | 查看分配的订单、上传货物图片 |
| 物流处理员 | 查看分配的订单、录入物流单号、上传面单 |
| 管理员 | 完整权限 |

## 📁 项目结构

```
d:\123456789\
├── client/                  # 前端 (React + Vite)
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ClientDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── StaffDashboard.jsx
│   │   │   ├── StaffManagement.jsx
│   │   │   ├── NewOrder.jsx
│   │   │   ├── OrderList.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   └── QuoteOrder.jsx
│   │   ├── components/Layout.jsx
│   │   ├── contexts/AuthContext.jsx
│   │   └── App.jsx
│   └── package.json
├── server/                  # 后端 (Express)
│   ├── index.js
│   └── package.json
├── uploads/                 # 图片上传目录
├── database.json            # 数据存储文件
└── README.md                # 本文件
```

## 🔧 修改和维护

### 修改管理员账号密码

#### 方法1：重置数据库（推荐最简单）
1. 停止后端服务
2. 删除 `database.json`，或清空内容为：
```json
{"users":[],"orders":[],"subOrders":[],"nextUserId":1,"nextOrderId":1,"nextSubOrderId":1}
```
3. 修改 `server/index.js` 中的初始化代码（约第60-70行）
4. 重启后端服务，会自动创建新的管理员账号

#### 方法2：在服务器代码中修改
编辑 `server/index.js`，找到 `initUsers` 函数，修改用户名和密码：
```javascript
const initUsers = () => {
  if (!db.users.find(u => u.username === '你的新用户名')) {
    const hashedPassword = bcrypt.hashSync('你的新密码', 10);
    db.users.push({ 
      id: db.nextUserId++, 
      username: '你的新用户名', 
      password: hashedPassword, 
      role: 'admin', 
      created_at: new Date().toISOString() 
    });
  }
  saveDB(db);
};
```

### 更换 Trae 账号后继续开发

1. **保持项目文件不变** - 所有代码和数据都在 `d:\123456789\` 目录中
2. **直接启动服务** - 使用上述"快速启动"命令
3. **如果数据库丢失** - 使用方法1重新初始化

### 常见修改参考

#### 修改端口号
- 后端：修改 `server/index.js` 最后一行的端口号（默认3001）
- 前端：在 `vite.config.js` 或启动时指定

#### 添加新的员工角色
1. 在 `server/index.js` 中添加角色验证
2. 在前端 `App.jsx` 和 `Layout.jsx` 中添加导航
3. 创建对应的页面组件

## 💾 数据备份

重要数据位置：
- `database.json` - 所有用户和订单数据
- `uploads/` - 所有上传的图片

定期备份这两个位置即可！

## 📞 技术支持

如有问题，检查：
1. Node.js 版本 >= 16
2. 端口 3001 和 5173 未被占用
3. 依赖是否完整安装（npm install）
