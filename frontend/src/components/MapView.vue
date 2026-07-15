<template>
  <div class="map-view">
    <!-- 头部 -->
    <div class="map-header">
      <h1 class="map-title">非遗足迹</h1>
      <p class="map-subtitle">每一次生成，都是一次文化之旅</p>
    </div>

    <!-- 进度面板 -->
    <div class="progress-card">
      <div class="progress-ring">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle class="ring-bg" cx="32" cy="32" r="28"/>
          <circle class="ring-fill" cx="32" cy="32" r="28"
            :stroke-dasharray="ringCircumference"
            :stroke-dashoffset="ringOffset"/>
        </svg>
        <div class="ring-text">{{ progressPercent }}%</div>
      </div>
      <div class="progress-info">
        <h3>探索进度</h3>
        <p>已点亮 {{ litCount }} 处非遗文化圣地</p>
        <div class="progress-count">
          <span class="num">{{ litCount }}</span>
          <span class="total">/ {{ totalCount }}</span>
        </div>
      </div>
    </div>

    <!-- 地图区域 -->
    <div class="map-container">
      <div class="map-wrapper">
        <img class="china-map" src="/images/map/china-map.png" alt="中国地图" />

        <!-- 涟漪效果 -->
        <div v-if="rippleStyle" class="ripple-container">
          <div v-for="i in 3" :key="i" class="ripple" :style="rippleStyle"></div>
        </div>

        <!-- 标记点 -->
        <div
          v-for="loc in locations"
          :key="loc.id"
          class="map-marker"
          :class="{ lit: isLit(loc.id), 'just-lit': store.justLitStyle === loc.id }"
          :style="{ left: loc.x + '%', top: loc.y + '%' }"
          @click="openDetail(loc.id)"
        >
          <div class="marker-hitarea"></div>
          <div class="marker-pulse"></div>
          <div class="marker-dot"></div>
          <div class="marker-question">?</div>
          <div class="marker-label">{{ loc.cityShort }}</div>
        </div>
      </div>
    </div>

    <!-- 提示语 -->
    <div class="hint-bar" v-if="litCount < totalCount">
      点击地图上的 <b>?</b> 或下方卡片，探索未知非遗圣地
    </div>
    <div class="hint-bar complete" v-else>
      全部点亮！你已走遍所有非遗文化圣地
    </div>

    <!-- 风格列表 -->
    <div class="style-list">
      <div
        v-for="loc in locations"
        :key="loc.id"
        class="style-item"
        :class="{ lit: isLit(loc.id) }"
        @click="openDetail(loc.id)"
      >
        <div class="style-emoji" :class="loc.id">
          {{ isLit(loc.id) ? loc.emoji : '❓' }}
        </div>
        <div class="style-info">
          <div class="style-name">{{ isLit(loc.id) ? loc.name : '??? 待探索' }}</div>
          <div class="style-loc">
            {{ isLit(loc.id) ? loc.city + ' · ' + loc.heritage : '生成该风格即可解锁' }}
          </div>
        </div>
        <div class="style-status" :class="isLit(loc.id) ? 'lit' : 'locked'">
          {{ isLit(loc.id) ? '已点亮' : '未解锁' }}
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <transition name="modal">
      <div v-if="detailVisible" class="detail-mask" @click.self="closeDetail">
        <div class="detail-card" :class="{ locked: !detailLoc || !isLit(detailLoc.id) }">
          <button class="detail-close" @click="closeDetail">✕</button>
          <button v-if="detailLoc && isLit(detailLoc.id)" class="detail-share-btn" @click="shareDetail">📤</button>

          <template v-if="detailLoc">
            <!-- 风景图头图 -->
            <div class="detail-hero">
              <img v-if="isLit(detailLoc.id)" :src="detailLoc.scenery" :alt="detailLoc.name" />
              <div v-else class="detail-hero-locked">
                <span class="lock-icon">🔒</span>
              </div>
              <div class="detail-hero-overlay"></div>
              <div class="detail-hero-info" ref="detailHeroRef">
                <div class="hero-emoji">{{ isLit(detailLoc.id) ? detailLoc.emoji : '❓' }}</div>
                <div class="hero-text">
                  <h2>{{ isLit(detailLoc.id) ? detailLoc.name : '待探索' }}</h2>
                  <p>{{ isLit(detailLoc.id) ? detailLoc.city : '生成该风格即可解锁' }}</p>
                </div>
                <div v-if="isLit(detailLoc.id)" class="hero-badge">已点亮</div>
              </div>
            </div>

            <!-- 已点亮：统计 + 文化知识 -->
            <div v-if="isLit(detailLoc.id)" class="detail-body">
              <div class="detail-stats">
                <div class="stat-item">
                  <div class="stat-num">{{ getStyleStats(detailLoc.id).count }}</div>
                  <div class="stat-label">生成张数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-num">{{ getStyleStats(detailLoc.id).bestRarity }}</div>
                  <div class="stat-label">最高稀有度</div>
                </div>
                <div class="stat-item">
                  <div class="stat-num">Lv.{{ getStyleStats(detailLoc.id).resonance }}</div>
                  <div class="stat-label">共鸣等级</div>
                </div>
              </div>

              <div class="detail-heritage">
                <div class="heritage-label">非遗小知识</div>
                <div class="heritage-text">{{ detailLoc.heritageIntro }}</div>
              </div>

              <button class="detail-btn" @click="goToGallery(detailLoc.id)">
                查看该风格图鉴
              </button>
            </div>

            <!-- 未解锁：引导 -->
            <div v-else class="detail-body locked-body">
              <div class="locked-hint">
                <div class="locked-icon">✨</div>
                <p>上传照片生成该风格<br/>即可点亮这座非遗文化圣地</p>
              </div>
              <button class="detail-btn primary" @click="goToGenerate">
                去生成
              </button>
            </div>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGameStore } from '../stores/gameStore.js'
