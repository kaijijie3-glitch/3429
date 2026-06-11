import express from 'express';
import cors from 'cors';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, '..', 'database.json');
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// 邮件发送配置
const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'g2814028282@qq.com', // 发件邮箱账号
    pass: 'YOUR_EMAIL_AUTH_CODE', // 请替换为真实的 QQ 邮箱 SMTP 授权码
  },
});

// 发送邮件的辅助函数
const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: '"报价系统" <g2814028282@qq.com>', // 发件人
      to: to, // 收件人
      subject: subject, // 邮件标题
      text: text, // 邮件纯文本内容
      // html: "<b>或者使用 HTML 格式的邮件内容</b>",
    });
    console.log('邮件发送成功: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('邮件发送失败:', error);
    return false;
  }
};

// Create upload directory if not exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('只允许上传图片或PDF文件'));
  }
});

// Simple JSON database
const loadDB = () => {
  if (fs.existsSync(DB_FILE)) {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
  return { users: [], orders: [], subOrders: [], nextUserId: 1, nextOrderId: 1, nextSubOrderId: 1 };
};

const saveDB = (db) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};

let db = loadDB();

// Initialize default users
const initUsers = () => {
  // Create admin kane
  if (!db.users.find(u => u.username === 'kane')) {
    const hashedPassword = bcrypt.hashSync('342922202', 10);
    db.users.push({ 
      id: db.nextUserId++, 
      username: 'kane', 
      password: hashedPassword, 
      role: 'admin', 
      created_at: new Date().toISOString() 
    });
    console.log('Admin user created: kane / 342922202');
  }
  
  // Remove test users if they exist
  // db.users = db.users.filter(u => u.username !== 'admin' && u.username !== 'client1');
  
  saveDB(db);
};
initUsers();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(session({
  secret: 'quote-system-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Generate order number
const generateOrderNo = (orderId) => {
  const date = new Date();
  const dateStr = date.getFullYear().toString() + 
                  (date.getMonth() + 1).toString().padStart(2, '0') + 
                  date.getDate().toString().padStart(2, '0');
  const sequential = orderId.toString().padStart(4, '0');
  return `ORD${dateStr}${sequential}`;
};

const generateSubOrderNo = (subOrderId) => {
  const date = new Date();
  const dateStr = date.getFullYear().toString() + 
                  (date.getMonth() + 1).toString().padStart(2, '0') + 
                  date.getDate().toString().padStart(2, '0');
  const sequential = subOrderId.toString().padStart(4, '0');
  return `SUB${dateStr}${sequential}`;
};

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '请先登录' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '请先登录' });
  }
  const user = db.users.find(u => u.id === req.session.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: '权限不足' });
  }
  next();
};

const requireStaffOrAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '请先登录' });
  }
  const user = db.users.find(u => u.id === req.session.userId);
  if (!user || !['admin', 'goods_handler', 'logistics_handler'].includes(user.role)) {
    return res.status(403).json({ error: '权限不足' });
  }
  next();
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role;

  res.json({
    id: user.id,
    username: user.username,
    role: user.role
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '未登录' });
  }
  const user = db.users.find(u => u.id === req.session.userId);
  if (!user) {
    return res.status(401).json({ error: '未登录' });
  }
  res.json({ id: user.id, username: user.username, role: user.role });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: '请填写用户名、邮箱和密码' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: '用户名至少需要3个字符' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少需要6个字符' });
  }

  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: db.nextUserId++,
    username,
    email,
    password: hashedPassword,
    role: 'client',
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDB(db);

  // --- 发送注册成功欢迎邮件 ---
  sendEmail(
    email,
    `【注册成功】欢迎加入报价系统`,
    `亲爱的 ${username}：\n\n您已成功注册报价系统客户账号！\n您的登录账号为：${username}\n\n您现在可以登录系统并随时提交您的报价订单了。`
  );

  res.json({
    id: newUser.id,
    username: newUser.username,
    role: newUser.role
  });
});

// File upload route
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择要上传的图片' });
  }
  res.json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    originalname: req.file.originalname
  });
});

// Staff management routes
app.get('/api/staff', requireAdmin, (req, res) => {
  const staff = db.users
    .filter(u => ['goods_handler', 'logistics_handler'].includes(u.role))
    .map(u => ({ 
      id: u.id, 
      username: u.username, 
      email: u.email,
      role: u.role, 
      created_at: u.created_at 
    }));
  res.json(staff);
});

