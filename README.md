# Heritage Lens · 非遗映象

> **TRAE AI 创造力大赛** — 公益赛道 · 非遗创新创意产品开发
>
> 用 AI 为传统文化注入新生。上传照片，AI 自动识别并生成极具质感的非遗风格艺术卡牌，在收藏与升级中感受文化之美。

---

## ✨ 核心功能

| 功能 | 说明 |
|:-----|:------|
| **多风格非遗换装** | 苗族银饰、清宫华服、敦煌艺术三种非遗风格一键切换 |
| **AI 智能生成** | 上传人像照，AI 自动保持面部特征并融入非遗文化元素 |
| **用户引导** | 首页 CTA 引导 + 两步式上传（本地/样例） + 自动滚动 + 呼吸动画提示 |
| **参数精调** | 可折叠调参面板，调整纹样密度、图案风格、做旧程度 |
| **共鸣成长系统** | 连续生成同一风格提升共鸣等级（初识→探访→研习→精进→融汇→传承），解锁更优质生成结果 |
| **稀有度分级** | 清赏 → 珍赏 → 神品，三档品质随机产出，含保底机制 |
| **卡牌收藏图鉴** | 所有生成卡片自动归档，支持详情查看、翻牌展示、删除管理 |
| **本地持久化** | 收藏数据通过 IndexedDB 持久化存储，刷新不丢失 |
| **卡片下载与分享** | 支持卡牌截图保存到本地或系统分享 |
| **Toast 通知系统** | 成功/错误/信息三态统一反馈 |
| **关于界面** | 产品介绍弹窗，含初衷、功能列表、技术栈 |

---

## 🏗 AI 技术架构

### 数据流

```
首页 CTA → 上传照片（本地/样例二选一）→ Base64 编码 → 图像预处理（格式/大小校验）
    ↓
自动滚动到风格区 + 呼吸动画提示 → 选择非遗风格（轮播/网格）
    ↓
前端组装参数化提示词（风格 × 参数 × 背景 × 品质）
    ↓
后端 API 调用（图生图模式，1728×2304 输出，30s 超时）
    ↓ 成功          ↓ 失败降级（3次重试）
Base64 解码渲染     Mock 演示图展示（标注 mock 标识 + toast 提示）
    ↓
卡牌查看（翻转查看背面文化知识） → 收藏 → 图鉴归档 → 共鸣升级
```

### 提示词工程系统

提示词分四层参数化组合：

```
[风格层] 描述服饰、纹理、材质等核心风格特征
[参数层] 生成强度、细节保留、艺术化程度
[背景层] 背景环境氛围描述
[品质层] 根据稀有度等级附加品质修饰词
```

每层都有预设变体，前端运行时动态拼接。支持 `prompts.json` 外部配置，无需改代码即可调整提示词。

### 降级与容错

- API 调用设 3 次重试（指数退避 2s → 4s），30s 超时
- 所有异常都降级到本地 Mock 演示图
- 降级响应标注 `mock: true`，前端可见
- 免费额度上限可配置，超额后自动全量降级

---

## 🛠 技术栈

| 层 | 技术 | 用途 |
|:---|:-----|:------|
| 前端框架 | Vue 3 (Composition API) | 组件化界面 |
| 状态管理 | Pinia | 全局游戏状态 (共鸣、图鉴、UI 状态) |
| 构建工具 | Vite | 开发服务器与生产构建 |
| 后端 | Flask (Python) | API 代理与图片生成调度 |
| 图片生成 | LLM API (图生图) | 风格化卡牌生成 |
| 数据持久化 | IndexedDB | 本地收藏数据存储 |
| 卡牌导出 | html2canvas | DOM 截图下载 |

---

## 📁 项目结构