import { STYLES } from '../data/styles.js'
import { RARITY_ABBR } from '../data/constants.js'

const store = useGameStore()

// 地理位置数据（坐标为百分比，基于真实中国地图）
const locations = [
  {
    id: 'miao_silver',
    name: '苗族银饰',
    city: '贵州 · 雷山',
    cityShort: '雷山',
    emoji: '💍',
    heritage: '国家级非遗',
    heritageIntro: '苗族银饰锻制技艺是苗族民间传统技艺，以银为原料，经熔银、拉丝、编织等数十道工序制成。每件银饰都承载着苗族的历史与信仰。',
    x: 62,
    y: 66,
    scenery: '/images/map/苗族银饰.jpg',
  },
  {
    id: 'court_dress',
    name: '清宫华服',
    city: '北京',
    cityShort: '北京',
    emoji: '👑',
    heritage: '京绣 · 国家级非遗',
    heritageIntro: '京绣又称宫绣，是北京地区的传统刺绣工艺，曾为宫廷御用。以用料考究、针法精细、色彩华丽著称，虽非四大名绣，却以宫廷御绣地位享有极高声誉。',
    x: 75,
    y: 30,
    scenery: '/images/map/清宫华服.jpg',
  },
  {
    id: 'dunhuang',
    name: '敦煌飞天',
    city: '甘肃 · 敦煌',
    cityShort: '敦煌',
    emoji: '🪷',
    heritage: '世界文化遗产',
    heritageIntro: '敦煌飞天是敦煌莫高窟的艺术名片，融合了印度佛教天人与中国道教羽人的形象，历经千年演变，成为中华文化包容与创新的象征。',
    x: 34,
    y: 35,
    scenery: '/images/map/敦煌飞天.jpg',
  },
  {
    id: 'tang_dynasty',
    name: '大唐服饰',
    city: '陕西 · 西安',
    cityShort: '西安',
    emoji: '🏮',
    heritage: '蜀锦织造 · 双料非遗',
    heritageIntro: '蜀锦兴于春秋战国，盛于汉唐，是罕见的双料非遗。与宋锦、壮锦、云锦并称"中国四大名锦"，代表了中国古代丝织工艺的最高水平。',
    x: 52,
    y: 40,
    scenery: '/images/map/大唐服饰.jpg',
  },
  {
    id: 'ming_brocade',
    name: '大明风华',
    city: '江苏 · 南京',
    cityShort: '南京',
    emoji: '🐉',
    heritage: '南京云锦 · 国家级非遗',
    heritageIntro: '南京云锦始于东晋，盛于明清，因色泽光丽灿烂如天上云霞而得名，是元明清三朝皇家御用品，代表古代织锦技术最高成就。',
    x: 72,
    y: 45,
    scenery: '/images/map/大明风华.jpg',
  },
  {
    id: 'su_embroidery',
    name: '苏州刺绣',
    city: '江苏 · 苏州',
    cityShort: '苏州',
    emoji: '🪡',
    heritage: '苏绣 · 国家级非遗',
    heritageIntro: '苏绣至今已有两千余年历史，与湘绣、粤绣、蜀绣并称"中国四大名绣"，以精细雅洁著称，具有平齐细密匀顺和光八大特点。',
    x: 74,
    y: 47,
    scenery: '/images/map/苏州刺绣.jpg',
  },
  {
    id: 'batik',
    name: '蜡染蓝韵',
    city: '贵州 · 丹寨',
    cityShort: '丹寨',
    emoji: '🔵',
    heritage: '苗族蜡染 · 国家级非遗',
    heritageIntro: '苗族蜡染古称"蜡缬"，贵州丹寨被誉为"中国蜡染艺术之乡"。以铜制蜡刀蘸取蜂蜡在白布上描绘图案，染后去蜡形成蓝底白花的独特效果。',
    x: 56,
    y: 63,
    scenery: '/images/map/蜡染蓝韵.jpg',
  },
  {
    id: 'blue_porcelain',
    name: '青花瓷纹',
    city: '江西 · 景德镇',
    cityShort: '景德镇',
    emoji: '🏺',
    heritage: '景德镇制瓷 · 国家级非遗',
    heritageIntro: '景德镇素有"瓷都"之称，传统手工制瓷需经历揉泥、拉坯、利坯、施釉、画坯、烧窑等七十二道工序，道道精工，千年传承。',
    x: 69,
    y: 50,
    scenery: '/images/map/青花瓷纹.jpg',
  },
  {
    id: 'yi_costume',
    name: '彝族服饰',
    city: '四川 · 凉山',
    cityShort: '凉山',
    emoji: '🔥',
    heritage: '彝族刺绣 · 国家级非遗',
    heritageIntro: '彝族刺绣以黑、红、黄三色为基调，图案涵盖火焰纹、鹰纹、虎纹等，承载着彝族的创世神话与自然崇拜，是彝族文化的活态传承。',
    x: 47,
    y: 55,
    scenery: '/images/map/彝族服饰.jpg',
  },
  {
    id: 'tibetan',
    name: '藏族文化',
    city: '西藏 · 拉萨',
    cityShort: '拉萨',
    emoji: '🏔️',
    heritage: '唐卡彩绘 · 国家级非遗',
    heritageIntro: '唐卡是藏族传统卷轴绘画艺术，颜料全部取自天然矿物与植物，绘制严格遵循《造像度量经》，千年不褪色，是藏传佛教修持的重要法器。',
    x: 30,
    y: 48,
    scenery: '/images/map/藏族文化.jpg',
  },
  {
    id: 'zhuang_brocade',
    name: '壮族壮锦',
    city: '广西 · 南宁',
    cityShort: '南宁',
    emoji: '🧵',
    heritage: '壮族织锦 · 国家级非遗',
    heritageIntro: '壮锦与蜀锦、宋锦、云锦并称"中国四大名锦"，以色彩鲜艳、几何对称著称，图案多达五十余种，万寿纹、蛙纹最为经典。',
    x: 54,
    y: 70,
    scenery: '/images/map/壮族壮锦.jpg',
  },
  {
    id: 'ming_style',
    name: '明式风格',
    city: '江苏 · 苏州',
    cityShort: '苏州',
    emoji: '🪑',
    heritage: '明式家具 · 国家级非遗',
    heritageIntro: '明式家具是中国古典家具的巅峰之作，以简约洗练、线条流畅著称，榫卯结构不使用一颗钉子，却能使家具牢固百年。',
    x: 73,
    y: 46,
    scenery: '/images/map/明式风格.jpg',
  },
]

