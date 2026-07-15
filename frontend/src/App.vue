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
        <!-- ===== 引导区 ===== -->
        <div class="hero-section">
          <div class="hero-card">
            <p class="hero-eyebrow">· 非遗映象 ·</p>
            <h2 class="hero-title">上传照片，<br>AI 生成非遗艺术卡牌</h2>
            <p class="hero-desc">千年技艺，一瞬再现。将你的照片转化为苗族银饰、敦煌壁画、清宫华服等非遗风格的收藏卡牌，每一张都是独一无二的文化印记。</p>
            <button
              class="hero-cta"
              :class="{ 'cta-ready': store.canGenerate }"
              @click="handleHeroCTA"
            >
              <template v-if="!store.uploadImage">
                📸 上传照片开始创作
              </template>
              <template v-else-if="!store.selectedStyle">
                🎨 选择非遗风格
              </template>
              <template v-else>
                ✨ 生成非遗作品
              </template>
            </button>
          </div>
        </div>

        <!-- ===== 上传区域 ===== -->
        <div ref="uploadRef" id="uploadSection">
          <UploadZone @uploaded="onImageUploaded" />
        </div>

        <!-- ===== 视觉分隔 ===== -->
        <div class="section-divider">
          <span class="sd-line"></span>
          <span class="sd-dot">✦</span>
          <span class="sd-line"></span>
        </div>

        <!-- ===== 风格选择区 ===== -->
        <div class="style-section" :class="{ 'style-pulse': showStylePulse }" id="styleSection">
          <div class="section-title">
            选择非遗风格 <span class="section-label">点击一种，开启文化之旅</span>
          </div>
          <StyleCarousel />
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
            <template v-if="!store.uploadImage">📸 先上传照片</template>
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
import { ref, computed } from 'vue'
import { useGameStore } from './stores/gameStore.js'

import HeaderBar from './components/HeaderBar.vue'
import ResoBar from './components/ResoBar.vue'
import StyleCarousel from './components/StyleCarousel.vue'
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

/** 共鸣条显示的风格 ID：图鉴详情时用当前浏览风格，其余用选中风格 */
const resoStyleId = computed(() => {
  if (store.viewState === 'galleryDetail' && store.detailStyleId) {
    return store.detailStyleId
  }
  return store.selectedStyle
})

/* ====== 引导区 ====== */
const uploadRef = ref(null)
const showStylePulse = ref(false)

function scrollToUpload() {
  const el = document.getElementById('uploadSection')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function handleHeroCTA() {
  if (store.canGenerate) {
    // 照片+风格已就绪 → 直接生成，无需滚动到底部
    handleGenerate()
  } else if (!store.uploadImage) {
    // 还没上传照片 → 引导上传
    scrollToUpload()
  } else {
    // 已上传但还没选风格 → 引导选风格
    const el = document.getElementById('styleSection')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function onImageUploaded() {
  // 自动滚动到风格选择区
  setTimeout(() => {
    const el = document.getElementById('styleSection')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
  // 呼吸动画提示
  showStylePulse.value = true
  setTimeout(() => { showStylePulse.value = false }, 4000)
}

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

  // API 返回了，通知锻造动画从 95% 继续推进
  forgeApiDone.value = true
}

function onForgeComplete() {
  showForge.value = false
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
  gap: var(--space-xl);
}

/* 引导区 */
.hero-section {
  padding: 4px 0 0;
}
.hero-card {
  background: linear-gradient(135deg, var(--bg-elevated) 0%, #f7f0e6 100%);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 28px 20px 24px;
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
  margin: 0 0 20px;
  max-width: 340px;
  margin-left: auto;
  margin-right: auto;
}
.hero-cta {
  width: 100%;
  background: linear-gradient(135deg, var(--accent), #b8432a);
  color: #fff;
  border: none;
  border-radius: var(--radius-lg);
  padding: 18px 24px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(142, 42, 43, 0.25);
}
.hero-cta:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(142, 42, 43, 0.15);
}
/* 可生成状态：视觉上更突出，暗示"可以点了" */
.hero-cta.cta-ready {
  background: linear-gradient(135deg, var(--accent), #9e2a2b);
  box-shadow: 0 6px 24px rgba(142, 42, 43, 0.45);
  animation: ctaBreathe 2.5s ease-in-out infinite;
}
.hero-cta.cta-ready:active {
  transform: scale(0.96);
  box-shadow: 0 3px 12px rgba(142, 42, 43, 0.25);
}
@keyframes ctaBreathe {
  0%, 100% { box-shadow: 0 6px 24px rgba(142, 42, 43, 0.45); transform: scale(1); }
  50% { box-shadow: 0 8px 32px rgba(142, 42, 43, 0.60); transform: scale(1.02); }
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

/* 上传后呼吸动画：提示"选一个风格" */
.style-pulse {
  animation: pulseHint 4s ease-in-out;
}
@keyframes pulseHint {
  0%, 100% { opacity: 1; }
  10% { opacity: 0.6; }
  20% { opacity: 1; }
  30% { opacity: 0.7; }
  40% { opacity: 1; }
  50% { opacity: 0.8; }
  60% { opacity: 1; }
  70%, 100% { opacity: 1; }
}

/* 生成按钮 */
.btn-gen {
  background: var(--accent);
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
}
.btn-gen:active { transform: scale(0.97); opacity: 0.9; }
.btn-gen:disabled {
  background: var(--text-tertiary);
  cursor: default;
  opacity: 0.5;
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
