<template>
  <div class="nav-bar">
    <button
      class="nav-btn"
      :class="{ active: store.viewState === 'main' }"
      @click="store.showMain()"
    >
      🏠 主页
    </button>

    <button
      class="nav-btn map-btn"
      :class="{ active: store.viewState === 'map' }"
      @click="store.showMap()"
    >
      🗺️ 地图
      <!-- 药丸形晃动提示（收藏后新点亮时显示） -->
      <transition name="map-pill">
        <span v-if="showMapPill" class="map-pill">地图已更新</span>
      </transition>
      <!-- 红点（未查看时显示） -->
      <span
        v-if="store.hasMapUpdate && store.viewState !== 'map'"
        class="map-dot"
      ></span>
    </button>

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
const showMapPill = ref(false)
let pillTimer = null

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

// 监听地图更新：收藏后如果点亮了新风格，显示药丸提示
watch(
  () => store.mapUnviewedCount,
  (newVal, oldVal) => {
    if (newVal > oldVal && store.viewState !== 'map') {
      // 新点亮了，显示药丸提示
      showMapPill.value = true
      if (pillTimer) clearTimeout(pillTimer)
      pillTimer = setTimeout(() => {
        showMapPill.value = false
      }, 2500)
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

/* 地图按钮（药丸提示的定位参考） */
.map-btn {
  overflow: visible;
}

/* 药丸形晃动提示 */
.map-pill {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  background: linear-gradient(135deg, var(--accent-gold), #e8c060);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(212,168,83,0.4);
  animation: pill-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.map-pill::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: var(--accent-gold);
  border-radius: 1px;
}

@keyframes pill-bounce {
  0% { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.8); }
  60% { opacity: 1; transform: translateX(-50%) translateY(-4px) scale(1.05); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}

.map-pill-enter-active {
  animation: pill-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.map-pill-leave-active {
  transition: all 0.3s ease;
}
.map-pill-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px) scale(0.9);
}

/* 红点提示 */
.map-dot {
  position: absolute;
  top: 6px;
  right: calc(50% - 24px);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff3b30;
  border: 1.5px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  animation: dot-pulse 1.5s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

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
</style>
