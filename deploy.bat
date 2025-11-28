@echo off
set SERVER=ubuntu@101.42.169.71
set REMOTE_DIR=/www/vue

echo [1] 开始打包...
call npm run build
if errorlevel 1 (
  echo 打包失败，终止
  pause
  exit /b 1
)

echo [2] 上传文件到服务器...
scp -r dist\* %SERVER%:%REMOTE_DIR%

echo [3] 上传完成！浏览器访问 http://你的服务器IP 验证
pause