const totalCount = locations.length
const litCount = computed(() => store.litStyleCount)
const progressPercent = computed(() =>
  Math.round((litCount.value / totalCount) * 100)
)

const ringCircumference = 2 * Math.PI * 28
const ringOffset = computed(() =>
  ringCircumference - (litCount.value / totalCount) * ringCircumference
)

// 涟漪效果
const rippleStyle = ref(null)

// 详情弹窗
const detailVisible = ref(false)
const detailLoc = ref(null)
const detailHeroRef = ref(null)

function isLit(id) {
  return store.litStyles.has(id)
}

function getStyleStats(styleId) {
  const cards = store.gallery.filter(g => g.style === styleId)
  const count = cards.length
  const bestRarity = cards.length > 0
    ? RARITY_ABBR[Math.max(...cards.map(c => c.rarity))]
    : '-'
  const resonance = store.getStyleResonance(styleId).level
  return { count, bestRarity, resonance }
}

function openDetail(id) {
  detailLoc.value = locations.find(l => l.id === id)
  detailVisible.value = true
}

function closeDetail() {
  detailVisible.value = false
}

function goToGallery(styleId) {
  closeDetail()
  store.showGalleryDetail(styleId)
}

function goToGenerate() {
  closeDetail()
  store.showMain()
}

