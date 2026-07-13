<template>
  <div class="gallery">
    <!-- ===== 总览：按风格分组 ===== -->
    <div v-if="!store.detailStyleId">
      <div class="gallery-header">
        <button class="gallery-back" @click="store.showMain()">←</button>
        <span class="gallery-title">🏛️ 非遗图鉴</span>
        <span class="gallery-count">{{ countLabel }}</span>
        <button
          class="gallery-clear"
          title="清空所有数据"
          @click="showClearModal = true"
        >🗑️</button>
      </div>

      <template v-if="store.gallery.length === 0">
        <div class="gallery-empty">
          <div class="empty-seal">藏</div>
          <p>还没有收藏卡片</p>
          <span class="empty-hint">生成一张非遗作品后，点击「收入图鉴」来收集吧 ✨</span>
        </div>
      </template>

      <div v-else class="gallery-grid">
        <div
          v-for="(items, sid) in store.galleryByStyle"
          :key="sid"
          class="gallery-item"
          :style="{ '--idx': styleIndex(sid) }"
          @click="openDetail(sid)"
        >
          <div class="gi-img" :style="{ background: tileBg(items) }">
            <div class="gi-paper"></div>
            <span class="gi-emoji">{{ styleEmoji(items) }}</span>
            <div class="gi-rarity-bar" :style="{ background: bestColor(items) }"></div>
          </div>
          <div class="gi-info">
            <div class="gi-style">{{ styleName(items) }}</div>
            <div class="gi-meta">
              <span class="gi-count">{{ items.length }} 张</span>
              <span class="gi-best" :style="{ color: bestColor(items) }">
                {{ bestLabel(items) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 详情：某风格全部卡片（3:4 缩略） ===== -->
    <div v-else>
      <div class="gallery-header">
        <button class="gallery-back" @click="store.detailStyleId = null">← 返回</button>
        <span class="gallery-title" id="detailTitle">{{ detailTitle }}</span>
        <span class="gallery-count">{{ store.detailCards.length }} 张</span>
      </div>

      <div class="detail-grid">
        <div
          v-for="(card, i) in store.detailCards"
          :key="card.id || i"
          class="detail-card"
          :style="{ '--idx': i, borderTop: `3px solid ${rarityColor(card.rarity)}` }"
          @click="openCard(card, store.detailStyleId, i)"
        >
          <div class="dc-img">
            <div class="dc-paper"></div>
            <img
              v-if="card.image"
              :src="card.image.startsWith('data:') ? card.image : 'data:image/png;base64,' + card.image"
              class="dc-real-img"
            />
            <span v-else class="dc-placeholder">{{ styleEmojiOf(store.detailStyleId) }}</span>
            <span class="dc-index">#{{ i + 1 }}</span>
            <div class="dc-rarity-tag" :style="{ background: rarityColor(card.rarity) }">
              {{ rarityAbbr(card.rarity) }}
            </div>
          </div>
          <div class="dc-footer">
            <span class="dc-resonance">共鸣 Lv.{{ card.resonance ?? 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 清空确认弹窗 ===== -->
    <ConfirmModal
      :visible="showClearModal"
      title="清空确认"
      message="确定清空所有收藏数据？此操作不可撤销。"
      confirm-text="确认清空"
      cancel-text="取消"
      @confirm="onClearConfirm"
      @cancel="showClearModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore.js'
import { getStyleById } from '../data/styles.js'
import {
  RARITY_ABBR,
  RARITY_COLORS,
  RARITY_NAMES,
} from '../data/constants.js'
import ConfirmModal from './ConfirmModal.vue'

const store = useGameStore()
const emit = defineEmits(['viewCard'])
const showClearModal = ref(false)

function rarityColor(rarity) {
  return RARITY_COLORS[rarity] || '#8a8580'
}
function rarityAbbr(rarity) {
  return RARITY_ABBR[rarity] || '清赏'
}

const countLabel = computed(() => {
  const styleCount = store.galleryStyleCount
  const totalCards = store.gallery.length
  return `${styleCount} 种 · ${totalCards} 张`
})

const detailTitle = computed(() => {
  const style = getStyleById(store.detailStyleId)
  if (!style) return '未知 · 共 0 张'
  return `${style.emoji} ${style.name} · 共 ${store.detailCards.length} 张`
})

function styleIndex(sid) {
  const list = Object.keys(store.galleryByStyle)
  return list.indexOf(sid)
}

/* ====== 总览辅助 ====== */
function bestRarity(items) {
  return Math.max(...items.map((i) => i.rarity))
}
function bestColor(items) {
  return rarityColor(bestRarity(items))
}
function bestLabel(items) {
  const r = bestRarity(items)
  return RARITY_ABBR[r] || '清赏'
}
function styleEmoji(items) {
  const style = getStyleById(items[0]?.style)
  return style?.emoji || '🏮'
}
function styleName(items) {
  const style = getStyleById(items[0]?.style)
  return style?.name || '未知'
}
function styleEmojiOf(styleId) {
  const style = getStyleById(styleId)
  return style?.emoji || '🏮'
}
function tileBg(items) {
  const style = getStyleById(items[0]?.style)
  return style?.gradient || 'linear-gradient(135deg, #e8e0d4, #f5f0e8)'
}

/* ====== 动作 ====== */
function openDetail(styleId) {
  store.showGalleryDetail(styleId)
}
function openCard(card, styleId, index) {
  store.currentResult = {
    rarity: card.rarity,
    image: card.image,
    prompt: card.prompt || '',
    style: card.style,
    mock: false,
  }
  store.viewingStyleId = styleId
  emit('viewCard', { card, styleId, index })
}
function onClearConfirm() {
  showClearModal.value = false
  store.clearGalleryData()
}
</script>

<style scoped>
.gallery { padding-bottom: 16px; }

/* ====== 头部 ====== */
.gallery-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.gallery-back {
  font-size: 20px;
  cursor: pointer;
  background: none;
  border: none;
  padding: 4px 8px;
  font-family: inherit;
  transition: 0.15s;
  border-radius: var(--radius-sm);
}
.gallery-back:hover { background: var(--border-light); }
.gallery-back:active { transform: scale(0.92); }
.gallery-title {
  font-size: 16px;
  font-weight: 700;
  flex: 1;
  font-family: var(--font-display);
}
.gallery-count { font-size: 12px; color: var(--text-secondary); }
.gallery-clear {
  font-size: 16px;
  cursor: pointer;
  background: none;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  opacity: 0.5;
  transition: 0.2s;
  font-family: inherit;
  line-height: 1;
}
.gallery-clear:hover {
  opacity: 1;
  border-color: var(--accent);
  color: var(--accent);
}

/* ====== 总览网格（1排2个1:1方砖） ====== */
.gallery-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.gallery-item {
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
  animation: tileEnter 400ms var(--ease-out) both;
  animation-delay: calc(var(--idx, 0) * 60ms);
}
.gallery-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.gallery-item:active { transform: scale(0.97); }
@keyframes tileEnter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.gi-img {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  position: relative;
  overflow: hidden;
}
.gi-paper {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
  background-size: 400px 400px;
  mix-blend-mode: multiply;
  pointer-events: none;
}
.gi-emoji { position: relative; z-index: 1; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15)); }
.gi-rarity-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  z-index: 2;
}
.gi-info { padding: 10px; text-align: left; }
.gi-style {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}
.gi-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.gi-count { font-size: 10px; color: var(--text-tertiary); }
.gi-best { font-size: 10px; font-weight: 600; }

/* ====== 空状态 ====== */
.gallery-empty {
  text-align: center;
  padding: 48px 16px;
}
.empty-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--silver);
  color: var(--text-secondary);
  font-size: 22px;
  font-weight: 700;
  font-family: var(--font-display);
  margin-bottom: 14px;
  border: 2px solid var(--border-primary);
}
.gallery-empty p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.empty-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* ====== 详情网格（3:4 卡片） ====== */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.detail-card {
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
  animation: cardEnter 400ms var(--ease-out) both;
  animation-delay: calc(var(--idx, 0) * 50ms);
}
.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
.detail-card:active { transform: scale(0.97); }
@keyframes cardEnter {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dc-img {
  aspect-ratio: 3/4;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: var(--silver);
}
.dc-paper {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  background-size: 400px 400px;
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: 1;
}
.dc-real-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 2;
}
.dc-placeholder {
  font-size: 36px;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
}
.dc-index {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  z-index: 3;
}
.dc-rarity-tag {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 2px 8px;
  border-radius: 6px;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  z-index: 3;
  letter-spacing: 0.05em;
}

.dc-footer {
  padding: 8px 10px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border-light);
}
.dc-resonance {
  font-size: 10px;
  color: var(--text-tertiary);
}
</style>
