<template>
  <div class="style-carousel" ref="carouselRef">
    <div
      class="carousel-track"
      ref="trackRef"
      :class="{ grabbing: isGrabbing }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
      @dragstart.prevent
    >
      <div
        v-for="(s, i) in styles"
        :key="s.id"
        class="carousel-slide"
        :class="'bg-' + s.id"
        :data-index="i"
        @click="jumpToStyle(s.id)"
      >
        <div class="cs-overlay"></div>
        <span class="cs-name">{{ s.name }}</span>
        <span class="cs-tag">{{ s.heritage }}</span>
        <span class="cs-hint">点击选择 ✦</span>
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
const isGrabbing = ref(false)
let autoTimer = null

// 滑动状态
const SWIPE_THRESHOLD = 50
let dragStartX = 0
let dragStartY = 0
let dragDeltaX = 0
let isDragging = false

function goTo(idx) {
  currentIdx.value = idx
  if (trackRef.value) {
    trackRef.value.style.transition = 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    trackRef.value.style.transform = `translateX(-${idx * 100}%)`
  }
}

function jumpToStyle(id) {
  store.selectStyle(id)
  const el = document.getElementById('styleSection')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

// 边界限制：首尾完全锁定，不允许任何越界拖动
function clampDrag(dx) {
  const max = styles.length - 1
  if (currentIdx.value === 0 && dx > 0) return 0
  if (currentIdx.value === max && dx < 0) return 0
  return dx
}

/* ===== 触摸滑动 ===== */
function onTouchStart(e) {
  isGrabbing.value = true
  dragStartX = e.touches[0].clientX
  dragStartY = e.touches[0].clientY
  dragDeltaX = 0
  isDragging = false
  stopAuto()
  if (trackRef.value) trackRef.value.style.transition = 'none'
}

function onTouchMove(e) {
  const dx = e.touches[0].clientX - dragStartX
  const dy = Math.abs(e.touches[0].clientY - dragStartY)
  // 纵向滑动（超过 30px）视为滚动，不触发轮播切换
  if (dy > 30 && Math.abs(dx) < dy) return
  if (Math.abs(dx) > 10) isDragging = true
  const clamped = clampDrag(dx)
  dragDeltaX = clamped
  if (trackRef.value) {
    trackRef.value.style.transform = `translateX(calc(-${currentIdx.value * 100}% + ${clamped}px))`
  }
}

function onTouchEnd() {
  isGrabbing.value = false
  if (!isDragging) {
    startAuto()
    return
  }
  if (Math.abs(dragDeltaX) >= SWIPE_THRESHOLD) {
    const dir = dragDeltaX > 0 ? -1 : 1
    const next = Math.max(0, Math.min(styles.length - 1, currentIdx.value + dir))
    goTo(next)
  } else {
    goTo(currentIdx.value)
  }
  isDragging = false
  startAuto()
}

/* ===== 鼠标拖拽 ===== */
let mouseUpHandler = null
let mouseMoveHandler = null

function onMouseDown(e) {
  isGrabbing.value = true
  dragStartX = e.clientX
  dragDeltaX = 0
  isDragging = false
  stopAuto()
  if (trackRef.value) trackRef.value.style.transition = 'none'

  mouseMoveHandler = (ev) => {
    const dx = ev.clientX - dragStartX
    if (Math.abs(dx) > 10) isDragging = true
    const clamped = clampDrag(dx)
    dragDeltaX = clamped
    if (trackRef.value) {
      trackRef.value.style.transform = `translateX(calc(-${currentIdx.value * 100}% + ${clamped}px))`
    }
  }
  mouseUpHandler = () => {
    document.removeEventListener('mousemove', mouseMoveHandler)
    document.removeEventListener('mouseup', mouseUpHandler)
    isGrabbing.value = false
    if (!isDragging) { startAuto(); return }
    if (Math.abs(dragDeltaX) >= SWIPE_THRESHOLD) {
      const dir = dragDeltaX > 0 ? -1 : 1
      const next = Math.max(0, Math.min(styles.length - 1, currentIdx.value + dir))
      goTo(next)
    } else {
      goTo(currentIdx.value)
    }
    isDragging = false
    startAuto()
  }
  document.addEventListener('mousemove', mouseMoveHandler)
  document.addEventListener('mouseup', mouseUpHandler)
}

/* ===== 自动轮播 ===== */
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
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.carousel-track {
  display: flex;
  transition: transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: var(--radius-md);
  cursor: grab;
  user-select: none;
}
.carousel-track.grabbing {
  cursor: grabbing;
}
.carousel-slide {
  min-width: 100%;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 0 20px;
  cursor: pointer;
  user-select: none;
  position: relative;
  background-size: 140%;
  background-position: 30% 20%;
}
.carousel-slide.bg-miao_silver { background-image: url('/images/苗族_古典_横版.jpg'); }
.carousel-slide.bg-court_dress { background-image: url('/images/清宫华服_古典_横版.jpg'); }
.carousel-slide.bg-dunhuang { background-image: url('/images/敦煌_艺术_横版.jpg'); }
.cs-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%);
  z-index: 1;
}
.cs-name {
  font-size: 17px; font-weight: 700;
  color: #fff;
  font-family: var(--font-display);
  position: relative; z-index: 2;
  text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  line-height: 1.4;
}
.cs-tag {
  font-size: 12px; color: rgba(255,255,255,0.9);
  font-weight: 500;
  position: relative; z-index: 2;
  text-shadow: 0 1px 6px rgba(0,0,0,0.5);
  margin-top: 4px;
}
.cs-hint {
  font-size: 10px; color: rgba(255,255,255,0.6);
  font-weight: 500;
  position: relative; z-index: 2;
  text-shadow: 0 1px 4px rgba(0,0,0,0.4);
  margin-top: 8px;
}
.carousel-dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 6px;
  z-index: 3;
}
.cd-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: 0.2s;
}
.cd-dot.active {
  background: #fff;
  width: 16px;
  border-radius: 3px;
}
.cd-dot:hover { background: rgba(255,255,255,0.7); }

</style>
