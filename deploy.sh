#!/bin/bash
# ==============================================================
#  非遗映像 — 一键部署脚本
#  用法：./deploy.sh
#  作用：build 前端 → scp 上传到服务器
# ==============================================================

set -e  # 任何一步出错就停止

# ─── 配置区（按你的实际情况填）─────────────────────────────
SERVER_HOST="leerobert.site"          # 服务器域名或 IP
SERVER_USER="root"                    # SSH 登录用户
SERVER_PATH="/www/wwwroot/leerobert.site/heritage-lens/backend/static/"  # 服务器目标路径
SSH_PORT=22                           # SSH 端口（默认22，改了请修改）
# ────────────────────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   🏮 非遗映像 — 一键部署             ║"
echo "╚══════════════════════════════════════╝"
echo ""

# 1. 构建前端
echo "📦 [1/3] 构建前端..."
cd frontend
npm run build
cd ..
echo "  ✅ 构建完成"
echo ""

# 2. 上传到服务器
echo "📤 [2/3] 上传到 ${SERVER_HOST}..."
scp -r -P ${SSH_PORT} frontend/dist/* "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}"
echo "  ✅ 上传完成"
echo ""

# 3. 完成
echo "🎉 [3/3] 部署成功！"
echo "    https://${SERVER_HOST}/heritage-lens/"
echo ""
