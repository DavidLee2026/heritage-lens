<template>
  <div class="app">
    <!-- ===== 全局头栏（所有视图共享） ===== -->
    <div class="app-header">
      <HeaderBar @about="aboutVisible = true" />
    </div>

    <!-- ===== 共鸣条（所有视图共享：主页用选中风格，图鉴详情用当前浏览风格） ===== -->
    <ResoBar
      v-if="store.gallery.length > 0"
      :style-id="resoStyleId"
    />

    <!-- ===== 主视图 ===== -->
    <template v-if="store.viewState === 'main'">

      <div class="main-view">
        <!-- ===== 引导区（标题介绍 + 上传合并） ===== -->
        <div class="hero-section">
          <div class="hero-card">
            <p class="hero-eyebrow">· 非遗映象 ·</p>
            <h2 class="hero-title">上传照片，<br>AI 生成非遗艺术卡牌</h2>
            <p class="hero-desc">千年技艺，一瞬再现。将你的照片转化为苗族银饰、敦煌壁画、清宫华服等非遗风格的收藏卡牌，每一张都是独一无二的文化印记。</p>
            <UploadZone @uploaded="onImageUploaded" />
          </div>
        </div>

        <!-- ===== 风格选择区（奈飞式沉浸浏览） ===== -->
        <div class="style-section" :class="{ 'style-pulse': showStylePulse }">
          <div class="section-title">
            选择非遗风格 <span class="section-label">滑动浏览，点击选择</span>
          </div>
          <StyleGrid />
        </div>
        <ParamControls />
        <RarityPreview />

        <!-- 生成按钮 -->
        <button
          class="btn-gen"
          :class="[store.generateState, { 'btn-breathe': store.canGenerate && store.generateState === 'idle' }]"
          :disabled="!store.canGenerate"
          @click="handleGenerate"
        >
          <template v-if="store.generateState === 'idle'">
            <template v-if="store.quotaRemaining === 0">⛔ 今日已达上限</template>
            <template v-else-if="!store.uploadImage">📸 先上传照片</template>
            <template v-else-if="!store.selectedStyle">🎨 先选择风格</template>
            <template v-else>✨ 生成非遗作品</template>
          </template>
          <template v-else-if="store.isGenerating">
            <span class="btn-loading">
              <span class="spinner"></span>
              意境融合中…
            </span>
          </template>
          <template v-else-if="store.generateState === 'done'">
            ✨ 再次生成
          </template>
          <template v-else>
            ⚠️ 重试生成
          </template>
        </button>
      </div>
    </template>

    <!-- ===== 图鉴视图 ===== -->
    <template v-else-if="store.viewState === 'gallery' || store.viewState === 'galleryDetail'">
      <GalleryView @view-card="onViewCardFromGallery" />
    </template>

    <!-- ===== 地图视图 ===== -->
    <template v-else-if="store.viewState === 'map'">
      <MapView />
    </template>

    <!-- ===== 底部导航 ===== -->
    <NavBar />

    <!-- ===== Toast 通知 ===== -->
    <teleport to="body">
      <transition name="toast-slide">
        <div v-if="store.toastMessage" class="app-toast" :class="'toast-' + store.toastType">
          <span class="toast-icon">{{ { success: '✅', error: '⚠️', info: '💡' }[store.toastType] }}</span>
          {{ store.toastMessage }}
        </div>
      </transition>
    </teleport>

    <!-- ===== 锻造动画叠加层 ===== -->
    <ForgeOverlay
      :visible="showForge"
      :style-id="store.selectedStyle"
      :api-done="forgeApiDone"
      @complete="onForgeComplete"
    />

    <!-- ===== 卡牌揭晓叠加层 ===== -->
    <CardReveal
      :visible="showCard"
      :is-fresh-result="isFreshCard"
      :submitting="submitting"
      @close="onCardClose"
      @collect="onResonanceUpgrade"
      @regen="regenAfterCollect"
    />

    <!-- ===== 共鸣升级 Toast ===== -->
    <ToastNotice
      :level="upgradeLevel"
      @done="upgradeLevel = 0"
    />

    <!-- ===== 关于弹窗 ===== -->
    <AboutModal
      :visible="aboutVisible"
      @close="aboutVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGameStore } from './stores/gameStore.js'

