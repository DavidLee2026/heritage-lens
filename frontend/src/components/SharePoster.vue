<template>
  <teleport to="body">
    <!-- 分享弹窗 -->
    <transition name="poster-fade">
      <div v-if="visible" class="poster-modal" @click.self="close">
        <div class="poster-card">
          <button class="poster-close" @click="close">✕</button>

          <!-- 预览图 -->
          <div v-if="posterUrl" class="poster-preview">
            <img :src="posterUrl" alt="分享海报" />
          </div>
          <div v-else-if="generating" class="poster-loading">
            <span class="spinner"></span>
            <span>海报生成中…</span>
          </div>

          <!-- 操作按钮 -->
          <div v-if="posterUrl" class="poster-actions">
            <button class="poster-btn poster-btn-primary" @click="downloadPoster">
              💾 保存海报
            </button>
            <button class="poster-btn" @click="copyPoster">
              📋 复制图片
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 隐藏的海报模板（用于 html2canvas 截图） -->
    <div
      ref="posterRef"
      class="poster-template"
    >
      <!-- 顶部：logo + 品牌名 -->
      <div class="pt-header">
        <div class="pt-logo-row">
          <div class="pt-logo-icon"></div>
          <div>
            <div class="pt-logo-name">非遗映像</div>
            <div class="pt-logo-sub">千年技艺 · 一瞬再现</div>
          </div>
        </div>
      </div>

      <!-- 卡牌大图 -->
      <div class="pt-image-wrap">
        <div class="pt-image">
          <img v-if="image" :src="image" />
          <span v-else class="pt-image-placeholder">🏮</span>
          <!-- 叠加"非遗"竖排印章（取自卡牌背面） -->
          <div class="pt-stamp">非<br/>遗</div>
        </div>
        <div class="pt-rarity-badge" :class="rarityClass">
          {{ rarityLabel }}
        </div>
      </div>

      <!-- 风格 banner 缩略图（取自卡牌背面） -->
      <div class="pt-banner-strip" v-if="bannerUrl">
        <img :src="bannerUrl" />
      </div>

      <!-- 风格信息 -->
      <div class="pt-info-section">
        <div class="pt-style-row">
          <span class="pt-style-emoji">{{ styleEmoji }}</span>
          <span class="pt-style-name">{{ styleName }}</span>
        </div>
        <div class="pt-meta-row">
          <span class="pt-meta-tag">📍 {{ location }}</span>
          <span class="pt-meta-tag">✦ {{ rarityLabel }}</span>
        </div>
        <div class="pt-heritage-tag">{{ heritage }}</div>
      </div>

      <!-- 文化文案 -->
      <div class="pt-culture-section" v-if="cultureText">
        <div class="pt-culture-text">{{ cultureText }}</div>
      </div>

      <!-- 底部诗词落款 -->
      <div class="pt-footer">
        <div class="pt-footer-line"></div>
        <div class="pt-footer-poem">{{ footerPoem }}</div>
        <div class="pt-footer-brand">非遗映像 · AI 文化传承</div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import html2canvas from 'html2canvas'
import { getStyleById } from '../data/styles.js'
import { KNOWLEDGE } from '../data/knowledge.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  image: { type: String, default: '' },
  styleName: { type: String, default: '' },
  styleId: { type: String, default: '' },
  rarity: { type: Number, default: 0 },
  resonanceLevel: { type: Number, default: 1 },
})

const emit = defineEmits(['close'])

const posterRef = ref(null)
const posterUrl = ref('')
const generating = ref(false)

const RARITY_LABELS = ['清赏', '珍赏', '神品']
const RARITY_CLASS = ['qingshang', 'zhenshang', 'shenpin']

const rarityLabel = computed(() => RARITY_LABELS[props.rarity] || '清赏')
const rarityClass = computed(() => RARITY_CLASS[props.rarity] || 'qingshang')

/** 风格 -> 地理位置映射 */
const LOCATION_MAP = {
  miao_silver: '贵州 · 雷山',
  court_dress: '北京',
  dunhuang: '甘肃 · 敦煌',
  tang_dynasty: '四川 · 成都',
  ming_brocade: '江苏 · 南京',
  su_embroidery: '江苏 · 苏州',
  batik: '贵州 · 丹寨',
  blue_porcelain: '江西 · 景德镇',
  yi_costume: '四川 · 凉山',
  tibetan: '西藏 · 拉萨',
  zhuang_brocade: '广西 · 宾阳',
  ming_style: '江苏 · 苏州',
}

const location = computed(() => LOCATION_MAP[props.styleId] || '中国')
const styleEmoji = computed(() => getStyleById(props.styleId)?.emoji || '🏮')
const cultureText = computed(() => {
  const k = KNOWLEDGE[props.styleId]
  if (!k) return ''
  return k[0]?.short || ''
})

