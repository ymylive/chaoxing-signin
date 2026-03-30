#!/bin/bash

# 超星学习通签到 - macOS 安全警告解决脚本
# 用于解决"Apple无法验证是否包含恶意软件"的问题

set -e

echo "================================================"
echo "  超星学习通签到 - macOS 安全警告解决工具"
echo "================================================"
echo ""

# 检测可执行文件
POSSIBLE_FILES=(
    "Chaoxing-macos"
    "Chaoxing-macos-arm64"
    "Chaoxing-macos-x64"
    "./Chaoxing-macos"
    "./Chaoxing-macos-arm64"
    "./Chaoxing-macos-x64"
    "$(pwd)/Chaoxing-macos"
    "$(pwd)/Chaoxing-macos-arm64"
    "$(pwd)/Chaoxing-macos-x64"
)

FOUND_FILE=""
for file in "${POSSIBLE_FILES[@]}"; do
    if [ -f "$file" ]; then
        FOUND_FILE="$file"
        break
    fi
done

if [ -z "$FOUND_FILE" ]; then
    echo "❌ 错误：未找到可执行文件"
    echo ""
    echo "请确保以下文件之一在当前目录："
    echo "  - Chaoxing-macos"
    echo "  - Chaoxing-macos-arm64"
    echo "  - Chaoxing-macos-x64"
    echo ""
    echo "或者手动指定文件："
    echo "  $0 /path/to/Chaoxing-macos"
    exit 1
fi

# 如果提供了参数，使用参数指定的文件
if [ -n "$1" ]; then
    if [ -f "$1" ]; then
        FOUND_FILE="$1"
    else
        echo "❌ 错误：文件不存在: $1"
        exit 1
    fi
fi

echo "找到文件: $FOUND_FILE"
echo ""

# 显示当前状态
echo "📋 当前文件信息："
ls -lh "$FOUND_FILE"
echo ""

# 检查是否有隔离属性
echo "🔍 检查隔离属性..."
if xattr "$FOUND_FILE" | grep -q "com.apple.quarantine"; then
    echo "⚠️  检测到隔离属性（这是导致安全警告的原因）"
    HAS_QUARANTINE=true
else
    echo "✓ 未检测到隔离属性"
    HAS_QUARANTINE=false
fi
echo ""

# 检查执行权限
echo "🔍 检查执行权限..."
if [ -x "$FOUND_FILE" ]; then
    echo "✓ 已有执行权限"
    HAS_EXEC=true
else
    echo "⚠️  缺少执行权限"
    HAS_EXEC=false
fi
echo ""

# 询问是否继续
echo "================================================"
echo "  准备执行以下操作："
echo "================================================"
if [ "$HAS_QUARANTINE" = true ]; then
    echo "  1. 移除隔离属性（解决安全警告）"
fi
if [ "$HAS_EXEC" = false ]; then
    echo "  2. 添加执行权限"
fi
echo ""
read -p "是否继续？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

echo ""
echo "================================================"
echo "  开始处理..."
echo "================================================"
echo ""

# 移除隔离属性
if [ "$HAS_QUARANTINE" = true ]; then
    echo "🔧 移除隔离属性..."
    xattr -cr "$FOUND_FILE"
    echo "✓ 隔离属性已移除"
    echo ""
fi

# 添加执行权限
if [ "$HAS_EXEC" = false ]; then
    echo "🔧 添加执行权限..."
    chmod +x "$FOUND_FILE"
    echo "✓ 执行权限已添加"
    echo ""
fi

# 验证
echo "================================================"
echo "  验证结果"
echo "================================================"
echo ""

echo "📋 文件权限："
ls -lh "$FOUND_FILE"
echo ""

echo "📋 扩展属性："
if xattr "$FOUND_FILE" | grep -q "com.apple.quarantine"; then
    echo "❌ 仍有隔离属性"
else
    echo "✓ 无隔离属性"
fi
echo ""

# 检测芯片类型
echo "💻 检测Mac芯片类型..."
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    echo "✓ Apple Silicon (M1/M2/M3)"
    CHIP_TYPE="Apple Silicon"
elif [ "$ARCH" = "x86_64" ]; then
    echo "✓ Intel"
    CHIP_TYPE="Intel"
else
    echo "⚠️  未知架构: $ARCH"
    CHIP_TYPE="Unknown"
fi
echo ""

# 检查文件架构
echo "📋 文件支持的架构："
if command -v lipo &> /dev/null; then
    lipo -info "$FOUND_FILE" 2>/dev/null || file "$FOUND_FILE"
else
    file "$FOUND_FILE"
fi
echo ""

echo "================================================"
echo "  ✅ 处理完成！"
echo "================================================"
echo ""
echo "现在可以运行程序了："
echo "  $FOUND_FILE"
echo ""
echo "或者直接运行："
echo "  ./${FOUND_FILE##*/}"
echo ""

# 询问是否立即运行
read -p "是否立即运行程序？(y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "================================================"
    echo "  启动程序..."
    echo "================================================"
    echo ""
    "$FOUND_FILE"
fi