```
heritage-lens/
├── README.md                    # 项目文档
├── .gitignore
├── .env                         # 环境变量配置
│
├── backend/                     # 后端服务
│   ├── app.py                   # Flask 主应用（API 路由）
│   ├── config.py                # 全局配置（API 端点、限额等）
│   ├── requirements.txt         # Python 依赖
│   └── mock_demo.jpg            # 降级演示图片
│
└── frontend/                    # 前端应用
    ├── index.html               # 入口 HTML
    ├── vite.config.js           # Vite 配置（含 API 代理）
    ├── package.json
    │
    ├── public/images/           # 静态素材图片
    │   ├── *横版.jpg            # 轮播/详情 Banner 图
    │   └── *竖版.jpg            # 图鉴背景图
    │
    └── src/
        ├── main.js              # Vue 应用入口
        ├── App.vue              # 根组件（页面编排）
        ├── assets/
        │   └── design-tokens.css # 设计系统 CSS 变量
        │
        ├── stores/
        │   └── gameStore.js     # Pinia 状态管理（核心逻辑）
        │
        ├── data/
        │   ├── styles.js        # 风格定义
        │   ├── prompts.js       # 提示词模板
        │   ├── prompts.json     # 提示词参数配置
        │   ├── constants.js     # 常量（稀有度、颜色等）
        │   ├── forgeTips.js     # 生成提示语
        │   └── knowledge.js     # 非遗知识数据
        │
        └── components/
            ├── HeaderBar.vue    # 顶部标题栏（含关于按钮）
            ├── ResoBar.vue      # 共鸣等级进度条（含等级名称）
            ├── StyleCarousel.vue # 风格轮播选择器
            ├── StyleGrid.vue    # 风格网格选择
            ├── UploadZone.vue   # 图片上传区（双选项 + 大小校验）
            ├── ParamControls.vue # 参数精调面板（可折叠）
            ├── ForgeOverlay.vue # 生成工序界面
            ├── RarityPreview.vue # 稀有度预览
            ├── CardReveal.vue   # 卡牌翻转查看器（含气泡交互）
            ├── GalleryView.vue  # 图鉴收藏页面
            ├── NavBar.vue       # 底部固定导航栏
            ├── ConfirmModal.vue # 确认弹窗
            ├── ToastNotice.vue  # 共鸣升级 Toast
            └── AboutModal.vue   # 关于产品弹窗
```

---

## 🚀 快速开始

### 前提条件

- Python 3.10+
- Node.js 18+
- yarn 或 npm

### 1. 后端启动

```bash
cd backend
pip install -r requirements.txt

# 配置环境变量
# 在 .env 中设置 API KEY 等信息（参考 .env 示例）

python app.py
```

### 2. 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器自动代理 `/api` 请求到后端。

### 3. 访问

打开浏览器访问前端开发服务器提供的地址，即可体验。

---

## 📡 API 文档

### `POST /api/generate`

生成非遗风格卡牌。

**请求体：**

```json
{
  "image": "<base64 编码图片>",
  "style": "miao_silver",
  "rarity_level": 0,
  "prompt": "<完整提示词>",
  "negative": "<反向提示词>"
}
```

**响应：**

```json
{
  "image": "<base64 编码生成图>",
  "style": "miao_silver",
  "rarity": "清赏",
  "rarity_level": 0,
  "mock": false,
  "quota_remaining": 44
}
```

- `mock: true` 表示 API 调用失败，返回的是演示图
- 生成尺寸：1728 × 2304（3:4 比例）

### `GET /api/health`

健康检查。返回 `{"status": "ok", "time": "..."}`。

### `GET /api/stats`

生成统计。返回生成次数、平均耗时、mock 占比等数据。

---

## 💾 数据存储方案

| 数据 | 位置 | 格式 | 用途 |
|:-----|:-----|:-----|:------|
| 收藏卡牌 | IndexedDB (`heritage-lens`) | JSON 对象数组 | 用户收藏的生成卡片 |
| 共鸣等级 | IndexedDB (`heritage-lens`) | 嵌套对象 | 各风格的共鸣经验值 |
| 环境变量 | `backend/.env` | KEY=VALUE | API Key、模型名、端口等配置 |
| 提示词配置 | `frontend/src/data/prompts.json` | JSON | 四层参数化提示词模板 |
| 风格定义 | `frontend/src/data/styles.js` | JS 对象 | 风格 ID、名称、资源映射 |

---

## 🖼 效果展示

> 上传人像照片后，AI 自动生成以下风格的非遗艺术卡牌：

| 风格 | 预览 |
|:-----|:------|
| 苗族银饰 | ![苗族古典](public/images/苗族_古典_竖版.jpg) |
| 清宫华服 | ![清宫华服](public/images/清宫华服_古典_竖版.jpg) |
| 敦煌艺术 | ![敦煌艺术](public/images/敦煌_艺术_竖版.jpg) |

*(实际效果因输入照片和生成参数而异)*

---

## 🧩 核心设计

### 共鸣系统

```
连续生成同一风格 → 积累共鸣经验 → 提升共鸣等级
Lv.1 → Lv.5，每级需要更多经验
升级后该风格的生成结果品质提升
```

### 稀有度保底

```
清赏 (60%) → 珍赏 (30%) → 神品 (10%)
连续 3 次未出珍赏 → 下一次必出珍赏
连续 10 次未出神品 → 下一次必出神品
```

---

## 🤝 参与项目

本项目为 TRAE AI 创造力大赛参赛作品。欢迎 Issue 反馈与 Star 支持。

---

*Made with ❤️ for cultural heritage preservation*
