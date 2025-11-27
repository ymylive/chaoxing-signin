@echo off
chcp 65001 >nul 2>&1

cd /d "%~dp0"

if not exist "dist\Chaoxing.exe" (
    echo [ERROR] dist\Chaoxing.exe not found
    echo Please run: pnpm win:build-exe
    pause
    exit /b 1
)

:: Check if already admin
net session >nul 2>&1
if %errorlevel% == 0 (
    :: Already admin, just run
    echo Starting as Administrator...
    echo.
    "dist\Chaoxing.exe"
) else (
    :: Request admin privileges
    echo Requesting Administrator privileges...
    echo Please click "Yes" in the UAC prompt
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -Verb RunAs -FilePath '%~dp0dist\Chaoxing.exe' -Wait"
)

echo.
pause
