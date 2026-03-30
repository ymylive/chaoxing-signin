#!/bin/bash

# 超星学习通签到 - 一键启动脚本
# 自动处理权限和隔离属性问题

set -e

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 查找可执行文件
EXECUTABLE=""
for file in Chaoxing-macos Chaoxing-macos-arm64 Chaoxing-macos-x64; do
    if [ -f "$file" ]; then
        EXECUTABLE="$file"
        break
    fi
done

if [ -z "$EXECUTABLE" ]; then
    echo "❌ 错误：未找到可执行文件"
    echo ""
    echo "请确保以下文件之一存在："
    echo "  - Chaoxing-macos"
    echo "  - Chaoxing-macos-arm64"
    echo "  - Chaoxing-macos-x64"
    exit 1
fi

echo "找到可执行文件: $EXECUTABLE"

# 自动修复权限和隔离属性
echo "正在准备运行环境..."
chmod +x "$EXECUTABLE" 2>/dev/null || true
xattr -cr "$EXECUTABLE" 2>/dev/null || true

# 运行程序
echo "启动程序..."
echo ""
exec "./$EXECUTABLE"