app.post('/api/staff', requireAdmin, (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: '请填写完整信息' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: '用户名至少需要3个字符' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少需要6个字符' });
  }

  if (!['goods_handler', 'logistics_handler'].includes(role)) {
    return res.status(400).json({ error: '无效的角色' });
  }

  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: db.nextUserId++,
    username,
    email,
    password: hashedPassword,
    role,
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDB(db);

  res.json({
    id: newUser.id,
    username: newUser.username,
    role: newUser.role
  });
});

app.delete('/api/staff/:id', requireAdmin, (req, res) => {
  const staffId = parseInt(req.params.id);
  const staffIndex = db.users.findIndex(u => u.id === staffId);
  
  if (staffIndex === -1) {
    return res.status(404).json({ error: '员工不存在' });
  }

  db.users.splice(staffIndex, 1);
  saveDB(db);
  res.json({ success: true });
});

// Order routes
app.get('/api/orders', requireAuth, (req, res) => {
  const { orderNo, status } = req.query;
  let orders = [...db.orders];

  // Apply filters
  if (orderNo) {
    orders = orders.filter(o => o.orderNo.toLowerCase().includes(orderNo.toLowerCase()));
  }
  if (status) {
    orders = orders.filter(o => o.status === status);
  }

  const currentUser = db.users.find(u => u.id === req.session.userId);

  if (currentUser.role === 'admin') {
    // Admin sees all
    orders = orders.map(o => ({
      ...o,
      client_name: db.users.find(u => u.id === o.client_id)?.username || '未知',
      assigned_to_goods: o.assigned_goods_staff ? db.users.find(u => u.id === o.assigned_goods_staff)?.username : null,
      assigned_to_logistics: o.assigned_logistics_staff ? db.users.find(u => u.id === o.assigned_logistics_staff)?.username : null
    }));
  } else if (currentUser.role === 'client') {
    // Client sees their own
    orders = orders.filter(o => o.client_id === req.session.userId);
  } else if (currentUser.role === 'goods_handler') {
    // Goods staff sees assigned orders, hide client info
    orders = orders.filter(o => o.assigned_goods_staff === req.session.userId);
    orders = orders.map(o => {
      const { client_id, client_name, contactName, phone, address, ...rest } = o;
      return rest;
    });
  } else if (currentUser.role === 'logistics_handler') {
    // Logistics staff sees assigned orders, hide client info
    orders = orders.filter(o => o.assigned_logistics_staff === req.session.userId);
    orders = orders.map(o => {
      const { client_id, client_name, contactName, phone, address, ...rest } = o;
      return rest;
    });
  }

  // Sort by date
  orders = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(orders);
});

app.get('/api/orders/:id', requireAuth, (req, res) => {
  const order = db.orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ error: '订单不存在' });
  }

  const currentUser = db.users.find(u => u.id === req.session.userId);

  // Check permissions
  if (currentUser.role === 'client' && order.client_id !== req.session.userId) {
    return res.status(403).json({ error: '权限不足' });
  }
  if (currentUser.role === 'goods_handler' && order.assigned_goods_staff !== req.session.userId) {
    return res.status(403).json({ error: '权限不足' });
  }
  if (currentUser.role === 'logistics_handler' && order.assigned_logistics_staff !== req.session.userId) {
    return res.status(403).json({ error: '权限不足' });
  }

  const subOrders = db.subOrders.filter(s => s.orderId === order.id);
  let result = { ...order, subOrders };
  
  // Hide client info for staff
  if (['goods_handler', 'logistics_handler'].includes(currentUser.role)) {
    const { client_id, client_name, contactName, phone, address, ...safeOrder } = result;
    result = safeOrder;
  } else {
    result.client_name = db.users.find(u => u.id === order.client_id)?.username || '未知';
  }

  res.json(result);
});

