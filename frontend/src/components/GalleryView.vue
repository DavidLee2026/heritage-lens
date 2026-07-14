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
          <div class="gi-img" :class="'bg-' + sid" :style="{ background: tileBg(items) }">
            <div class="gi-img-bg" :class="'bg-' + sid"></div>
            <div class="gi-paper"></div>
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

    <!-- ===== 详情：某风格全部卡片（设计规范 2.1） ===== -->
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
          :class="RARITY_CLASS[card.rarity]"
          :style="{ '--idx': i }"
          @click="openCard(card, store.detailStyleId, i)"
        >
          <div class="rarity-bar" :class="RARITY_CLASS[card.rarity]">
            <span class="rarity-label">{{ RARITY_NAMES[card.rarity] || '清赏 ✦' }}</span>
            <span class="style-emoji">{{ styleEmojiOf(card.style) }}</span>
          </div>
          <div class="card-img">
            <div class="quality-glow" :class="RARITY_CLASS[card.rarity]"></div>
            <img
              v-if="card.image"
              :src="card.image.startsWith('data:') ? card.image : 'data:image/png;base64,' + card.image"
              class="card-real-img"
            />
            <span v-else class="card-placeholder">{{ styleEmojiOf(card.style) }}</span>
          </div>
          <div class="card-footer">
            <span class="card-style-name">{{ styleNameOf(card.style) }}</span>
            <span class="card-resonance">共鸣 Lv.{{ card.resonance ?? 0 }}</span>
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
  RARITY_CLASS,
} from '../data/constants.js'
import ConfirmModal from './ConfirmModal.vue'

const store = useGameStore()
const emit = defineEmits(['viewCard'])
const showClearModal = ref(false)

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
  const r = bestRarity(items)
  return RARITY_COLORS[r] || '#8a8580'
}
function bestLabel(items) {
  const r = bestRarity(items)
  return RARITY_ABBR[r] || '清赏'
}
function styleName(items) {
  const style = getStyleById(items[0]?.style)
  return style?.name || '未知'
}
function styleEmojiOf(styleId) {
  const style = getStyleById(styleId)
  return style?.emoji || '🏮'
}
function styleNameOf(styleId) {
  const style = getStyleById(styleId)
  return style?.name || '未知'
}
function styleFullLabel(styleId) {
  const style = getStyleById(styleId)
  if (!style) return '未知'
  return `${style.name} · ${style.heritage}`
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
  color: var(--text-primary);
  -webkit-appearance: none;
  appearance: none;
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
.gi-img-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  z-index: 0;
  opacity: 0.5;
}
.gi-img-bg.bg-miao_silver { background-image: url('/heritage-lens/images/苗族_古典_竖版.jpg'); }
.gi-img-bg.bg-court_dress { background-image: url('/heritage-lens/images/清宫华服_古典_竖版.jpg'); }
.gi-img-bg.bg-dunhuang { background-image: url('/heritage-lens/images/敦煌_艺术_竖版.jpg'); }
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

/* ====== 详情网格（3:4 卡片，与 CardReveal 正面一致） ====== */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* --- 卡片容器（面对应 face-front） --- */
.detail-card {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
  animation: cardEnter 400ms var(--ease-out) both;
  animation-delay: calc(var(--idx, 0) * 50ms);
}
.detail-card.qingshang {
  background: #fcf9f4;
  border: 1px solid #d4cdc2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0, 0, 0, 0.03);
}
.detail-card.zhenshang {
  background: #fdfaf0;
  border: 1px solid #d4c095;
  box-shadow: 0 2px 6px rgba(168, 134, 42, 0.10), 0 6px 14px rgba(168, 134, 42, 0.06);
}
.detail-card.shenpin {
  background: #fcf5ec;
  border: 1.5px solid rgba(212, 168, 83, 0.35);
  box-shadow: 0 2px 8px rgba(212, 168, 83, 0.15), 0 8px 24px rgba(212, 168, 83, 0.10), 0 0 0 1.5px rgba(212, 168, 83, 0.10);
}
.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}
.detail-card:active { transform: scale(0.97); }
@keyframes cardEnter {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- 纸纹纹理 --- */
.detail-card .paper-texture { display: none; }

/* --- 稀有度栏（精简版） --- */
.detail-card .rarity-bar {
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}
.detail-card .rarity-bar.qingshang {
  background: linear-gradient(180deg, #e5dfd5, #dcd4c8);
  color: #7a7570;
  border-bottom: 1px solid #d0c8bc;
}
.detail-card .rarity-bar.zhenshang {
  background: linear-gradient(180deg, #faf1d0, #f3e6be);
  color: #9a7e28;
  border-bottom: 1px solid #e8d8a8;
}
.detail-card .rarity-bar.shenpin {
  background: linear-gradient(135deg, #f5e6e0 0%, #f5e6d8 30%, #f8edd0 60%, #f5e6e0 100%);
  color: #8e2a2b;
  border-bottom: 1px solid #e8d4c0;
}

/* --- 卡牌图片区（3:4） --- */
.detail-card .card-img {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 133.33%;
  overflow: hidden;
  z-index: 1;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
}
.detail-card.qingshang .card-img { background: #f7f4ee; }
.detail-card.zhenshang .card-img { background: linear-gradient(180deg, #fdfaf0 0%, #f8f2e4 50%, #faf4e8 100%); }
.detail-card.shenpin .card-img { background: linear-gradient(180deg, #fef9f0 0%, #faf3e8 30%, #f5ebe4 70%, #fcf4ee 100%); }

.detail-card .card-real-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}
.detail-card .card-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 36px;
  color: var(--text-tertiary);
  z-index: 1;
}

/* --- 品质辉光 --- */
.detail-card .quality-glow {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 3;
}
.detail-card.qingshang .quality-glow { display: none; }
.detail-card.zhenshang .quality-glow {
  background: radial-gradient(ellipse at 50% 30%, rgba(212,168,83,0.04) 0%, transparent 60%);
}
.detail-card.shenpin .quality-glow {
  background:
    radial-gradient(ellipse at 40% 30%, rgba(212,168,83,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 60%, rgba(158,42,43,0.03) 0%, transparent 40%);
}

/* --- 卡牌底栏（精简版） --- */
.detail-card .card-footer {
  padding: 6px 10px;
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}
.detail-card.qingshang .card-footer {
  background: #f7f4ee;
  border-top: 1px solid #e0dad0;
}
.detail-card.zhenshang .card-footer {
  background: #fdfaf0;
  border-top: 1px solid #ece0c4;
}
.detail-card.shenpin .card-footer {
  background: #fef9f0;
  border-top: 1px solid #e8d4c0;
}
.detail-card .card-style-name { font-weight: 600; font-size: 12px; color: var(--text-primary); }
.detail-card.qingshang .card-style-name { color: #7a7570; }
.detail-card.zhenshang .card-style-name { color: #9a7e28; }
.detail-card.shenpin .card-style-name { color: #8e2a2b; }
.detail-card .card-resonance { color: var(--text-secondary); font-size: 12px; }
.detail-card.zhenshang .card-resonance { color: #b8a46a; }
</style>
