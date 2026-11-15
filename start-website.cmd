
@echo off
title VTECH Website Server

echo ================================
echo    Starting VTECH Website...
echo ================================

start "" "http://127.0.0.1:8000/day2.html"

py -m http.server 8000 --bind 127.0.0.1 --directory "D:\Work\Denis\Uni\2026-2027\VTECH\motion-design-web\dist"

pause
