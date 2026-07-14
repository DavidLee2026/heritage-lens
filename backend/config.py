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
FREE_LIMIT = 45

BACKEND_DIR = Path(__file__).parent
MOCK_DEMO_PATH = BACKEND_DIR / "mock_demo.jpg"

MOCK_DEMO_BASE64 = ""
if MOCK_DEMO_PATH.exists():
    with open(MOCK_DEMO_PATH, "rb") as f:
        MOCK_DEMO_BASE64 = base64.b64encode(f.read()).decode("utf-8")