/** 分享地图详情弹窗内容（截图方式） */
async function shareDetail() {
  if (!detailLoc.value || !isLit(detailLoc.value.id)) return
  const cardEl = document.querySelector('.detail-card')
  if (!cardEl) return

  try {
    // 尝试使用 html2canvas 截图
    let blob = null
    if (typeof html2canvas !== 'undefined') {
      const canvas = await html2canvas(cardEl, {
        backgroundColor: '#f5f0e8',
        scale: 2,
        useCORS: true,
      })
      blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
    }

    if (blob && navigator.share && navigator.canShare?.({ files: [new File([blob], '非遗足迹.png', { type: 'image/png' })] })) {
      await navigator.share({
        title: `非遗映像 · ${detailLoc.value.name}`,
        text: `${detailLoc.value.city} — ${detailLoc.value.heritageIntro.slice(0, 40)}…`,
        files: [new File([blob], '非遗足迹.png', { type: 'image/png' })],
      })
    } else if (navigator.share) {
      await navigator.share({
        title: `非遗映像 · ${detailLoc.value.name}`,
        text: `${detailLoc.value.city} — ${detailLoc.value.heritageIntro}`,
      })
    } else {
      // 桌面端降级：提示用户截图
      store.showToast('请截图分享给好友 📸', 'info')
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      store.showToast('分享失败，请尝试截图保存 📸', 'error')
    }
  }
}

// 监听 justLitStyle 变化，触发涟漪动画
watch(
  () => store.justLitStyle,
  (newVal) => {
    if (newVal && store.viewState === 'map') {
      const loc = locations.find(l => l.id === newVal)
      if (loc) {
        triggerRipple(loc.x, loc.y)
      }
    }
  }
)

function triggerRipple(xPercent, yPercent) {
  const size = 180
  rippleStyle.value = {
    left: xPercent + '%',
    top: yPercent + '%',
    width: size + 'px',
    height: size + 'px',
  }
  setTimeout(() => {
    rippleStyle.value = null
  }, 1200)
}
</script>

<style scoped>
.map-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding-bottom: var(--space-md);
}

/* ===== 头部 ===== */
.map-header {
  text-align: center;
  padding: var(--space-md) 0 4px;
}
.map-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px;
}
.map-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

