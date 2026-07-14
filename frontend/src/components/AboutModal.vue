<template>
  <Teleport to="body">
    <transition name="about-fade">
      <div v-if="visible" class="about-overlay" @click.self="$emit('close')">
        <div class="about-modal">
          <button class="about-close" @click="$emit('close')">✕</button>
          <div class="about-body">
            <h2 class="about-title">🏮 非遗映象</h2>
            <p class="about-subtitle">Heritage Lens</p>

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
                <li><strong>AI 生成</strong> — 上传照片，AI 将人像融入苗族银饰、敦煌壁画、清宫华服等非遗风格</li>
                <li><strong>参数调校</strong> — 调整纹样密度、图案风格、做旧程度，每一张都有你的审美参与</li>
                <li><strong>稀有度系统</strong> — 清赏、珍赏、神品三种稀有度，每一次生成都是惊喜</li>
                <li><strong>共鸣升级</strong> — 收集同一风格越多，共鸣等级越高，稀有概率也随之提升</li>
                <li><strong>图鉴收藏</strong> — 所有生成的卡牌存入图鉴，随时翻阅你的非遗收藏</li>
              </ul>
            </section>

            <section class="about-section">
              <h3 class="as-heading">技术</h3>
              <div class="tech-tags">
                <span class="tech-tag">Vue 3</span>
                <span class="tech-tag">Pinia</span>
                <span class="tech-tag">IndexedDB</span>
                <span class="tech-tag">Flask</span>
                <span class="tech-tag">AI 图像生成</span>
              </div>
            </section>

            <p class="about-footer">2026 · 以 AI 致敬传统</p>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
defineProps({ visible: { type: Boolean, default: false } })
defineEmits(['close'])
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
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 380px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}
.about-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 16px 16px 0;
  display: block;
  margin-left: auto;
  color: var(--text-secondary);
  font-family: inherit;
}
.about-body {
  padding: 0 20px 24px;
}
.about-title {
  font-size: 22px;
  font-weight: 800;
  font-family: var(--font-display);
  margin: 0 0 2px;
  line-height: 1.3;
}
.about-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 20px;
  letter-spacing: 2px;
}
.about-section {
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
}
.about-footer {
  text-align: center;
  font-size: 11px;
  color: var(--text-tertiary);
  margin: 20px 0 0;
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
