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

# ─── 每日预算控制（保护性安全线，非限制性门槛） ────────────
# 哲学：如果有人用爆预算 → 说明产品被认可，是好事
# 安全线只是防止一夜归零的兜底，不是用户门槛
DAILY_BUDGET_YUAN = 200       # 每天预算上限（元）— ≈900张，足够日常 + 爆发
IMAGE_COST_YUAN = 0.22        # 每张生成成本（元）
DAILY_IMAGE_LIMIT = int(DAILY_BUDGET_YUAN / IMAGE_COST_YUAN) if DAILY_BUDGET_YUAN > 0 else 9999

# ─── 用户级限流（已停用） ──────────────────────────────────
# 2026-07-15 决策：不限制个人使用。限制是产品被认可的验证信号。
USER_DAILY_LIMIT = 99999

# ─── 管理员绕过令牌（已停用 — 保留代码作降级备用） ──────
# localStorage.setItem('feiyi_bypass', '<密码>') 可绕过旧限流
# 当前个人限流已停用，此功能作为应急恢复时的快捷开关
BYPASS_TOKEN = os.environ.get("BYPASS_TOKEN", "feiyi2026")

BACKEND_DIR = Path(__file__).parent
MOCK_DEMO_PATH = BACKEND_DIR / "mock_demo.jpg"

# 支持的全部非遗风格（共 12 种）
STYLE_OPTIONS = [
    "miao_silver",      # 苗银
    "court_dress",      # 宫廷服饰
    "dunhuang",         # 敦煌
    "tang_dynasty",     # 唐风
    "ming_brocade",     # 明锦
    "su_embroidery",    # 苏绣
    "batik",            # 蜡染
    "blue_porcelain",   # 青花瓷
    "yi_costume",       # 彝族服饰
    "tibetan",          # 藏族
    "zhuang_brocade",   # 壮锦
    "ming_style",       # 明式
]

# 各风格专属 mock 降级图（风格ID → 文件名映射）
MOCK_STYLE_MAP = {
    "miao_silver": "mock_miao_silver.jpg",
    "court_dress": "mock_court_dress.jpg",
    "dunhuang": "mock_dunhuang.jpg",
    "tang_dynasty": "mock_tang_dynasty.jpg",
    "ming_brocade": "mock_ming_brocade.jpg",
    "su_embroidery": "mock_su_embroidery.jpg",
    "batik": "mock_batik.jpg",
    "blue_porcelain": "mock_blue_porcelain.jpg",
    "yi_costume": "mock_yi_costume.jpg",
    "tibetan": "mock_tibetan.jpg",
    "zhuang_brocade": "mock_zhuang_brocade.jpg",
    "ming_style": "mock_ming_style.jpg",
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