/** 底部诗词——每种风格对应一句古诗词意境 */
const POEM_MAP = {
  miao_silver:    '锤声叮当银花绽，苗岭千年匠心传',
  court_dress:    '龙袍凤冠今犹在，宫墙柳色入画来',
  dunhuang:       '大漠孤烟飞天舞，丝路千年梦未央',
  tang_dynasty:   '锦官城外柏森森，花楼机上织流云',
  ming_brocade:   '寸锦寸金织造忙，云锦天衣焕彩光',
  su_embroidery:  '一针一线绣山河，苏州月下弄丝梭',
  batik:          '冰纹蜡染蓝如海，苗寨千年染匠心',
  blue_porcelain: '青花一抹烟雨中，瓷都千年窑火红',
  yi_costume:     '火焰纹中鹰虎啸，凉山彩线织乾坤',
  tibetan:        '矿物研磨画佛光，雪域唐卡映苍穹',
  zhuang_brocade: '壮锦万寿纹样美，竹笼机上织春秋',
  ming_style:     '榫卯相合天地工，黄花梨畔匠心浓',
}
const footerPoem = computed(() => POEM_MAP[props.styleId] || '匠心独运，非遗薪火代代传')

/** banner 图映射（取自卡牌背面） */
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
const bannerUrl = computed(() => BANNER_MAP[props.styleId] || '')

const heritage = computed(() => {
  // 从 styleId 推断非遗标签（简化版）
  const map = {
    miao_silver: '苗族银饰锻制技艺 · 国家级非遗',
    court_dress: '京绣 · 国家级非遗',
    dunhuang: '敦煌艺术 · 世界文化遗产',
    tang_dynasty: '蜀锦织造技艺 · 国家级非遗',
    ming_brocade: '南京云锦 · 国家级非遗',
    su_embroidery: '苏绣 · 国家级非遗',
    batik: '苗族蜡染 · 国家级非遗',
    blue_porcelain: '景德镇制瓷 · 国家级非遗',
    yi_costume: '彝族刺绣 · 国家级非遗',
    tibetan: '唐卡 · 国家级非遗',
    zhuang_brocade: '壮族壮锦 · 国家级非遗',
    ming_style: '明式家具 · 国家级非遗',
  }
  return map[props.styleId] || '国家级非物质文化遗产'
})

function close() {
  posterUrl.value = ''
  emit('close')
}

async function generatePoster() {
  if (!posterRef.value) return
  generating.value = true
  posterUrl.value = ''

  try {
    await nextTick()

    // 临时展开模板让 html2canvas 能正确渲染
    posterRef.value.classList.add('capturing')

    // 等待图片加载完成
    const imgs = posterRef.value.querySelectorAll('img')
    await Promise.all(Array.from(imgs).map(img => new Promise((resolve) => {
      if (img.complete && img.naturalWidth > 0) { resolve(); return }
      img.onload = resolve
      img.onerror = resolve
    })))

    // 额外等待一帧确保布局完成
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

    const canvas = await html2canvas(posterRef.value, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#fcf9f4',
      logging: false,
      imageTimeout: 5000,
    })

    posterUrl.value = canvas.toDataURL('image/png', 0.95)

    // 截完收回去
    posterRef.value.classList.remove('capturing')
  } catch (e) {
    console.error('海报生成失败', e)
    posterRef.value?.classList.remove('capturing')
  } finally {
    generating.value = false
  }
}

function downloadPoster() {
  if (!posterUrl.value) return
  const a = document.createElement('a')
  a.download = `非遗映像_${props.styleName}_${rarityLabel.value}.png`
  a.href = posterUrl.value
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

async function copyPoster() {
  if (!posterUrl.value) return
  try {
    const res = await fetch(posterUrl.value)
    const blob = await res.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    // 简单 toast 提示
    alert('海报已复制到剪贴板 ✅')
  } catch (e) {
    downloadPoster()
  }
}

watch(() => props.visible, (v) => {
  if (v) {
    generatePoster()
  }
})
</script>



<style scoped>
/* ===== 弹窗层 ===== */
.poster-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.poster-card {
  position: relative;
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  padding: 16px;
  max-width: 340px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
.poster-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}
.poster-close:active { transform: scale(0.9); }

.poster-preview img {
  width: 100%;
  border-radius: 8px;
  display: block;
}
.poster-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 14px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-primary);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.poster-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.poster-btn {
  flex: 1;
  padding: 12px;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-primary);
  background: var(--bg-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: 0.15s;
}
.poster-btn-primary {
  background: linear-gradient(135deg, var(--accent), #b8432a);
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(142, 42, 43, 0.25);
}
.poster-btn:active { transform: scale(0.97); }

.poster-fade-enter-active,
.poster-fade-leave-active {
  transition: opacity 250ms ease;
}
.poster-fade-enter-from,
.poster-fade-leave-to {
  opacity: 0;
}

/* ===== 隐藏的海报模板（html2canvas 截图用） ===== */
.poster-template {
  position: fixed;
  left: 0;
  top: 0;
  width: 648px;
  background: #faf6ef;
  font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif;
  color: #2a2520;
  box-sizing: border-box;
  visibility: hidden;
  overflow: hidden;
  height: 0;
  pointer-events: none;
  z-index: -1;
  /* 纸纹底 */
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(180, 160, 130, 0.025) 6px, rgba(180, 160, 130, 0.025) 7px),
    repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(180, 160, 130, 0.015) 8px, rgba(180, 160, 130, 0.015) 9px);
}
.poster-template.capturing {
  visibility: visible;
  height: auto;
  overflow: visible;
}

