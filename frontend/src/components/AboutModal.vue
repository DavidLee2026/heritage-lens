<template>
  <Teleport to="body">
    <transition name="about-fade">
      <div v-if="visible" class="about-overlay" @click.self="$emit('close')">
        <div class="about-modal">
          <button class="about-close" @click="$emit('close')">✕</button>
          <div class="about-body">
            <!-- 装饰 Banner -->
            <div class="about-banner">
              <img src="/images/about/share-card-bg.jpg" alt="" class="banner-img" />
              <div class="banner-overlay">
                <h2 class="about-title">🏮 非遗映象</h2>
                <p class="about-subtitle">Heritage Lens · 以 AI 致敬传统</p>
              </div>
            </div>

            <section class="about-section">
              <h3 class="as-heading">初心</h3>
              <p class="as-text">
                非物质文化遗产是民族的记忆，但许多传统技艺正在远离年轻人的视线。
                「非遗映象」希望用 AI 技术降低非遗体验的门槛——
                不是隔着玻璃看展品，而是让你的照片与千年技艺对话，生成专属于你的文化收藏卡牌。
              </p>
            </section>

            <section class="about-section">
              <h3 class="as-heading">功能</h3>
              <ul class="as-list">
                <li><strong>AI 生成</strong> — 上传照片，AI 将人像融入 12 种非遗风格</li>
                <li><strong>参数调校</strong> — 调整纹样密度、图案风格、做旧程度，每一张都有你的审美参与</li>
                <li><strong>稀有度系统</strong> — 清赏、珍赏、神品三种稀有度，每一次生成都是惊喜</li>
                <li><strong>共鸣升级</strong> — 收集同一风格越多，共鸣等级越高，解锁共鸣四识气泡</li>
                <li><strong>图鉴收藏</strong> — 所有生成的卡牌存入图鉴，随时翻阅你的非遗收藏</li>
                <li><strong>非遗足迹</strong> — 中国地图点亮，生成新风格即解锁对应地域，点亮你的非遗版图</li>
                <li><strong>卡牌翻转</strong> — 点击卡牌翻转查看背面，阅读该稀有度对应的文化知识</li>
                <li><strong>分享下载</strong> — 生成的作品支持下载保存和分享给好友</li>
              </ul>
            </section>

            <!-- 稀有度卡牌展示 -->
            <section class="about-section">
              <h3 class="as-heading">稀有度一览</h3>
              <div class="card-showcase">
                <div class="showcase-item">
                  <div class="showcase-img-wrap rarity-q">
                    <img src="/images/about/清赏.jpg" alt="清赏" class="showcase-img" />
                  </div>
                  <span class="showcase-label">清赏 ✦</span>
                </div>
                <div class="showcase-item">
                  <div class="showcase-img-wrap rarity-z">
                    <img src="/images/about/珍赏.jpg" alt="珍赏" class="showcase-img" />
                  </div>
                  <span class="showcase-label">珍赏 ✦✦</span>
                </div>
                <div class="showcase-item">
                  <div class="showcase-img-wrap rarity-s">
                    <img src="/images/about/神品.jpg" alt="神品" class="showcase-img" />
                  </div>
                  <span class="showcase-label">神品 ✦✦✦</span>
                </div>
              </div>
            </section>

            <section class="about-section">
              <h3 class="as-heading">技术</h3>
              <div class="tech-tags">
                <span class="tech-tag" @click="showTechDetail = !showTechDetail">Vue 3</span>
                <span class="tech-tag" @click="showTechDetail = !showTechDetail">Pinia</span>
                <span class="tech-tag" @click="showTechDetail = !showTechDetail">IndexedDB</span>
                <span class="tech-tag" @click="showTechDetail = !showTechDetail">Flask</span>
                <span class="tech-tag tech-tag-ai" @click="showTechDetail = !showTechDetail">AI 图像生成</span>
              </div>
              <transition name="tech-expand">
                <div v-if="showTechDetail" class="tech-detail">
                  <div class="tech-row">
                    <span class="tech-label">AI 模型</span>
                    <span class="tech-value">豆包 · 即梦 5.0（Seedream）</span>
                  </div>
                  <div class="tech-row">
                    <span class="tech-label">模型版本</span>
                    <span class="tech-value">doubao-seedream-5-0</span>
                  </div>
                  <div class="tech-row">
                    <span class="tech-label">API 平台</span>
                    <span class="tech-value">火山方舟 · 火山引擎</span>
                  </div>
                  <div class="tech-row">
                    <span class="tech-label">前端框架</span>
                    <span class="tech-value">Vue 3 + Pinia + Vite</span>
                  </div>
                  <div class="tech-row">
                    <span class="tech-label">本地存储</span>
                    <span class="tech-value">IndexedDB（支持大图持久化）</span>
                  </div>
                  <div class="tech-row">
                    <span class="tech-label">后端服务</span>
                    <span class="tech-value">Flask · API 代理层</span>
                  </div>
                  <div class="tech-row">
                    <span class="tech-label">提示词工程</span>
                    <span class="tech-value">4 层架构（风格 × 参数 × 背景 × 品质）</span>
                  </div>
                </div>
              </transition>
            </section>

            <p class="about-footer">2026 · 以 AI 致敬传统</p>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ visible: { type: Boolean, default: false } })
