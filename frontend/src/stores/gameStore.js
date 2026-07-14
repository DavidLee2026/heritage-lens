/**
 * 非遗映像 — 游戏状态管理 Store
 *
 * 所有游戏逻辑集中在这里，组件只负责渲染
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  PARAMS,
  PROB_TABLE,
  RESO_BONUS_LV2,
  RESO_JUMP_LV4,
  PITY_珍赏_MAX,
  PITY_神品_MAX,
  RESONANCE_LEVELS,
  DEFAULT_PARAMS,
  CARD_IMAGES,
  RARITY_CLASS,
  RARITY_ABBR,
  RARITY_COLORS,
} from '../data/constants.js'
import { getStyleById } from '../data/styles.js'
import { buildPrompt } from '../data/prompts.js'

/* ================================================================
   IndexedDB 持久化（比 localStorage 容量大，不怕大图 base64）
=============================================================== */
const DB_NAME = 'feiyi_db'
const DB_STORE = 'app_state'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE)
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

async function dbSet(key, value) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite')
    tx.objectStore(DB_STORE).put(value, key)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = (e) => { db.close(); reject(e.target.error) }
  })
}

async function dbGet(key) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly')
    const req = tx.objectStore(DB_STORE).get(key)
    req.onsuccess = () => { db.close(); resolve(req.result) }
    req.onerror = (e) => { db.close(); reject(e.target.error) }
  })
}