/* ===== 顶部：logo + 品牌名 ===== */
.pt-header {
  padding: 32px 40px 20px;
}
.pt-logo-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.pt-logo-icon {
  width: 44px;
  height: 44px;
  background-image: url('/images/feiyi-icon.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #1a365d;
  border-radius: 8px;
  flex-shrink: 0;
}
.pt-logo-name {
  font-size: 26px;
  font-weight: 800;
  color: #1a2744;
  letter-spacing: 3px;
}
.pt-logo-sub {
  font-size: 12px;
  color: #a09080;
  letter-spacing: 4px;
  margin-top: 3px;
}

/* ===== 卡牌大图 ===== */
.pt-image-wrap {
  position: relative;
  margin: 0 40px;
}
.pt-image {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 4px;
  overflow: hidden;
  background: linear-gradient(135deg, #e8e0d4, #f5f0e8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border: 2px solid #ddd5c5;
}
.pt-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pt-image-placeholder {
  font-size: 80px;
}
.pt-rarity-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 6px 18px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  letter-spacing: 2px;
}
.pt-rarity-badge.qingshang { background: linear-gradient(135deg, #7a7570, #9a9588); }
.pt-rarity-badge.zhenshang { background: linear-gradient(135deg, #b8963a, #d4a853); }
.pt-rarity-badge.shenpin { background: linear-gradient(135deg, #8e2a2b, #c47a3a); }

/* "非遗"竖排印章（叠加在卡牌图左上角） */
.pt-stamp {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 42px;
  height: 56px;
  border: 2.5px solid #8e2a2b;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: #8e2a2b;
  line-height: 1.15;
  letter-spacing: 2px;
  font-family: 'Noto Serif SC', serif;
  background: rgba(255,255,255,0.75);
  z-index: 2;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

/* 风格 banner 缩略条 */
.pt-banner-strip {
  margin: 0 40px;
  height: 48px;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
  position: relative;
}
.pt-banner-strip img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ===== 风格信息 ===== */
.pt-info-section {
  padding: 24px 48px 16px;
  text-align: center;
}
.pt-style-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}
.pt-style-emoji {
  font-size: 28px;
}
.pt-style-name {
  font-size: 32px;
  font-weight: 800;
  color: #1a2744;
  letter-spacing: 6px;
}
.pt-meta-row {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 8px;
}
.pt-meta-tag {
  font-size: 14px;
  color: #8a7a68;
  letter-spacing: 1px;
}
.pt-heritage-tag {
  font-size: 12px;
  color: #b0a090;
  letter-spacing: 2px;
  margin-top: 4px;
}

/* ===== 文化文案 ===== */
.pt-culture-section {
  margin: 8px 48px;
  padding: 20px 24px;
  position: relative;
  text-align: center;
}
.pt-culture-section::before,
.pt-culture-section::after {
  content: '❧';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: #c8b898;
}
.pt-culture-section::before { left: 0; }
.pt-culture-section::after { right: 0; }
.pt-culture-text {
  font-size: 15px;
  line-height: 2;
  color: #5a4a3a;
  letter-spacing: 1px;
  font-style: italic;
}

/* ===== 底部诗词落款 ===== */
.pt-footer {
  padding: 16px 48px 36px;
  text-align: center;
}
.pt-footer-line {
  width: 80px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #c8b898, transparent);
  margin: 0 auto 16px;
}
.pt-footer-poem {
  font-size: 14px;
  color: #7a6a58;
  letter-spacing: 2px;
  margin-bottom: 8px;
  line-height: 1.8;
}
.pt-footer-brand {
  font-size: 11px;
  color: #c0b0a0;
  letter-spacing: 4px;
}
</style>
