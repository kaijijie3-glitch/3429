@echo off
chcp 65001 >nul
echo ========================================
echo   报价系统 - 一键启动脚本
echo ========================================
echo.

echo [1/3] 检查 Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit
)
echo ✅ Node.js 已安装

echo.
echo [2/3] 启动后端服务...
start "报价系统-后端" cmd /k "cd /d %~dp0server && node index.js"

timeout /t 2 /nobreak >nul

echo.
echo [3/3] 启动前端服务...
start "报价系统-前端" cmd /k "cd /d %~dp0client && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   ✅ 启动完成！
echo ========================================
echo.
echo 访问地址：
echo   前端：http://localhost:5174
echo   后端：http://localhost:3001
echo.
echo 登录账号：
echo   管理员：kane / 342922202
echo.
echo 按任意键关闭此窗口（服务会继续运行）...
pause >nul