export const useGameStore = defineStore('game', () => {
  /* ================================================================
     State
  ================================================================ */
  const uploadImage = ref(null)      // base64 data URL
  const imageBase64 = ref(null)      // raw base64 string (for API)
  const selectedStyle = ref('miao_silver')
  const params = ref({ ...DEFAULT_PARAMS })
  const gallery = ref([])            // { style, rarity, image, prompt, time, resonance, id }
  const resonance = ref({})          // { styleId: { level, count } }
  const currentResult = ref(null)    // { rarity, image, prompt, mock, style }
  const newCardCount = ref(0)
  const pityCounter = ref({ no珍赏: 0, no神品: 0 })
  const isGenerating = ref(false)
  const generateProgress = ref(0)    // 0-100
  const generateState = ref('idle')  // idle | generating | done | error
  const errorMessage = ref('')
  const viewState = ref('main')      // main | gallery | galleryDetail
  const detailStyleId = ref(null)
  const viewingStyleId = ref(null)   // for gallery card viewer
  const lastGenId = ref(0)

  /* ================================================================
     计算属性
  ================================================================ */

  /** 当前风格的共鸣信息 */
  const currentResonance = computed(() => {
    const id = selectedStyle.value
    if (!resonance.value[id]) {
      resonance.value[id] = { level: 0, count: 0 }
    }
    return resonance.value[id]
  })

  /** 当前风格的完整数据 */
  const currentStyleData = computed(() => getStyleById(selectedStyle.value))

  /** 偏离维数（参数偏离"标准"的个数） */
  const deviationCount = computed(() => {
    let dev = 0
    for (const p of PARAMS) {
      if (params.value[p.key] !== 1) dev++
    }
    return dev
  })

  /** 当前概率分布 */
  const currentProb = computed(() => {
    let prob = [...PROB_TABLE[deviationCount.value]]
    if (currentResonance.value.level >= 2) {
      prob[0] -= RESO_BONUS_LV2.珍赏 + RESO_BONUS_LV2.神品
      prob[1] += RESO_BONUS_LV2.珍赏
      prob[2] += RESO_BONUS_LV2.神品
    }
    if (pityCounter.value.no神品 >= PITY_神品_MAX) {
      prob[2] = Math.min(prob[2] * 2, 90)
      prob[0] = Math.max(0, 100 - prob[1] - prob[2])
    }
    return prob
  })

  /** 是否可以生成 */
  const canGenerate = computed(() => {
    return uploadImage.value !== null && !isGenerating.value
  })

  /** 图鉴有未读新卡 */
  const hasNewCards = computed(() => newCardCount.value > 0)

  /** 图鉴按风格分组 */
  const galleryByStyle = computed(() => {
    const grouped = {}
    for (const g of gallery.value) {
      if (!grouped[g.style]) grouped[g.style] = []
      grouped[g.style].push(g)
    }
    return grouped
  })

  /** 图鉴总风格数 */
  const galleryStyleCount = computed(() => Object.keys(galleryByStyle.value).length)

  /** 当前详情风格的卡片列表 */
  const detailCards = computed(() => {
    if (!detailStyleId.value) return []
    return gallery.value.filter((g) => g.style === detailStyleId.value)
  })

  /* ================================================================
     共鸣系统
  ================================================================ */

  function getStyleResonance(styleId) {
    if (!resonance.value[styleId]) {
      resonance.value[styleId] = { level: 0, count: 0 }
    }
    return resonance.value[styleId]
  }

  function addResonance(styleId) {
    const r = getStyleResonance(styleId)
    const oldLevel = r.level
    r.count++
    for (let i = RESONANCE_LEVELS.length - 1; i >= 0; i--) {
      if (r.count >= RESONANCE_LEVELS[i]) {
        r.level = i
        break
      }
    }
    if (r.level > oldLevel) {
      return r.level // 返回新等级，触发升级toast
    }
    return null
  }

  function getResonanceProgress(styleId) {
    const r = getStyleResonance(styleId)
    const cur = r.level
    const next = Math.min(cur + 1, 5)
    const curTarget = RESONANCE_LEVELS[cur]
    const nextTarget = RESONANCE_LEVELS[next]
    if (nextTarget === curTarget) return { pct: 100, remain: 0 }
    const total = nextTarget - curTarget
    const done = r.count - curTarget
    return {
      pct: Math.min(100, (done / total) * 100),
      remain: Math.max(0, nextTarget - r.count),
    }
  }

  /* ================================================================
     稀有度系统
  ================================================================ */

  function rollRarity() {
    let prob = [...PROB_TABLE[deviationCount.value]]
    const reso = currentResonance.value
    if (reso.level >= 2) {
      prob[0] -= RESO_BONUS_LV2.珍赏 + RESO_BONUS_LV2.神品
      prob[1] += RESO_BONUS_LV2.珍赏
      prob[2] += RESO_BONUS_LV2.神品
    }
    if (pityCounter.value.no神品 >= PITY_神品_MAX) {
      prob[2] = Math.min(prob[2] * 2, 90)
      prob[0] = Math.max(0, 100 - prob[1] - prob[2])
    }

    const roll = Math.random() * 100
    let rarity = 0
    if (roll < prob[0]) rarity = 0
    else if (roll < prob[0] + prob[1]) rarity = 1
    else rarity = 2

    // 珍赏保底
    if (rarity === 0 && pityCounter.value.no珍赏 >= PITY_珍赏_MAX) {
      rarity = 1
    }

    // 共鸣跃迁 Lv.4+
    if (reso.level >= 4 && rarity < 2 && Math.random() * 100 < RESO_JUMP_LV4) {
      rarity++
    }

    // 更新计数器
    if (rarity >= 1) pityCounter.value.no珍赏 = 0
    else pityCounter.value.no珍赏++
    if (rarity >= 2) pityCounter.value.no神品 = 0
    else pityCounter.value.no神品++

    return rarity
  }

  /* ================================================================
     操作
  ================================================================ */

  function selectStyle(id) {
    selectedStyle.value = id
  }

  function setParam(idx, val) {
    const key = PARAMS[idx].key
    params.value[key] = val
  }

  function setUploadImage(dataUrl, rawBase64) {
    uploadImage.value = dataUrl
    imageBase64.value = rawBase64
  }

  function resetUpload() {
    uploadImage.value = null
    imageBase64.value = null
    currentResult.value = null
    generateState.value = 'idle'
  }

  /** 生成：调 API + 前端算稀有度 */
  async function generate() {
    if (!canGenerate.value) return

    isGenerating.value = true
    generateState.value = 'generating'
    errorMessage.value = ''
    generateProgress.value = 0

    // 1. 前端先掷稀有度
    const rarity = rollRarity()
    const { prompt, negative } = buildPrompt(selectedStyle.value, params.value, rarity)

    let apiImage = null
    let mockUsed = false

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64.value,
          style: selectedStyle.value,
          subject_type: 'female',
          rarity_level: rarity,
          prompt: prompt,
          negative: negative,
          params: {
            density: params.value.density,
            pattern: params.value.pattern,
            finish: params.value.finish,
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `请求失败 (${res.status})`)
      }

      const data = await res.json()
      apiImage = data.image
      mockUsed = data.mock || false
    } catch (err) {
      console.warn('API 调用失败，使用 Mock 降级', err.message)
      mockUsed = true
      errorMessage.value = err.message || '生成失败'
    }

    // 2. 设置结果（即使 API 失败也能展示 Mock 卡牌）
    currentResult.value = {
      rarity,
      image: apiImage,
      prompt,
      style: selectedStyle.value,
      mock: mockUsed,
    }
    lastGenId.value++
    generateState.value = 'done'
    isGenerating.value = false
    generateProgress.value = 100

    return currentResult.value
  }

  /** 收藏当前结果到图鉴 */
  function collectResult() {
    if (!currentResult.value || currentResult.value.collected) return false

    currentResult.value.collected = true
    const reso = getStyleResonance(selectedStyle.value)
    gallery.value.push({
      id: lastGenId.value,
      style: selectedStyle.value,
      rarity: currentResult.value.rarity,
      image: currentResult.value.image,
      prompt: currentResult.value.prompt || '',
      resonance: reso.level,
      time: new Date().toLocaleString(),
    })

    // 共鸣 +1（不再在内部 saveState，避免中间态导致新卡被淘汰）
    const upgraded = addResonance(selectedStyle.value)

    // 未读计数
    newCardCount.value++

    // 统一保存：卡已到位，只存一次
    saveState()

    return upgraded
  }

  /** 重置生成状态 */
  function resetGenerate() {
    currentResult.value = null
    generateState.value = 'idle'
    generateProgress.value = 0
  }

  /** 切换视图 */
  function showMain() {
    viewState.value = 'main'
    detailStyleId.value = null
  }

  function showGallery() {
    viewState.value = 'gallery'
    newCardCount.value = 0 // 进入图鉴清除红点
    detailStyleId.value = null
    saveState()
  }

  function showGalleryDetail(styleId) {
    detailStyleId.value = styleId
    viewState.value = 'galleryDetail'
  }

  function showGalleryCard(styleId) {
    viewingStyleId.value = styleId
  }

  function closeGalleryCard() {
    viewingStyleId.value = null
  }

  function clearGalleryData() {
    gallery.value = []
    resonance.value = {}
    newCardCount.value = 0
    pityCounter.value = { no珍赏: 0, no神品: 0 }
    detailStyleId.value = null
    saveState()
  }

  /** 从图鉴删除当前查看的卡片 */
  function deleteCurrentFromGallery() {
    const cur = currentResult.value
    if (!cur || !cur.image) return false
    const idx = gallery.value.findIndex((g) => g.image === cur.image)
    if (idx === -1) return false
    gallery.value.splice(idx, 1)
    currentResult.value = null
    saveState()
    return true
  }

  /* ================================================================
     持久化（IndexedDB）
  ================================================================ */

  const STATE_KEY = 'feiyi_state'

  /** 保存到 IndexedDB（异步，不阻塞 UI） */
  function saveState() {
    // JSON 脱壳：去掉 Vue reactive proxy，否则 IndexedDB 结构化克隆会失败
    dbSet(STATE_KEY, JSON.parse(JSON.stringify({
      gallery: gallery.value,
      resonance: resonance.value,
      newCardCount: newCardCount.value,
      pityCounter: pityCounter.value,
    }))).catch((e) => {
      console.warn('💾 IndexedDB 保存失败:', e)
    })
  }

  /** 从 IndexedDB 加载（异步，启动时自动读取） */
  async function loadState() {
    try {
      // 清理旧 localStorage 数据（防止之前积压的占空间）
      try { localStorage.removeItem('feiyi_vue_v2') } catch {}

      const saved = await dbGet(STATE_KEY)
      if (!saved) return

      if (saved.gallery) {
        for (const item of saved.gallery) {
          if (item.resonance === undefined) item.resonance = 0
          if (item.id === undefined) item.id = 0
          if (item.prompt === undefined) item.prompt = ''
        }
        gallery.value = saved.gallery
      }

      if (saved.resonance) {
        const migrated = {}
        for (const k in saved.resonance) {
          if (typeof saved.resonance[k] === 'number') {
            migrated[k] = { level: saved.resonance[k], count: saved.resonance[k] }
          } else {
            migrated[k] = saved.resonance[k]
          }
        }
        resonance.value = migrated
      }

      if (saved.newCardCount) newCardCount.value = saved.newCardCount
      if (saved.pityCounter) pityCounter.value = saved.pityCounter
    } catch (e) {
      console.warn('💾 IndexedDB 加载失败:', e)
    }
  }

  /* ================================================================
     初始化
  ================================================================ */
  loadState()

  return {
    // state
    uploadImage,
    imageBase64,
    selectedStyle,
    params,
    gallery,
    resonance,
    currentResult,
    newCardCount,
    pityCounter,
    isGenerating,
    generateProgress,
    generateState,
    errorMessage,
    viewState,
    detailStyleId,
    viewingStyleId,

    // computed
    currentResonance,
    currentStyleData,
    deviationCount,
    currentProb,
    canGenerate,
    hasNewCards,
    galleryByStyle,
    galleryStyleCount,
    detailCards,

    // actions
    selectStyle,
    setParam,
    setUploadImage,
    resetUpload,
    generate,
    collectResult,
    resetGenerate,
    getStyleResonance,
    getResonanceProgress,
    showMain,
    showGallery,
    showGalleryDetail,
    showGalleryCard,
    closeGalleryCard,
    clearGalleryData,
    deleteCurrentFromGallery,
    saveState,
    loadState,

    // constants
    buildPrompt,
  }
})
