# 🚀 部署指南

## 方案一：传统部署（推荐新手）

### 1. 购买云服务器
推荐使用：
- 阿里云 ECS（https://www.aliyun.com）
- 腾讯云 CVM（https://cloud.tencent.com）
- 华为云 ECS（https://www.huaweicloud.com）

**配置要求**：
- CPU: 1核以上
- 内存: 1GB以上
- 系统: Ubuntu 20.04 或 CentOS 7+
- 带宽: 1Mbps以上

### 2. 连接服务器
```bash
# 使用 SSH 连接（Windows 可用 PowerShell 或 Git Bash）
ssh root@你的服务器IP
```

### 3. 安装 Node.js 环境
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node -v
npm -v
```

### 4. 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y nginx

# CentOS
sudo yum install -y nginx
```

### 5. 上传项目到服务器
**方法A：使用 SCP（推荐）**
```bash
# 在本地电脑上执行
scp -r d:\123456789 root@你的服务器IP:/var/www/
```

**方法B：使用 Git**
```bash
# 在服务器上安装 git
sudo apt-get install -y git

# 克隆你的项目（如果你有 Git 仓库）
git clone 你的仓库地址 /var/www/quote-system
```

### 6. 配置后端服务

```bash
# 进入后端目录
cd /var/www/quote-system/server

# 安装依赖
npm install --production

# 设置环境变量（可选）
export PORT=3001
export NODE_ENV=production

# 测试启动
npm start

# 如果正常运行，按 Ctrl+C 停止，使用 PM2 后台运行
```

### 7. 使用 PM2 管理后端
```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
pm2 start npm --name "quote-server" -- start

# 查看状态
pm2 list

# 查看日志
pm2 logs quote-server

# 设置开机自启
pm2 startup
pm2 save
```

### 8. 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/default
```

粘贴以下配置：
```nginx
server {
    listen 80;
    server_name 你的域名或IP;

    # 前端静态文件
    location / {
        root /var/www/quote-system/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件访问
    location /uploads {
        alias /var/www/quote-system/uploads;
        expires 1d;
    }
}
```

```bash
# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 9. 配置 HTTPS（可选但推荐）
```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d 你的域名
```

### 10. 配置防火墙
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 11. 访问测试
打开浏览器访问：`http://你的服务器IP`

---

## 方案二：Docker 部署（适合有 Docker 经验）

### 1. 在服务器安装 Docker
```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. 创建 Dockerfile
在项目根目录创建 `Dockerfile`：

```dockerfile
# 后端
FROM node:18-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production
COPY server .
EXPOSE 3001
CMD ["npm", "start"]
```

在项目根目录创建 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    volumes:
      - ./uploads:/app/uploads
      - ./database.json:/app/database.json
    restart: always

  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./client/dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - backend
    restart: always

volumes:
  uploads:
  database.json:
```

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads {
        alias /usr/share/nginx/html/uploads;
        expires 1d;
    }
}
```

### 3. 部署
```bash
# 构建并启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

---

## 方案三：使用 PM2 + Nginx（生产环境推荐）

### 前端构建
```bash
cd client
npm install
npm run build
```

### 后端配置
```bash
cd ../server
npm install --production
```

### 使用 PM2 启动
```bash
pm2 start server/index.js --name quote-api
pm2 save
pm2 startup
```

### Nginx 配置
参考方案一的 Nginx 配置部分。

---

## ⚙️ 部署后配置

### 修改管理员密码
1. 登录服务器
2. 编辑 `database.json`，清空 users 数组
3. 重启后端服务：
```bash
pm2 restart quote-api
```
4. 系统会自动创建新的管理员账号（默认 kane/342922202）

### 数据备份
重要文件需要定期备份：
- `/var/www/quote-system/database.json`
- `/var/www/quote-system/uploads/`

### 日志查看
```bash
# 后端日志
pm2 logs quote-api

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔧 常见问题

### 1. 端口被占用
```bash
# 查看端口占用
sudo lsof -i :3001
sudo lsof -i :80

# 杀死进程
sudo kill -9 进程ID
```

### 2. 权限问题
```bash
# 设置目录权限
sudo chown -R www-data:www-data /var/www/quote-system
```

### 3. 防火墙问题
```bash
# 检查防火墙状态
sudo ufw status

# 开放端口
sudo ufw allow 3001/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 4. 域名解析
如果使用域名，需要在域名服务商添加 DNS 记录：
- A 记录：@ → 服务器IP
- CNAME：www → @

---

## 📞 需要帮助？
如果在部署过程中遇到问题，请提供：
1. 服务器操作系统和版本
2. 具体的错误信息
3. 已经尝试过的解决方法