import HeaderBar from './components/HeaderBar.vue'
import ResoBar from './components/ResoBar.vue'
import UploadZone from './components/UploadZone.vue'
import StyleGrid from './components/StyleGrid.vue'
import ParamControls from './components/ParamControls.vue'
import RarityPreview from './components/RarityPreview.vue'
import NavBar from './components/NavBar.vue'
import ForgeOverlay from './components/ForgeOverlay.vue'
import CardReveal from './components/CardReveal.vue'
import GalleryView from './components/GalleryView.vue'
import MapView from './components/MapView.vue'
import ToastNotice from './components/ToastNotice.vue'
import AboutModal from './components/AboutModal.vue'

const store = useGameStore()
const aboutVisible = ref(false)

/** 共鸣条显示的风格 ID */
const resoStyleId = computed(() => {
  if (store.viewState === 'galleryDetail' && store.detailStyleId) {
    return store.detailStyleId
  }
  return store.selectedStyle
})

/* ====== 引导区动画 ====== */
const showStylePulse = ref(false)

function scrollToStyle() {
  const el = document.getElementById('styleSection')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    showStylePulse.value = true
    setTimeout(() => { showStylePulse.value = false }, 3000)
  }
}

/** 上传照片后：自动滑到风格选择区 */
function onImageUploaded() {
  setTimeout(() => scrollToStyle(), 300)
}

/**
 * 选好风格后：自动滑到页面底部生成按钮
 */
watch(() => store.selectedStyle, (newId) => {
  if (newId && store.uploadImage) {
    setTimeout(() => {
      const el = document.querySelector('.btn-gen')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('btn-highlight')
        setTimeout(() => el.classList.remove('btn-highlight'), 2000)
      }
    }, 350)
  }
})

/* ====== 叠加层状态 ====== */
const showForge = ref(false)
const forgeApiDone = ref(false)
const showCard = ref(false)
const isFreshCard = ref(true)
const upgradeLevel = ref(0)
const submitting = ref(false)   // 🛡️ 防连击锁

/* ====== 生成流程 ====== */
async function handleGenerate() {
  if (submitting.value || !store.canGenerate) return
  submitting.value = true

  showForge.value = true
  forgeApiDone.value = false

  const result = await store.generate()

  // ⛔ 限额已满：直接关闭锻造动画，不走卡牌弹窗
  if (result && result.quotaExceeded) {
    showForge.value = false
    submitting.value = false
    return
  }

  // API 返回了，通知锻造动画从 95% 继续推进
  forgeApiDone.value = true
}

function onForgeComplete() {
  showForge.value = false
  // 🛡 安全守卫：没有生成结果（如网络断开后重试）→ 不弹卡牌
  if (!store.currentResult) {
    if (submitting.value) submitting.value = false
    return
  }
  // 自动收藏到图鉴（notify=false 不触发红点，等用户点按钮才触发）
  const upgraded = store.collectResult(false)
  if (upgraded) {
    upgradeLevel.value = upgraded   // 触发共鸣升级 toast
  }
  submitting.value = false     // 🔓 解锁
  isFreshCard.value = true
  showCard.value = true
}

function onCardClose() {
  showCard.value = false
  isFreshCard.value = false
  if (store.viewState !== 'main') {
    // 如果是从图鉴打开的，回到图鉴
  }
}

function onResonanceUpgrade(level) {
  if (level && level > 0) {
    upgradeLevel.value = level
  }
}

function regenAfterCollect() {
  if (submitting.value) return // 🛡️ 已在生成中则忽略
  showCard.value = false
  setTimeout(() => handleGenerate(), 300)
}

