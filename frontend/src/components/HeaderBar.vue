<template>
  <div class="header">
    <div class="header-logo" @click="goHome">
      <div class="logo-icon"></div>
      <span class="logo-text">非遗映像</span>
    </div>
    <span class="header-badge">传承 · 创新</span>
    <button class="header-about" @click="$emit('about')">关于</button>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore.js'

const store = useGameStore()
defineEmits(['about'])

function goHome() {
  store.showMain()
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
/* ===== Logo：左图标 + 右文字 ===== */
.header-logo {
  display: flex;
  align-items: center;
  gap: 7px;
  flex: 1;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.header-logo:active {
  opacity: 0.6;
}
/* Logo 图标：直接使用透明 PNG 图标 */
.logo-icon {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background-image: url('/images/feiyi-icon.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
}
.logo-text {
  font-size: 18px;
  font-weight: 800;
  font-family: var(--font-display);
  color: #1a365d;                /* 吸取 logo 图标的深藏蓝 */
  letter-spacing: 1px;
}
.header-badge {
  font-size: 13px;
  color: var(--accent-gold);
  font-weight: 600;
  letter-spacing: 1px;
}
.header-about {
  background: none;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
  font-family: inherit;
  color: var(--text-secondary);
  line-height: 1;
}
.header-about:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}
</style>
