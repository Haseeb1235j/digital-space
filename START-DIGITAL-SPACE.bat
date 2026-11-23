@echo off
setlocal
title Digital Space Launcher
cd /d "%~dp0"

echo.
echo ==========================================
echo          DIGITAL SPACE LAUNCHER
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed on this laptop.
  echo Opening the official Node.js download page...
  start "" "https://nodejs.org/en/download"
  echo.
  echo Install the LTS version, then run this file again.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo First launch: installing the required files...
  echo This normally takes one or two minutes.
  call npm install
  if errorlevel 1 (
    echo.
    echo Installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

echo Starting Digital Space...
echo Keep this window open while using the application.
echo.
start "" powershell -NoProfile -WindowStyle Hidden -Command "$url='http://127.0.0.1:5173'; for($i=0; $i -lt 120; $i++){ try { $response=Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1; if($response.StatusCode -eq 200){ Start-Process $url; exit 0 } } catch {}; Start-Sleep -Milliseconds 500 }; exit 1"
call npm run dev -- --host 127.0.0.1 --port 5173 --strictPort

echo.
echo Digital Space has stopped.
pause