app.post('/api/orders', requireAuth, (req, res) => {
  if (req.session.role !== 'client') {
    return res.status(403).json({ error: '只有客户可以创建订单' });
  }

  const { orderName, orderDesc, subOrders, contactName, phone, address } = req.body;

  if (!orderName || !subOrders || subOrders.length === 0) {
    return res.status(400).json({ error: '请填写订单名称和至少一个子订单' });
  }

  const orderNo = generateOrderNo(db.nextOrderId);
  const newOrder = {
    id: db.nextOrderId++,
    orderNo,
    client_id: req.session.userId,
    orderName,
    orderDesc: orderDesc || '',
    contactName: contactName || '',
    phone: phone || '',
    address: address || '',
    status: 'pending',
    assigned_goods_staff: null,
    assigned_logistics_staff: null,
    goods_images: [],
    logistics_images: [],
    tracking_number: '',
    created_at: new Date().toISOString(),
    quoted_at: null
  };

  db.orders.push(newOrder);

  const createdSubOrders = subOrders.map(sub => {
    const subOrderNo = generateSubOrderNo(db.nextSubOrderId);
    const subOrder = {
      id: db.nextSubOrderId++,
      subOrderNo,
      orderId: newOrder.id,
      productName: sub.productName,
      productDesc: sub.productDesc || '',
      image: sub.image || '',
      sizes: sub.sizes,
      quotes: null,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    db.subOrders.push(subOrder);
    return subOrder;
  });

  saveDB(db);
  
  // --- 发送新订单提醒给所有管理员 ---
  const admins = db.users.filter(u => u.role === 'admin' && u.email);
  admins.forEach(admin => {
    sendEmail(
      admin.email, 
      `【新订单通知】收到新订单：${orderName}`, 
      `您有新的待报价订单：
订单号：${orderNo}
货品名称：${orderName}
客户联系人：${contactName}
电话：${phone}

请尽快登录系统进行报价处理。`
    );
  });

  res.json({ ...newOrder, subOrders: createdSubOrders });
});

app.put('/api/orders/:id/quote', requireStaffOrAdmin, (req, res) => {
  const order = db.orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ error: '订单不存在' });
  }
  
  const currentUser = db.users.find(u => u.id === req.session.userId);
  
  // 权限检查：如果员工被分配了，或者是admin
  if (currentUser.role === 'goods_handler' && order.assigned_goods_staff !== req.session.userId) {
    return res.status(403).json({ error: '权限不足' });
  }
  if (currentUser.role === 'logistics_handler' && order.assigned_logistics_staff !== req.session.userId) {
    return res.status(403).json({ error: '权限不足' });
  }
  if (order.status !== 'pending') {
    return res.status(400).json({ error: '只能对待报价订单进行报价' });
  }

  const { subOrderQuotes } = req.body;
  if (!subOrderQuotes || subOrderQuotes.length === 0) {
    return res.status(400).json({ error: '请填写子订单报价信息' });
  }

  subOrderQuotes.forEach(sq => {
    const subOrder = db.subOrders.find(s => s.id === sq.subOrderId);
    if (subOrder) {
      subOrder.quotes = sq.quotes;
      subOrder.status = 'quoted';
    }
  });

  order.status = 'quoted';
  order.quoted_at = new Date().toISOString();
  saveDB(db);

  const client = db.users.find(u => u.id === order.client_id);
  const client_name = client?.username || '未知';
  const subOrders = db.subOrders.filter(s => s.orderId === order.id);
  
  // --- 发送报价完成邮件提醒 ---
  if (client && client.email) {
    sendEmail(
      client.email, 
      `【报价完成通知】订单 ${order.orderNo} 已报价`, 
      `亲爱的 ${client_name}：\n\n您的订单 ${order.orderNo} 已经完成报价，请登录系统查看详情。`
    );
  }

  let result = { ...order, subOrders };
  
  // 隐藏客户信息
  if (['goods_handler', 'logistics_handler'].includes(currentUser.role)) {
    const { client_id, client_name: cn, contactName, phone, address, ...safeOrder } = result;
    result = safeOrder;
  } else {
    result.client_name = client_name;
  }

  res.json(result);
});

