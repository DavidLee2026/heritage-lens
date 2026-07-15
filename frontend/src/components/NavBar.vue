<template>
  <div class="nav-bar">
    <button
      class="nav-btn"
      :class="{ active: store.viewState === 'main' }"
      @click="store.showMain()"
    >
      🏠 主页
    </button>

    <div class="map-btn-wrap">
      <!-- 解锁新区域浮层 -->
      <transition name="prompt-pop">
        <div
          v-if="store.showNewStylePrompt"
          class="map-prompt"
          @click="store.showMap()"
        >
          ✨ 解锁新区域
        </div>
      </transition>
      <button
        class="nav-btn"
        :class="{ active: store.viewState === 'map' }"
        @click="store.showMap()"
      >
        🗺️ 地图
      </button>
    </div>

    <button
      class="nav-btn"
      :class="{ active: store.viewState === 'gallery' || store.viewState === 'galleryDetail' }"
      @click="store.showGallery()"
    >
      🏛️ 图鉴
      <span
        v-if="store.hasNewCards"
        class="badge show"
        :class="{ bump: justBumped }"
      >+{{ store.newCardCount }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useGameStore } from '../stores/gameStore.js'

const store = useGameStore()
const justBumped = ref(false)

// 监听新卡数量变化
watch(
  () => store.newCardCount,
  () => {
    if (store.newCardCount > 0) {
      justBumped.value = true
      setTimeout(() => (justBumped.value = false), 200)
    }
  }
)
</script>

<style scoped>
.nav-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 8px;
  padding: 8px calc((100% - 420px) / 2 + 16px);
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  z-index: 100;
}
@media (max-width: 420px) {
  .nav-bar {
    padding: 8px 16px;
  }
}
.nav-btn {
  flex: 1;
  text-align: center;
  padding: 10px;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-primary);
  background: var(--bg-elevated);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  position: relative;
  font-family: inherit;
  color: var(--text-primary);
  -webkit-appearance: none;
  appearance: none;
}
.nav-btn.active {
  border-color: var(--accent);
  color: var(--accent);
}
.nav-btn:active { transform: scale(0.96); }

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  padding: 0 5px;
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.badge.show {
  display: flex;
  animation: badgePop 200ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.badge.bump {
  animation: badgeBump 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes badgePop {
  from { transform: scale(0); }
  to { transform: scale(1); }
}
@keyframes badgeBump {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* 地图按钮浮层 */
.map-btn-wrap {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.map-btn-wrap .nav-btn {
  width: 100%;
}
.map-prompt {
  position: absolute;
  bottom: calc(100% + 8px);
  white-space: nowrap;
  padding: 6px 14px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--accent), #b8432a);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(142, 42, 43, 0.35);
  z-index: 10;
  font-family: inherit;
  transition: 0.15s;
  user-select: none;
}
.map-prompt::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--accent);
}
.map-prompt:active {
  transform: scale(0.95);
}

/* 浮层弹出动画 */
.prompt-pop-enter-active {
  animation: promptIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.prompt-pop-leave-active {
  animation: promptOut 250ms ease-in;
}
@keyframes promptIn {
  0% { opacity: 0; transform: translateY(12px) scale(0.85); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes promptOut {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(8px) scale(0.9); }
}
</style>
