@echo off
chcp 65001 >nul 2>&1
title 制作便携版

cd /d "%~dp0"

echo.
echo ============================================
echo   制作完全独立的便携版
echo ============================================
echo.

if not exist "dist\Chaoxing.exe" (
    echo [错误] 找不到 dist\Chaoxing.exe
    echo.
    echo 请先运行以下命令：
    echo   pnpm win:build-exe
    echo.
    pause
    exit /b 1
)

echo 步骤说明：
echo   1. 首次从项目目录运行 EXE
echo   2. 自动复制所有文件到 AppData
echo   3. 安装依赖
echo   4. 完成后即可移动 EXE 到任何位置
echo.
echo ============================================
echo.

set "APPDATA_DIR=%LOCALAPPDATA%\ChaoxingSignin\app"

REM 清理旧的便携版目录
if exist "%APPDATA_DIR%" (
    echo 检测到已存在便携版目录，是否删除重新初始化？
    echo 目录: %APPDATA_DIR%
    echo.
    choice /C YN /M "删除并重新初始化 (Y) 还是继续使用现有文件 (N)"
    if errorlevel 2 goto :skip_clean
    if errorlevel 1 (
        echo.
        echo 正在清理旧文件...
        rmdir /s /q "%APPDATA_DIR%" 2>nul
        echo ✓ 清理完成
        echo.
    )
)

:skip_clean

echo [1/3] 正在初始化便携版...
echo.
echo 运行 EXE 进行首次初始化...
echo 请勿关闭程序，等待安装完成
echo.

REM 从 dist 目录运行，使用 --portable --sync 强制便携并同步最新UI
cd dist
start /wait Chaoxing.exe --portable --sync --no-elevate
cd ..

echo.
echo ============================================
echo.

REM 检查是否初始化成功
if not exist "%APPDATA_DIR%\package.json" (
    echo [失败] 初始化未完成
    echo.
    echo 请检查：
    echo   1. 程序是否正常启动
    echo   2. 是否有错误提示
    echo   3. 查看日志: %LOCALAPPDATA%\ChaoxingSignin\logs\
    echo.
    pause
    exit /b 1
)

echo [2/3] 验证文件...
echo.

if exist "%APPDATA_DIR%\apps" (
    echo ✓ apps 目录已复制
) else (
    echo ✗ apps 目录缺失
)

if exist "%APPDATA_DIR%\packages" (
    echo ✓ packages 目录已复制
) else (
    echo ✗ packages 目录缺失
)

if exist "%APPDATA_DIR%\node_modules" (
    echo ✓ 依赖已安装
) else (
    echo ⚠ 依赖可能未完全安装
)

echo.
echo [3/3] 创建使用说明...

echo ============================================ > "%APPDATA_DIR%\使用说明.txt"
echo   超星学习通便携版 >> "%APPDATA_DIR%\使用说明.txt"
echo ============================================ >> "%APPDATA_DIR%\使用说明.txt"
echo. >> "%APPDATA_DIR%\使用说明.txt"
echo 便携版工作目录: >> "%APPDATA_DIR%\使用说明.txt"
echo   %APPDATA_DIR% >> "%APPDATA_DIR%\使用说明.txt"
echo. >> "%APPDATA_DIR%\使用说明.txt"
echo 使用方法: >> "%APPDATA_DIR%\使用说明.txt"
echo   1. 可以把 Chaoxing.exe 复制到任何位置 >> "%APPDATA_DIR%\使用说明.txt"
echo   2. 可以创建桌面快捷方式 >> "%APPDATA_DIR%\使用说明.txt"
echo   3. 推荐以管理员身份运行 >> "%APPDATA_DIR%\使用说明.txt"
echo. >> "%APPDATA_DIR%\使用说明.txt"
echo 访问地址: >> "%APPDATA_DIR%\使用说明.txt"
echo   前端: http://localhost:3000 >> "%APPDATA_DIR%\使用说明.txt"
echo   API:  http://localhost:5000 >> "%APPDATA_DIR%\使用说明.txt"
echo. >> "%APPDATA_DIR%\使用说明.txt"
echo 日志位置: >> "%APPDATA_DIR%\使用说明.txt"
echo   %LOCALAPPDATA%\ChaoxingSignin\logs\ >> "%APPDATA_DIR%\使用说明.txt"
echo. >> "%APPDATA_DIR%\使用说明.txt"
echo 卸载方法: >> "%APPDATA_DIR%\使用说明.txt"
echo   删除 %LOCALAPPDATA%\ChaoxingSignin 目录 >> "%APPDATA_DIR%\使用说明.txt"
echo. >> "%APPDATA_DIR%\使用说明.txt"

echo.
echo ============================================
echo   ✓ 便携版制作完成！
echo ============================================
echo.
echo 工作目录: %APPDATA_DIR%
echo.
echo 现在你可以：
echo   1. 把 dist\Chaoxing.exe 复制到桌面
echo   2. 把 EXE 移动到任何位置
echo   3. 直接双击运行（建议右键"以管理员身份运行"）
echo.
echo 查看详细说明: %APPDATA_DIR%\使用说明.txt
echo.

choice /C YN /M "是否现在复制 EXE 到桌面"
if errorlevel 2 goto :end
if errorlevel 1 (
    set "DESKTOP=%USERPROFILE%\Desktop"
    copy /y "dist\Chaoxing.exe" "%DESKTOP%\Chaoxing.exe" >nul
    echo.
    echo ✓ 已复制到桌面: %DESKTOP%\Chaoxing.exe
    echo.
)

:end
echo 按任意键退出...
pause >nul
