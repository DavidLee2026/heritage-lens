"""
非遗映像 — 后端
POST /api/generate  — 生成非遗卡牌
GET  /api/health    — 健康检查
GET  /api/stats     — 生成统计

前端控制游戏逻辑（稀有度、共鸣、保底），
后端只负责调用生图 API 返回图片。
"""
import os
import time
from datetime import datetime

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

import config

app = Flask(__name__, static_folder='static')
CORS(app)

api_usage_counter = 0
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

    return jsonify({
        "count": len(generation_log),
        "mock_count": mock_count,
        "real_count": len(generation_log) - mock_count,
        "avg_duration": round(sum(durations) / len(durations), 2) if durations else None,
        "max_duration": max(durations) if durations else None,
        "min_duration": min(durations) if durations else None,
        "total_duration": round(sum(durations), 2) if durations else None,
        "logs": generation_log,
        "quota_used": api_usage_counter,
    })


@app.route("/api/generate", methods=["POST"])
def generate():
    global api_usage_counter

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

    # 调 API
    image_result = None
    mock_used = False
    start_time = time.time()

    if config.ARK_API_KEY and api_usage_counter < config.FREE_LIMIT:
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
                resp = requests.post(config.ARK_ENDPOINT, headers=headers, json=payload, timeout=30)
                result = resp.json()
                if resp.status_code == 200 and result.get("data"):
                    image_result = result["data"][0].get("b64_json")
                    api_usage_counter += 1
                    break
                else:
                    print(f"API 返回异常 (第{attempt+1}次): status={resp.status_code}, body={result.get('error','')}")
            except Exception as e:
                print(f"API 调用异常 (第{attempt+1}/{max_retries}次): {e}")
            if attempt < max_retries - 1:
                wait = (attempt + 1) * 2
                print(f"等待 {wait}s 后重试...")
                time.sleep(wait)

    # Mock 降级
    if not image_result:
        image_result = config.MOCK_DEMO_BASE64
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
        "quota_remaining": max(0, config.FREE_LIMIT - api_usage_counter),
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5678))
    print(f"非遗映像后端启动，端口 {port}")
    print(f"API Key: {'已配置' if config.ARK_API_KEY else '未配置'}")
    print(f"Mock: {'已加载' if config.MOCK_DEMO_BASE64 else '未加载'}")
    app.run(host="0.0.0.0", port=port, debug=True)
