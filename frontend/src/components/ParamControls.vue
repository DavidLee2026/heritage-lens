<template>
  <div class="section">
    <div class="section-title">
      调参 · 选择你的视觉风格
      <span class="section-tag">审美选择，非稀有度控制</span>
    </div>
    <div v-for="(p, i) in paramsConfig" :key="p.key" class="param-group">
      <div class="param-label">
        {{ p.label }}
        <span class="param-value">{{ p.options[store.params[p.key]] }}</span>
      </div>
      <div class="param-dots">
        <div
          v-for="(opt, j) in p.options"
          :key="j"
          class="param-dot"
          :class="{ active: store.params[p.key] === j }"
          @click="store.setParam(i, j)"
        >
          {{ opt }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore.js'
import { PARAMS } from '../data/constants.js'

const store = useGameStore()
const paramsConfig = PARAMS
</script>

<style scoped>
.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.section-tag {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 400;
}
.param-group {
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  padding: 12px 14px;
  border: 1px solid var(--border-primary);
}
.param-label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
}
.param-value {
  font-size: 12px;
  color: var(--accent);
  font-weight: 400;
}
.param-dots {
  display: flex;
  gap: 6px;
}
.param-dot {
  flex: 1;
  text-align: center;
  padding: 8px 4px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: 0.15s;
  background: var(--silver, #e0d9ce);
  color: var(--text-secondary);
}
.param-dot.active {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}
</style>