/* ===== 进度面板 ===== */
.progress-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.progress-ring {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}
.progress-ring svg { transform: rotate(-90deg); }
.ring-bg {
  fill: none;
  stroke: var(--border-light);
  stroke-width: 4;
}
.ring-fill {
  fill: none;
  stroke: var(--accent-gold);
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
}
.ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
}
.progress-info { flex: 1; }
.progress-info h3 {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 2px;
}
.progress-info p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}
.progress-count {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-top: 6px;
}
.progress-count .num {
  font-size: 22px;
  font-weight: 800;
  color: var(--accent);
  font-family: var(--font-display);
}
.progress-count .total {
  font-size: 14px;
  color: var(--text-tertiary);
}

/* ===== 地图区域 ===== */
.map-container {
  background: var(--bg-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 12px;
  position: relative;
  overflow: hidden;
}
.map-wrapper {
  position: relative;
  width: 100%;
  height: auto;
}
.china-map {
  width: 100%;
  height: auto;
  display: block;
  filter: sepia(35%) hue-rotate(-15deg) saturate(0.8) brightness(1.05);
  opacity: 0.85;
  pointer-events: none;
}

/* ===== 标记点 ===== */
.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 2;
}
.marker-hitarea {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  z-index: 1;
}
.marker-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--text-tertiary);
  border: 2px solid var(--bg-elevated);
  transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
  z-index: 2;
}
.marker-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--text-tertiary);
  opacity: 0;
}
.map-marker:not(.lit) .marker-pulse {
  animation: pulse-soft 3s ease-in-out infinite;
}
.map-marker.lit .marker-dot {
  background: var(--accent-gold);
  border-color: var(--accent);
  border-width: 2.5px;
  box-shadow: 0 0 10px rgba(212,168,83,0.7), 0 0 20px rgba(212,168,83,0.4);
}
.map-marker.lit .marker-pulse {
  border-color: var(--accent-gold);
  border-width: 1.5px;
  animation: pulse-glow 2s ease-in-out infinite;
}
.map-marker.lit .marker-label {
  opacity: 1;
  transform: translate(-50%, 0);
}

@keyframes pulse-soft {
  0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(0.9); }
  50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
}
@keyframes pulse-glow {
  0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
  40% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.2); }
}

.marker-label {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translate(-50%, 4px);
  font-size: 10px;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: 999px;
  padding: 2px 10px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s;
  pointer-events: none;
  z-index: 3;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

.marker-question {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--text-tertiary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  opacity: 0.6;
  pointer-events: none;
  transition: opacity 0.3s;
}
.map-marker.lit .marker-question { display: none; }

/* ===== 涟漪效果 ===== */
.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
}
.ripple {
  position: absolute;
  border-radius: 50%;
  border: 2px solid var(--accent-gold);
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  animation: ripple-expand 1.2s ease-out forwards;
}
.ripple:nth-child(2) { animation-delay: 0.15s; }
.ripple:nth-child(3) { animation-delay: 0.3s; }

@keyframes ripple-expand {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}

