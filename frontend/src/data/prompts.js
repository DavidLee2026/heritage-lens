/**
 * 非遗映像 — 提示词映射表
 * 参数层 × 风格层 × 渲染品质层 + 背景层 → 完整提示词
 *
 * 纯数据（prompts.json） + 拼装逻辑（本文件）分离
 */
import data from './prompts.json'

export const STYLE_PROMPTS = Object.fromEntries(
  Object.entries(data.styles).map(([id, s]) => [id, s.base])
)

export const PARAM_PROMPTS = data.params

export const RARITY_PROMPTS = data.rarity

export const NEGATIVE_PROMPT = data.negative

/**
 * 组装完整提示词（含背景描述）
 * 结构：人物前缀 + 风格描述 + 背景 + 参数方向 + 品质追加
 *
 * @param {string} styleId
 * @param {object} params - { density, pattern, finish } 各 0-2
 * @param {number} rarity - 0清赏 1珍赏 2神品
 * @param {string} [subjectType='female'] - 'female' | 'male'
 * @returns {{ prompt: string, negative: string }}
 */
export function buildPrompt(styleId, params, rarity, subjectType = 'female') {
  const style = data.styles[styleId]
  if (!style) return { prompt: '民族风格服饰，正面半身照', negative: data.negative }

  // 人物前缀（如"一位身穿华丽银饰的苗族少女"）
  const prefix = subjectType === 'male' ? style.male_prefix : style.female_prefix

  // 风格基础描述
  const base = style.base

  // 背景描述
  const bg = style.background

  // 参数方向（审美选择）
  const density = data.params.density[params.density]
  const pattern = data.params.pattern[params.pattern]
  const finish = data.params.finish[params.finish]
  const styleDir = `${density}，${pattern}，${finish}`

  // 品质追加（基于稀有度）
  const quality = data.rarity[rarity] || ''

  // 风格特有 negative
  const styleNeg = data.style_negative[styleId]
  const negative = styleNeg ? `${data.negative}, ${styleNeg}` : data.negative

  const prompt = `${prefix}，${base}，${bg}，${styleDir}${quality}`

  return { prompt, negative }
}
