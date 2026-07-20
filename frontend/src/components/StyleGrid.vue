<template>
  <div class="immersive-area" id="styleSection">
    <!-- ===== 背景大图：撑满整个区域 ===== -->
    <div class="bg-layer" :style="{ backgroundImage: 'url(' + bannerUrl(displayStyle) + ')' }">
      <div class="bg-overlay"></div>
      <!-- 背景上的风格信息 -->
      <div class="bg-info">
        <span class="bg-name">{{ displayStyleData?.name }}</span>
        <span class="bg-heritage">{{ displayStyleData?.heritage }}</span>
        <span class="bg-desc">{{ displayStyleData?.desc }}</span>
      </div>
    </div>

    <!-- ===== 左箭头 ===== -->
    <button
      v-if="canScrollLeft"
      class="nav-arrow nav-arrow-left"
      @click="scrollBy(-1)"
    >‹</button>

    <!-- ===== 16:9 横滑卡片行（浮在背景底部） ===== -->
    <div class="card-row-wrapper">
      <div class="card-row" ref="rowRef" @scroll="updateScrollState">
        <div
          v-for="s in styles"
          :key="s.id"
          class="mini-card"
          :class="{ active: store.selectedStyle === s.id, hover: hoveredStyle === s.id }"
          @mouseenter="hoveredStyle = s.id"
          @mouseleave="hoveredStyle = null"
          @click="onCardClick(s.id)"
        >
          <div class="mc-img" :style="{ backgroundImage: 'url(' + bannerUrl(s.id) + ')' }"></div>
          <div class="mc-overlay"></div>
          <span class="mc-name">{{ s.name }}</span>
          <span v-if="store.selectedStyle === s.id" class="mc-check">✓</span>
        </div>
      </div>
    </div>

    <!-- ===== 右箭头 ===== -->
    <button
      v-if="canScrollRight"
      class="nav-arrow nav-arrow-right"
      @click="scrollBy(1)"
    >›</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore.js'
import { STYLES, getStyleById } from '../data/styles.js'

const store = useGameStore()
const styles = STYLES
const hoveredStyle = ref(null)
const rowRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

/** 横版 banner 图映射 */
const BANNER_MAP = {
  miao_silver:    '/images/苗族_古典_横版.jpg',
  court_dress:    '/images/清宫华服_古典_横版.jpg',
  dunhuang:       '/images/敦煌_艺术_横版.jpg',
  tang_dynasty:   '/images/大唐服饰_古典_横版.jpg',
  ming_brocade:   '/images/大明风华_古典_横版.jpg',
  su_embroidery:  '/images/苏州刺绣_古典_横版.jpg',
  batik:          '/images/蜡染蓝韵_古典_横版.jpg',
  blue_porcelain: '/images/青花瓷纹_古典_横版.jpg',
  yi_costume:     '/images/彝族服饰_古典_横版.jpg',
  tibetan:        '/images/藏族文化_古典_横版.jpg',
  zhuang_brocade: '/images/壮族壮锦_古典_横版.jpg',
  ming_style:     '/images/明式风格_古典_横版.jpg',
}

function bannerUrl(id) {
  return BANNER_MAP[id] || ''
}

const displayStyle = computed(() => {
  return hoveredStyle.value || store.selectedStyle || styles[0].id
})

const displayStyleData = computed(() => {
  return getStyleById(displayStyle.value)
})

function onCardClick(id) {
  store.selectStyle(id)
}

/* ===== 横滑箭头逻辑 ===== */
function updateScrollState() {
  const el = rowRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function scrollBy(dir) {
  const el = rowRef.value
  if (!el) return
  el.scrollBy({ left: dir * 200, behavior: 'smooth' })
}

onMounted(() => {
  updateScrollState()
})
</script>

<style scoped>
/* ===== 沉浸式区域容器：背景大图撑满 ===== */
.immersive-area {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.12);
  height: 300px;
}

/* ===== 背景大图层：absolute 撑满整个容器 ===== */
.bg-layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 25%;
  transition: background-image 0.4s ease;
  z-index: 0;
}

/* 背景渐变遮罩 */
.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.1) 35%,
    rgba(0, 0, 0, 0.55) 70%,
    rgba(0, 0, 0, 0.8) 100%
  );
  z-index: 1;
}

/* 背景上的风格信息 */
.bg-info {
  position: absolute;
  bottom: 120px;
  left: 16px;
  right: 16px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.bg-name {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  font-family: var(--font-display);
  text-shadow: 0 2px 8px rgba(0,0,0,0.7);
  line-height: 1.3;
}
.bg-heritage {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  letter-spacing: 0.5px;
}
.bg-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 1px 4px rgba(0,0,0,0.4);
  margin-top: 2px;
}

/* ===== 左右箭头（与小卡片等高齐平） ===== */
.nav-arrow {
  position: absolute;
  bottom: 12px;
  width: 32px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s, transform 0.15s;
  font-family: inherit;
  line-height: 1;
}
.nav-arrow:hover {
  background: rgba(0, 0, 0, 0.7);
}
.nav-arrow:active {
  transform: scale(0.9);
}
.nav-arrow-left {
  left: 0;
  border-radius: 0 8px 8px 0;
}
.nav-arrow-right {
  right: 0;
  border-radius: 8px 0 0 8px;
}

/* ===== 16:9 横滑卡片行（浮在背景底部） ===== */
.card-row-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 5;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.4) 30%, rgba(0, 0, 0, 0.6) 100%);
  padding: 10px 0 12px;
}
.card-row {
  display: flex;
  gap: 8px;
  padding: 0 44px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  touch-action: pan-x;
}
.card-row::-webkit-scrollbar { display: none; }

/* 16:9 迷你卡片 */
.mini-card {
  position: relative;
  flex: 0 0 auto;
  width: 120px;
  height: 68px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  scroll-snap-align: start;
  transition: transform 0.2s var(--ease-out), border-color 0.2s;
  border: 2px solid transparent;
}
.mini-card:hover {
  transform: scale(1.1);
}
.mini-card:active {
  transform: scale(0.95);
}
.mini-card.active {
  border-color: var(--accent-gold);
  box-shadow: 0 2px 10px rgba(212, 168, 83, 0.5);
}
.mini-card.hover {
  border-color: rgba(255, 255, 255, 0.5);
}

.mc-img {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
}
.mc-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%);
}
.mini-card.active .mc-overlay {
  background: linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.5) 100%);
}

.mc-name {
  position: absolute;
  bottom: 4px;
  left: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.6);
  font-family: var(--font-display);
  z-index: 2;
}

.mc-check {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent-gold);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}
</style>
