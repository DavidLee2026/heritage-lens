<template>
  <div class="rarity-preview" v-if="store.currentProb">
    稀有度概率：
    <span style="color: #8a8580">清赏 {{ store.currentProb[0] }}%</span>
    ·
    <span style="color: #a8862a">珍赏 {{ store.currentProb[1] }}%</span>
    ·
    <span style="color: #9e2a2b">神品 {{ store.currentProb[2] }}%</span>
    <template v-if="hasResoBonus">
      <br />
      ✨ 共鸣Lv.{{ store.currentResonance.level }} 加成 +5%/+3%
    </template>
    <template v-if="nearPity">
      <br />
      ⚡ 下次必出珍赏以上！
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore.js'
import { PITY_珍赏_MAX } from '../data/constants.js'

const store = useGameStore()

const hasResoBonus = computed(() => store.currentResonance.level >= 2)
const nearPity = computed(() => store.pityCounter.no珍赏 >= PITY_珍赏_MAX - 1)
</script>

<style scoped>
.rarity-preview {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.7;
}
</style>
