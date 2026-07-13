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
  display: flex;
  gap: 8px;
  position: sticky;
  bottom: 0;
  padding: 8px 0;
  background: var(--bg-primary);
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
</style>
