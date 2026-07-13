<template>
  <div class="style-carousel" ref="carouselRef">
    <div class="carousel-track" ref="trackRef">
      <div
        v-for="(s, i) in styles"
        :key="s.id"
        class="carousel-slide"
        :data-index="i"
        @click="jumpToStyle(s.id)"
      >
        <span class="cs-icon">{{ s.emoji }}</span>
        <span class="cs-name">{{ s.name }}</span>
        <span class="cs-tag">{{ s.heritage }}</span>
      </div>
    </div>
    <div class="carousel-dots">
      <span
        v-for="(s, i) in styles"
        :key="i"
        class="cd-dot"
        :class="{ active: currentIdx === i }"
        @click="goTo(i)"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/gameStore.js'
import { STYLES } from '../data/styles.js'

const store = useGameStore()
const styles = STYLES

const trackRef = ref(null)
const currentIdx = ref(0)
let autoTimer = null

function goTo(idx) {
  currentIdx.value = idx
  if (trackRef.value) {
    trackRef.value.style.transform = `translateX(-${idx * 100}%)`
  }
}

function jumpToStyle(id) {
  store.selectStyle(id)
  // 滚动到风格选择区域
  const el = document.getElementById('styleSection')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function startAuto() {
  stopAuto()
  autoTimer = setInterval(() => {
    goTo((currentIdx.value + 1) % styles.length)
  }, 3500)
}

function stopAuto() {
  if (autoTimer) clearInterval(autoTimer)
  autoTimer = null
}

onMounted(() => startAuto())
onUnmounted(() => stopAuto())
</script>

<style scoped>
.style-carousel {
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.carousel-track {
  display: flex;
  transition: transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.carousel-slide {
  min-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 16px;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}
.cs-icon { font-size: 48px; display: block; }
.cs-name { font-size: 16px; font-weight: 700; color: var(--text-primary); font-family: var(--font-display); }
.cs-tag { font-size: 11px; color: var(--text-secondary); font-weight: 400; }
.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 0 0 12px 0;
}
.cd-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-primary);
  cursor: pointer;
  transition: 0.2s;
}
.cd-dot.active {
  background: var(--accent);
  width: 20px;
  border-radius: 4px;
}
.cd-dot:hover { background: var(--text-secondary); }
</style>
