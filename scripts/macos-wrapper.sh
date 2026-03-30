#!/bin/bash

# 超星学习通签到 - macOS 包装脚本
# 用于确保可执行文件被正确识别

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 查找实际的可执行文件
EXECUTABLE=""
for file in Chaoxing-macos.bin Chaoxing-macos-arm64.bin Chaoxing-macos-x64.bin; do
    if [ -f "$file" ]; then
        EXECUTABLE="$file"
        break
    fi
done

if [ -z "$EXECUTABLE" ]; then
    echo "❌ 错误：未找到可执行文件"
    exit 1
fi

# 确保有执行权限
chmod +x "$EXECUTABLE" 2>/dev/null || true

# 运行程序
exec "./$EXECUTABLE" "$@"
