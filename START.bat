@echo off
chcp 65001 >nul 2>&1
title Chaoxing Auto Signin

cd /d "%~dp0"

if not exist "dist\Chaoxing.exe" (
    echo [ERROR] dist\Chaoxing.exe not found
    echo Please run: pnpm win:build-exe
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Chaoxing Auto Signin
echo ========================================
echo.
echo Checking administrator privileges...

net session >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Running as Administrator
    echo.
    echo Starting program...
    "dist\Chaoxing.exe"
) else (
    echo [WARN] Not running as Administrator
    echo.
    echo The program will start but some features may not work properly.
    echo.
    echo RECOMMENDED: Right-click this script and select "Run as administrator"
    echo.
    echo Press any key to continue anyway, or Ctrl+C to cancel...
    pause >nul
    echo.
    echo Starting in non-admin mode...
    start "" "dist\Chaoxing.exe"
)

echo.
echo Program started!
echo Browser will open at http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