defineEmits(['close'])
const showTechDetail = ref(false)
</script>

<style scoped>
.about-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 600;
  padding: 20px;
}
.about-modal {
  position: relative;
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 380px;
  max-height: 85vh;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}
.about-modal::-webkit-scrollbar { display: none; }
.about-close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  background: rgba(0,0,0,0.4);
  border: none;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  transition: 0.15s;
}
.about-close:hover {
  background: rgba(0,0,0,0.6);
}
.about-body {
  padding: 0 0 24px;
}

/* Banner 装饰顶 */
.about-banner {
  position: relative;
  width: 100%;
  height: 140px;
  overflow: hidden;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
.about-banner .banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.banner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%);
}
.about-title {
  font-size: 22px;
  font-weight: 800;
  font-family: var(--font-display);
  margin: 0;
  line-height: 1.3;
  color: #fff;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
}
.about-subtitle {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
  margin: 4px 0 0;
  letter-spacing: 2px;
}
.about-section {
  padding: 0 20px;
  margin-bottom: 16px;
}
.as-heading {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 6px;
  color: var(--accent);
}
.as-text {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-primary);
  margin: 0;
}
.as-list {
  margin: 0;
  padding: 0 0 0 16px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-primary);
}
.as-list li { margin-bottom: 4px; }
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tech-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--accent-light);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.15s;
  user-select: none;
}
.tech-tag:hover { background: #edd5d5; }
.tech-tag:active { transform: scale(0.95); }
.tech-tag-ai {
  background: var(--accent);
  color: #fff;
}
.tech-tag-ai:hover { background: var(--accent-hover); }
.tech-detail {
  margin-top: 10px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tech-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  line-height: 1.4;
}
.tech-label {
  color: var(--text-secondary);
  flex-shrink: 0;
  margin-right: 12px;
}
.tech-value {
  color: var(--text-primary);
  font-weight: 500;
  text-align: right;
}
/* 技术详情展开动画 */
.tech-expand-enter-active { transition: all 0.25s ease; }
.tech-expand-leave-active { transition: all 0.2s ease; }
.tech-expand-enter-from { opacity: 0; max-height: 0; transform: translateY(-6px); }
.tech-expand-leave-to { opacity: 0; max-height: 0; transform: translateY(-6px); }
/* 稀有度卡牌展示 */
.card-showcase {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.showcase-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.showcase-img-wrap {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
.showcase-img-wrap:hover {
  transform: translateY(-2px);
}
.showcase-img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  object-fit: cover;
}
.showcase-img-wrap.rarity-q { border: 1px solid #d4cdc2; }
.showcase-img-wrap.rarity-z { border: 1px solid #d4c095; }
.showcase-img-wrap.rarity-s { border: 1.5px solid rgba(212,168,83,0.4); }
.showcase-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
}

.about-footer {
  text-align: center;
  font-size: 11px;
  color: var(--text-tertiary);
  margin: 20px 0 0;
  padding: 0 20px;
  letter-spacing: 1px;
}

/* 过渡动画 */
.about-fade-enter-active,
.about-fade-leave-active {
  transition: opacity 0.25s;
}
.about-fade-enter-active .about-modal,
.about-fade-leave-active .about-modal {
  transition: transform 0.25s;
}
.about-fade-enter-from,
.about-fade-leave-to {
  opacity: 0;
}
.about-fade-enter-from .about-modal {
  transform: scale(0.92) translateY(10px);
}
.about-fade-leave-to .about-modal {
  transform: scale(0.92) translateY(10px);
}
</style>