.just-lit .marker-dot {
  animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes popIn {
  0% { width: 0; height: 0; opacity: 0; }
  60% { width: 22px; height: 22px; }
  100% { width: 14px; height: 14px; opacity: 1; }
}

/* ===== 提示 ===== */
.hint-bar {
  padding: 10px 14px;
  background: linear-gradient(135deg, var(--accent-light), #faf5f0);
  border: 1px solid rgba(158,42,43,0.15);
  border-radius: var(--radius-lg);
  font-size: 12px;
  color: var(--accent);
  text-align: center;
}
.hint-bar.complete {
  background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
  border-color: rgba(56,142,60,0.2);
  color: #388e3c;
}

/* ===== 风格列表 ===== */
.style-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.style-item {
  background: var(--bg-elevated);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.style-item:active { transform: scale(0.98); }
.style-item.lit {
  border-color: var(--accent-gold);
  background: linear-gradient(135deg, #fef9f0 0%, #faf3e8 100%);
}
.style-emoji {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.style-emoji.miao_silver { background: linear-gradient(135deg, #e8e0d4, #f5f0e8); }
.style-emoji.court_dress { background: linear-gradient(135deg, #f5e6e0, #f0e4cc); }
.style-emoji.dunhuang { background: linear-gradient(135deg, #f5f0d8, #faf3e0); }
.style-emoji.tang_dynasty { background: linear-gradient(135deg, #f5e0d8, #fce8c8); }
.style-emoji.ming_brocade { background: linear-gradient(135deg, #f5ecd0, #f0e0b8); }
.style-emoji.su_embroidery { background: linear-gradient(135deg, #fce4ec, #f8f0f5); }
.style-emoji.batik { background: linear-gradient(135deg, #e0f0f8, #c8e4f0); }
.style-emoji.blue_porcelain { background: linear-gradient(135deg, #e8f0ff, #d0e0f5); }
.style-emoji.yi_costume { background: linear-gradient(135deg, #f0e0e0, #e8d0c8); }
.style-emoji.tibetan { background: linear-gradient(135deg, #f5e8d0, #f0e0c0); }
.style-emoji.zhuang_brocade { background: linear-gradient(135deg, #e0f0e0, #d0e8d0); }
.style-emoji.ming_style { background: linear-gradient(135deg, #f0e8d8, #e8dcc8); }

.style-info { flex: 1; min-width: 0; }
.style-name {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 2px;
}
.style-loc {
  font-size: 12px;
  color: var(--text-secondary);
}
.style-status {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}
.style-status.locked {
  background: #f0eeea;
  color: var(--text-tertiary);
}
.style-status.lit {
  background: linear-gradient(135deg, var(--accent-gold), #e8c060);
  color: #fff;
}

/* ===== 详情弹窗 ===== */
.detail-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.detail-card {
  width: 100%;
  max-width: 340px;
  background: var(--bg-elevated);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  position: relative;
  max-height: 85vh;
  overflow-y: auto;
}
.detail-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.4);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.detail-close:active { transform: scale(0.9); }

.detail-share-btn {
  position: absolute;
  top: 12px;
  right: 50px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.75);
  color: var(--text-primary);
  font-size: 15px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s, transform 0.2s;
}
.detail-share-btn:hover { background: rgba(255,255,255,0.9); }
.detail-share-btn:active { transform: scale(0.9); }

/* 风景头图 */
.detail-hero {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}
.detail-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.detail-hero-locked {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f0eeea 0%, #e5e2dc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.lock-icon {
  font-size: 48px;
  opacity: 0.3;
}
.detail-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.6) 100%);
}
.detail-hero-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
}
.hero-emoji {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}
.hero-text { flex: 1; }
.hero-text h2 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 2px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.hero-text p {
  font-size: 12px;
  opacity: 0.9;
  margin: 0;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.hero-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent-gold), #e8c060);
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(212,168,83,0.4);
}

/* 详情内容 */
.detail-body {
  padding: 16px;
}
.detail-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}
.stat-item {
  text-align: center;
  padding: 12px 6px;
  background: #faf7f2;
  border-radius: 10px;
}
.stat-num {
  font-size: 18px;
  font-weight: 800;
  color: var(--accent);
  font-family: var(--font-display);
  margin-bottom: 2px;
}
.stat-label {
  font-size: 10px;
  color: var(--text-secondary);
}

.detail-heritage {
  padding: 12px 14px;
  background: #faf7f2;
  border-radius: 10px;
  margin-bottom: 14px;
}
.heritage-label {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.heritage-text {
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-primary);
}

.detail-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #f0eeea;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}
.detail-btn.primary {
  background: linear-gradient(135deg, var(--accent), #7e2021);
  color: #fff;
}
.detail-btn:active { transform: scale(0.97); }

/* 未解锁 */
.locked-body { text-align: center; }
.locked-hint {
  padding: 20px 0 24px;
}
.locked-icon {
  font-size: 36px;
  margin-bottom: 10px;
  opacity: 0.5;
}
.locked-hint p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-active .detail-card,
.modal-leave-active .detail-card {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-from .detail-card,
.modal-leave-to .detail-card {
  transform: scale(0.9) translateY(20px);
}
</style>
