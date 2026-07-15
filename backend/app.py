"""
非遗映像 — 后端
POST /api/generate  — 生成非遗卡牌
GET  /api/health    — 健康检查
GET  /api/stats     — 生成统计

前端控制游戏逻辑（稀有度、共鸣、保底），
后端只负责调用生图 API 返回图片。
"""
import os
import json
import time
from datetime import date, datetime
from pathlib import Path

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

import config

app = Flask(__name__, static_folder='static')
CORS(app)

# ─── API 用量持久化（JSON：每日计数 + IP 计数） ─────────────
QUOTA_FILE = Path(__file__).parent / ".api_quota.json"

def _load_quota():
    """读取用量数据，含日期自愈——如果跨天了自动重置"""
    try:
        data = json.loads(QUOTA_FILE.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        data = {}

    today = date.today().isoformat()  # e.g. "2026-07-14"

    # 日计数：跨天了就重置
    daily = data.get("daily", {})
    if daily.get("date") != today:
        daily = {"date": today, "count": 0}

    # IP 计数：跨天了就全部重置
    ips = data.get("ips", {})
    if data.get("ip_date") != today:
        ips = {}

    return daily, ips, today

def _save_quota(daily, ips, today):
    """写回用量数据"""
    QUOTA_FILE.write_text(json.dumps({
        "daily": daily,
        "ip_date": today,
        "ips": ips,
    }, ensure_ascii=False, indent=2))

# 加载初始数据
_daily_quota, _ip_quota, _today = _load_quota()

generation_log = []  # 生成记录 [{time, duration, style, rarity, mock}]


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "time": datetime.now().isoformat()})


RARITY_MAP = ["清赏", "珍赏", "神品"]


@app.route("/api/stats", methods=["GET"])
def stats():
    """生成统计"""
    if not generation_log:
        return jsonify({"count": 0, "logs": []})

    durations = [log["duration"] for log in generation_log if not log["mock"]]
    mock_count = sum(1 for log in generation_log if log["mock"])
    daily, _, _ = _load_quota()

    return jsonify({
        "count": len(generation_log),
        "mock_count": mock_count,
        "real_count": len(generation_log) - mock_count,
        "avg_duration": round(sum(durations) / len(durations), 2) if durations else None,
        "max_duration": max(durations) if durations else None,
        "min_duration": min(durations) if durations else None,
        "total_duration": round(sum(durations), 2) if durations else None,
        "logs": generation_log,
        "quota": {
            "today": daily.get("count", 0),
            "daily_limit": config.DAILY_IMAGE_LIMIT,
        },
    })


@app.route("/api/generate", methods=["POST"])
def generate():
    data = request.get_json()
    if not data or not data.get("image"):
        return jsonify({"error": "缺少图片数据"}), 400

    image_base64 = data["image"]
    style = data.get("style", "miao_silver")
    # 前端已算好稀有度（含共鸣/保底），后端直接使用
    rarity_level = int(data.get("rarity_level", 0))
    # 前端已组装好完整提示词（风格×参数×背景×品质），后端直接使用
    prompt = data.get("prompt", "")
    negative_prompt = data.get("negative", "")

    # ─── 限额检查 ───────────────────────────────────────────
    daily, ips, today = _load_quota()
    client_ip = request.remote_addr or "unknown"
    user_today = ips.get(client_ip, 0)

    daily_ok = daily["count"] < config.DAILY_IMAGE_LIMIT
    lifetime_ok = True  # 每日限额已经够用，总限额暂不新增判断
    user_ok = user_today < config.USER_DAILY_LIMIT

    if not daily_ok:
        print(f"⚠️ 每日用量已达上限 ({daily['count']}/{config.DAILY_IMAGE_LIMIT})")
        return jsonify({"error": "今天的生成次数已达上限，明天再来吧 🏮"}), 429

    if not user_ok:
        print(f"⚠️ IP {client_ip} 今日用量已满 ({user_today}/{config.USER_DAILY_LIMIT})")
        return jsonify({"error": "你的今日生成次数已用完，明天再来试试吧 🏮"}), 429

    # ─── 调 API ─────────────────────────────────────────────
    image_result = None
    mock_used = False
    start_time = time.time()

    if config.ARK_API_KEY:
        arp_prompt = prompt if prompt else (
            f"Transform this person in the photo into a traditional ethnic style portrait. "
            f"IMPORTANT - face identity preservation."
        )
        payload = {
            "model": config.ARK_MODEL,
            "prompt": arp_prompt,
            "image": f"data:image/png;base64,{image_base64}",
            "size": "1728x2304",
            "response_format": "b64_json",
            "watermark": False,
        }
        if negative_prompt:
            payload["negative_prompt"] = negative_prompt
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {config.ARK_API_KEY}",
        }
        # 重试机制：应对 SSL/网络不稳定，最多重试 3 次
        max_retries = 3
        for attempt in range(max_retries):
            try:
                resp = requests.post(config.ARK_ENDPOINT, headers=headers, json=payload, timeout=10)
                result = resp.json()
                if resp.status_code == 200 and result.get("data"):
                    image_result = result["data"][0].get("b64_json")

                    # 调用成功 → 更新用量
                    daily["count"] += 1
                    ips[client_ip] = user_today + 1
                    _save_quota(daily, ips, today)
                    break
                else:
                    print(f"API 返回异常 (第{attempt+1}次): status={resp.status_code}, body={result.get('error','')}")
            except Exception as e:
                print(f"API 调用异常 (第{attempt+1}/{max_retries}次): {e}")
            if attempt < max_retries - 1:
                wait = (attempt + 1) * 2
                print(f"等待 {wait}s 后重试...")
                time.sleep(wait)

    # Mock 降级（优先使用风格专属图，兜底使用通用图）
    if not image_result:
        image_result = config.MOCK_STYLE_BASE64.get(style, config.MOCK_DEMO_BASE64)
        mock_used = True

    duration = round(time.time() - start_time, 2)
    rarity_label = RARITY_MAP[rarity_level] if 0 <= rarity_level < 3 else "清赏"
    generation_log.append({
        "time": datetime.now().strftime("%H:%M:%S"),
        "duration": duration,
        "style": style,
        "rarity": rarity_label,
        "mock": mock_used,
    })

    return jsonify({
        "image": image_result,
        "style": style,
        "rarity": rarity_label,
        "rarity_level": rarity_level,
        "mock": mock_used,
        "quota_remaining": max(0, config.DAILY_IMAGE_LIMIT - daily["count"]),
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5678))
    print(f"非遗映像后端启动，端口 {port}")
    print(f"API Key: {'已配置' if config.ARK_API_KEY else '未配置'}")
    mock_count = len(config.MOCK_STYLE_BASE64)
    print(f"Mock: 通用图{'已加载' if config.MOCK_DEMO_BASE64 else '未加载'}，{mock_count} 个风格专属图已就绪")
    app.run(host="0.0.0.0", port=port, debug=True)
