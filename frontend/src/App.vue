<template>
  <div class="app">
    <!-- ===== 全局头栏（所有视图共享） ===== -->
    <div class="app-header">
      <HeaderBar />
      <ResoBar />
    </div>

    <!-- ===== 主视图 ===== -->
    <template v-if="store.viewState === 'main'">
      <div class="main-view">
        <StyleCarousel />
        <UploadZone />
        <StyleGrid />
        <ParamControls />
        <RarityPreview />

        <!-- 生成按钮 -->
        <button
          class="btn-gen"
          :class="store.generateState"
          :disabled="!store.canGenerate"
          @click="handleGenerate"
        >
          <template v-if="store.generateState === 'idle'">
            ✨ 生成非遗作品
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

    <!-- ===== 底部导航 ===== -->
    <NavBar />

    <!-- ===== 错误提示 ===== -->
    <transition name="fade">
      <div v-if="store.errorMessage" class="error-toast">
        {{ store.errorMessage }}
      </div>
    </transition>

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
  </div>
</template>

<script setup>
import { ref } from 'vue'
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
import ToastNotice from './components/ToastNotice.vue'

const store = useGameStore()

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
  padding: var(--space-md) var(--space-md) var(--space-xl);
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

/* 错误提示 */
.error-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: #fff;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 300;
  max-width: 90%;
  text-align: center;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.app-header {
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