/* ====== 图鉴查看卡片 ====== */
function onViewCardFromGallery() {
  isFreshCard.value = false
  showCard.value = true
}
</script>

<style scoped>
.app {
  max-width: 420px;
  margin: 0 auto;
  padding: var(--space-md) var(--space-md) 76px;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.main-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* 引导区 */
.hero-section {
  padding: 4px 0 0;
}
.hero-card {
  background: linear-gradient(135deg, var(--bg-elevated) 0%, #f7f0e6 100%);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 24px 16px 20px;
  text-align: center;
}
.hero-eyebrow {
  font-size: 11px;
  color: var(--accent-gold);
  font-weight: 500;
  letter-spacing: 4px;
  margin: 0 0 10px;
  text-transform: uppercase;
}
.hero-title {
  font-size: 22px;
  font-weight: 800;
  font-family: var(--font-display);
  color: var(--text-primary);
  margin: 0 0 12px;
  line-height: 1.35;
}
.hero-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 16px;
  max-width: 340px;
  margin-left: auto;
  margin-right: auto;
}

/* 视觉分隔 */
.section-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 0;
}
.sd-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-primary), transparent);
}
.sd-dot {
  font-size: 10px;
  color: var(--border-primary);
  line-height: 1;
}

/* 风格选择区 */
.style-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}
.section-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 400;
}

/* 风格区高亮脉冲 */
.style-pulse {
  animation: sectionPulse 2.5s ease-in-out;
}
@keyframes sectionPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  25% { opacity: 0.85; transform: scale(0.985); }
  50% { opacity: 1; transform: scale(1.005); }
  75% { opacity: 0.9; transform: scale(0.99); }
}

/* 生成按钮高亮提示 */
.btn-highlight {
  animation: btnPulse 2s ease-in-out;
}
@keyframes btnPulse {
  0%, 100% { box-shadow: 0 4px 14px rgba(142, 42, 43, 0.25); transform: scale(1); }
  30% { box-shadow: 0 8px 32px rgba(142, 42, 43, 0.55); transform: scale(1.03); }
  60% { box-shadow: 0 6px 24px rgba(142, 42, 43, 0.45); transform: scale(1.01); }
}

/* 生成按钮 */
.btn-gen {
  background: linear-gradient(135deg, #8e2a2b 0%, #b8432a 100%);
  color: #fff;
  border: none;
  border-radius: var(--radius-lg);
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  width: 100%;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(142, 42, 43, 0.25);
}
.btn-gen:active { transform: scale(0.97); opacity: 0.9; }
.btn-gen:disabled {
  /* 禁用态也用红色渐变，只是降低透明度 */
  background: linear-gradient(135deg, #8e2a2b 0%, #b8432a 100%);
  cursor: default;
  opacity: 0.4;
  box-shadow: none;
}
.btn-gen.btn-breathe {
  animation: breatheGen 2.5s ease-in-out infinite;
}
@keyframes breatheGen {
  0%, 100% {
    box-shadow: 0 4px 14px rgba(142, 42, 43, 0.25);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 6px 24px rgba(142, 42, 43, 0.45);
    transform: scale(1.02);
  }
}
.btn-gen.error {
  background: linear-gradient(135deg, #b85450 0%, #9e2a2b 100%);
}
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Toast 通知（三态：成功 / 错误 / 信息） */
.app-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
  z-index: 500;
  max-width: 88%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  pointer-events: none;
  backdrop-filter: blur(6px);
}
.toast-icon { font-size: 16px; }
.app-toast.toast-success {
  background: rgba(56, 142, 60, 0.92);
  color: #fff;
}
.app-toast.toast-error {
  background: rgba(198, 40, 40, 0.92);
  color: #fff;
}
.app-toast.toast-info {
  background: rgba(66, 66, 66, 0.88);
  color: #fff;
}
.toast-slide-enter-active {
  transition: all 300ms ease-out;
}
.toast-slide-leave-active {
  transition: all 250ms ease-in;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-16px);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-16px);
}
.app-header {
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
