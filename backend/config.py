"""
非遗映像 — 全局配置
"""
import os
import base64
from pathlib import Path
from dotenv import load_dotenv

# 优先级：系统环境变量 > .env 文件
# 生产部署应直接设置环境变量（export ARK_API_KEY=xxx），不依赖 .env 文件
load_dotenv()

ARK_API_KEY = os.environ.get("ARK_API_KEY", "")
ARK_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/images/generations"
ARK_MODEL = os.environ.get("ARK_MODEL", "doubao-seedream-5-0-260128")
ARK_MAX_IMAGE_MB = 10

# ─── 每日预算控制 ───────────────────────────────────────────
# 已充值付费，按日预算自动计算上限。评审期间 10 元/天够用
DAILY_BUDGET_YUAN = 10        # 每天预算（元）
IMAGE_COST_YUAN = 0.22        # 每张生成成本（元）
DAILY_IMAGE_LIMIT = int(DAILY_BUDGET_YUAN / IMAGE_COST_YUAN) if DAILY_BUDGET_YUAN > 0 else 999

# ─── 用户级限流（防单人刷爆） ──────────────────────────────
# 每个 IP 每天最多生成多少张
USER_DAILY_LIMIT = 10

BACKEND_DIR = Path(__file__).parent
MOCK_DEMO_PATH = BACKEND_DIR / "mock_demo.jpg"

# 各风格专属 mock 降级图（风格ID → 文件名映射）
MOCK_STYLE_MAP = {
    "miao_silver": "mock_miao_silver.jpg",
    "court_dress": "mock_court_dress.jpg",
    "dunhuang": "mock_dunhuang.jpg",
}

# 加载通用 mock 降级图（兜底）
MOCK_DEMO_BASE64 = ""
if MOCK_DEMO_PATH.exists():
    with open(MOCK_DEMO_PATH, "rb") as f:
        MOCK_DEMO_BASE64 = base64.b64encode(f.read()).decode("utf-8")

# 加载各风格专属 mock 降级图
MOCK_STYLE_BASE64 = {}
for style_id, filename in MOCK_STYLE_MAP.items():
    path = BACKEND_DIR / filename
    if path.exists():
        with open(path, "rb") as f:
            MOCK_STYLE_BASE64[style_id] = base64.b64encode(f.read()).decode("utf-8")
        print(f"  ✅ 已加载 {style_id} mock 图 ({filename})")
    else:
        print(f"  ⚠️ 未找到 {style_id} mock 图 ({filename})，将使用通用降级图")
