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

// 共鸣等级概率加成表：index = 等级, { 珍赏加成, 神品加成, 跃迁率% }
// 从清赏概率中扣除，按比例转移到珍赏/神品（溢出时截断，保证总和100%）
export const RESO_BONUS_TABLE = [
  { zhen: 0,  shen: 0,  jump: 0   },  // Lv.0
  { zhen: 2,  shen: 1,  jump: 0   },  // Lv.1 解锁工艺气泡
  { zhen: 5,  shen: 3,  jump: 0   },  // Lv.2 解锁传承气泡
  { zhen: 8,  shen: 5,  jump: 0   },  // Lv.3 全部四识
  { zhen: 12, shen: 6,  jump: 18  },  // Lv.4 寓意辉光 + 跃迁
  { zhen: 16, shen: 9,  jump: 30  },  // Lv.5 满级全效 + 高跃迁
]

export const RESO_JUMP_LV4 = 18                     // 共鸣Lv.4 跃迁率（兼容旧引用）
export const PITY_珍赏_MAX = 5                      // 连续N次无珍赏+ → 强制珍赏
export const PITY_神品_MAX = 10                     // 连续N次无神品 → 概率翻倍（神品保持稀缺）

// 共鸣升级阈值
export const RESONANCE_LEVELS = [0, 1, 3, 5, 8, 12]

// 默认参数（"标准"档）
export const DEFAULT_PARAMS = { density: 1, pattern: 1, finish: 1 }
