/**
 * 非遗映像 — 游戏常量配置
 * 概率制、保底参数、稀有度映射
 */
export const PARAMS = [
  { key: 'density', label: '纹样密度', options: ['简约', '标准', '极致'] },
  { key: 'pattern', label: '纹样风格', options: ['经典', '混搭', '现代'] },
  { key: 'finish', label: '质感光泽', options: ['温润', '标准', '强烈'] },
]

export const RARITY_NAMES = ['清赏 ✦', '珍赏 ✦✦', '神品 ✦✦✦']
export const RARITY_CLASS = ['qingshang', 'zhenshang', 'shenpin']
export const RARITY_ABBR = ['清赏', '珍赏', '神品']
export const RARITY_COLORS = ['#8a8580', '#a8862a', '#9e2a2b']

export const CARD_IMAGES = ['💍', '👑', '🪷', '🔥', '🔷', '🌸']

export const BUBBLE_DIMS = ['纹样', '工艺', '传承', '寓意']
export const BUBBLE_ICONS = ['🌀', '🔨', '📜', '✨']

// 概率制系统（产品逻辑 v3.0）
export const PROB_TABLE = [
  [80, 18, 2],   // 0 维偏离：清赏 · 珍赏 · 神品
  [50, 40, 10],  // 1 维偏离
  [20, 55, 25],  // 2 维偏离
  [5, 50, 45],   // 3 维偏离
]

export const RESO_BONUS_LV2 = { 珍赏: 5, 神品: 3 } // 共鸣Lv.2+ 概率加成
export const RESO_JUMP_LV4 = 18                     // 共鸣Lv.4 跃迁率
export const PITY_珍赏_MAX = 5                      // 连续N次无珍赏+ → 强制珍赏
export const PITY_神品_MAX = 10                     // 连续N次无神品 → 概率翻倍

// 共鸣升级阈值
export const RESONANCE_LEVELS = [0, 1, 3, 5, 8, 12]

// 默认参数（"标准"档）
export const DEFAULT_PARAMS = { density: 1, pattern: 1, finish: 1 }
