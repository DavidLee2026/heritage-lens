<template>
  <div class="rarity-preview" v-if="store.currentProb">
    <!-- 第一行：稀有度概率 -->
    <div class="prob-line">
      稀有度概率：
      <span class="rq">清赏 {{ store.currentProb[0] }}%</span>
      <span class="sep">·</span>
      <span class="rz">珍赏 {{ store.currentProb[1] }}%</span>
      <span class="sep">·</span>
      <span class="rs">神品 {{ store.currentProb[2] }}%</span>
    </div>

    <!-- 第二行：共鸣度 + 匠运 -->
    <div class="sub-line">
      <!-- 共鸣度 (Lv.0-Lv.5 均显示具体数值) -->
      <span class="reso-tag">
        共鸣度 Lv.{{ resoLevel }}
        <span class="reso-bonus">珍赏+{{ bonus.zhen }}% · 神品+{{ bonus.shen }}%</span>
        <span v-if="bonus.jump > 0" class="reso-jump">· 跃迁{{ bonus.jump }}%</span>
      </span>

      <!-- 匠运 + 5 圆点 + 保底说明 -->
      <span class="pity-wrap">
        <span class="pity-label">匠运</span>
        <span
          v-for="i in PITY_珍赏_MAX"
          :key="i"
          class="p-dot"
          :class="{ on: i <= pity珍赏, warn: i === PITY_珍赏_MAX && near珍赏 }"
        ></span>
        <span class="pity-text">生成 6 次必出珍赏</span>
      </span>
    </div>

    <!-- 第三行：保底/状态提示（正向表达） -->
    <div class="hint-line">
      <span v-if="near珍赏" class="hint-fire">🔥 再生成 1 次必出珍赏！</span>
      <span v-else-if="pity神品Active" class="hint-fire">🔥 神品概率翻倍中！</span>
      <span v-else-if="pity神品 >= 3" class="hint-warm">✨ 距离神品越来越近了，再试试看！</span>
      <span v-else-if="pity珍赏 >= 2" class="hint-warm">💪 匠运积累中，珍赏概率持续提升</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore.js'
import {
  PITY_珍赏_MAX,
  PITY_神品_MAX,
  RESO_BONUS_TABLE,
} from '../data/constants.js'

const store = useGameStore()

const resoLevel = computed(() => store.currentResonance.level)
const bonus = computed(() => RESO_BONUS_TABLE[resoLevel.value] || RESO_BONUS_TABLE[0])
const pity珍赏 = computed(() => Math.min(store.pityCounter.no珍赏, PITY_珍赏_MAX))
const pity神品 = computed(() => store.pityCounter.no神品)
const near珍赏 = computed(() => store.pityCounter.no珍赏 >= PITY_珍赏_MAX - 1)
const pity神品Active = computed(() => store.pityCounter.no神品 >= PITY_神品_MAX)
</script>

<style scoped>
.rarity-preview {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
  padding: 8px 0 4px;
}
.prob-line { margin-bottom: 4px; }
.rq { color: #8a8580; font-weight: 500; }
.rz { color: #a8862a; font-weight: 500; }
.rs { color: #9e2a2b; font-weight: 600; }
.sep { color: var(--border-primary); margin: 0 3px; }

.sub-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 11px;
  margin-bottom: 2px;
}

/* 共鸣度标签 */
.reso-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 600;
  color: #7a6540;
  background: #fdfaf0;
  border: 1px solid #e8dcc0;
}
.reso-zero {
  color: var(--text-tertiary);
  background: #f8f6f2;
  border-color: #e5e0d8;
  font-weight: 400;
}
.reso-bonus {
  font-weight: 700;
  color: #9a8a4a;
}
.reso-jump {
  font-weight: 700;
  color: #9e2a2b;
  font-size: 10px;
}

/* 匠运圆点 */
.pity-wrap {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.pity-text {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-left: 2px;
  white-space: nowrap;
}
.pity-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-right: 3px;
}
.p-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #e5e0d8;
  border: 1px solid #d5d0c8;
  transition: all 0.3s;
}
.p-dot.on {
  background: #d4a853;
  border-color: #c49a40;
  box-shadow: 0 0 5px rgba(212,168,83,0.35);
}
.p-dot.warn {
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 5px rgba(212,168,83,0.35); }
  50% { transform: scale(1.25); box-shadow: 0 0 10px rgba(212,168,83,0.6); }
}

/* 状态提示 */
.hint-line {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 600;
}
.hint-fire {
  color: #d47000;
  animation: pulse 1.5s ease-in-out infinite;
}
.hint-warm {
  color: var(--text-tertiary);
  font-weight: 500;
}
</style>
