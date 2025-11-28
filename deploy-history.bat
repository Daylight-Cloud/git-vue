@echo off
echo 1. 打包（History 模式 /library）
npm run build
if errorlevel 1 pause & exit /b 1

echo 2. 上传
scp -r dist/* ubuntu@服务器IP:/home/ubuntu/vue-library

echo 3. 完成！访问 http://服务器IP/library 验证
pause