app.put('/api/orders/:id/assign', requireAdmin, (req, res) => {
  const order = db.orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ error: '订单不存在' });
  }

  const { goods_staff_id, logistics_staff_id } = req.body;
  
  if (goods_staff_id !== undefined) {
    if (goods_staff_id === null) {
      order.assigned_goods_staff = null;
    } else {
      const staff = db.users.find(u => u.id === goods_staff_id && u.role === 'goods_handler');
      if (staff) {
        order.assigned_goods_staff = goods_staff_id;
        
        // --- 发送分配提醒给货物处理员 ---
        if (staff.email) {
          sendEmail(
            staff.email,
            `【新任务通知】您被分配了新订单 ${order.orderNo}`,
            `您好，${staff.username}：\n\n您被分配了处理订单 ${order.orderNo} 的货物任务，请登录系统查看详情。`
          );
        }
      }
    }
  }
  
  if (logistics_staff_id !== undefined) {
    if (logistics_staff_id === null) {
      order.assigned_logistics_staff = null;
    } else {
      const staff = db.users.find(u => u.id === logistics_staff_id && u.role === 'logistics_handler');
      if (staff) {
        order.assigned_logistics_staff = logistics_staff_id;
        
        // --- 发送分配提醒给物流处理员 ---
        if (staff.email) {
          sendEmail(
            staff.email,
            `【新任务通知】您被分配了新订单 ${order.orderNo}`,
            `您好，${staff.username}：\n\n您被分配了处理订单 ${order.orderNo} 的物流任务，请登录系统查看详情。`
          );
        }
      }
    }
  }

  saveDB(db);
  const client_name = db.users.find(u => u.id === order.client_id)?.username || '未知';
  const subOrders = db.subOrders.filter(s => s.orderId === order.id);
  res.json({ ...order, client_name, subOrders });
});

app.post('/api/orders/:id/goods-images', requireAuth, (req, res) => {
  const currentUser = db.users.find(u => u.id === req.session.userId);
  if (currentUser.role !== 'admin' && currentUser.role !== 'goods_handler') {
    return res.status(403).json({ error: '权限不足' });
  }

  const order = db.orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ error: '订单不存在' });
  }

  if (currentUser.role === 'goods_handler' && order.assigned_goods_staff !== req.session.userId) {
    return res.status(403).json({ error: '权限不足' });
  }

  const { images } = req.body;
  if (!Array.isArray(images)) {
    return res.status(400).json({ error: '无效的图片格式' });
  }

  if (!order.goods_images) {
    order.goods_images = [];
  }
  order.goods_images = [...order.goods_images, ...images];
  
  saveDB(db);
  const subOrders = db.subOrders.filter(s => s.orderId === order.id);
  const client_name = db.users.find(u => u.id === order.client_id)?.username || '未知';
  res.json({ ...order, client_name, subOrders });
});

app.post('/api/orders/:id/logistics', requireAuth, (req, res) => {
  const currentUser = db.users.find(u => u.id === req.session.userId);
  if (currentUser.role !== 'admin' && currentUser.role !== 'logistics_handler') {
    return res.status(403).json({ error: '权限不足' });
  }

  const order = db.orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ error: '订单不存在' });
  }

  if (currentUser.role === 'logistics_handler' && order.assigned_logistics_staff !== req.session.userId) {
    return res.status(403).json({ error: '权限不足' });
  }

  const { tracking_number, images } = req.body;
  
  if (tracking_number !== undefined) {
    order.tracking_number = tracking_number;
  }
  
  if (Array.isArray(images)) {
    if (!order.logistics_images) {
      order.logistics_images = [];
    }
    order.logistics_images = [...order.logistics_images, ...images];
  }
  
  saveDB(db);
  const subOrders = db.subOrders.filter(s => s.orderId === order.id);
  const client_name = db.users.find(u => u.id === order.client_id)?.username || '未知';
  res.json({ ...order, client_name, subOrders });
});

app.put('/api/orders/:id/cancel', requireAuth, (req, res) => {
  const order = db.orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ error: '订单不存在' });
  }

  const currentUser = db.users.find(u => u.id === req.session.userId);

  if (currentUser.role !== 'admin' && order.client_id !== req.session.userId) {
    return res.status(403).json({ error: '权限不足' });
  }

  if (order.status === 'quoted') {
    return res.status(400).json({ error: '已报价订单无法取消' });
  }

  order.status = 'cancelled';
  const subOrders = db.subOrders.filter(s => s.orderId === order.id);
  subOrders.forEach(s => s.status = 'cancelled');
  saveDB(db);
  res.json({ success: true });
});

// Admin routes
app.get('/api/clients', requireAdmin, (req, res) => {
  const clients = db.users
    .filter(u => u.role === 'client')
    .map(u => {
      // 计算客户的订单数量
      const orderCount = db.orders.filter(o => o.client_id === u.id).length;
      return { 
        id: u.id, 
        username: u.username, 
        email: u.email,
        created_at: u.created_at,
        orderCount
      };
    });
  res.json(clients);
});

// 前端静态文件
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(CLIENT_DIST));

// 所有非 API 请求返回前端页面
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
