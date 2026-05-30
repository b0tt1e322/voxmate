@echo off
cd /d "C:\Users\王劲翔\Documents\游戏搭子"
C:\Program Files\Git\bin\git.exe add -A
C:\Program Files\Git\bin\git.exe commit -m "update site"
C:\Program Files\Git\bin\git.exe push
echo ✅ 网站已更新！等1-2分钟生效
pause
