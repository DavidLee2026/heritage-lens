<template>
  <div class="params-wrapper" :class="{ expanded: showParams }">
    <!-- 折叠态：虚线框 -->
    <div v-if="!showParams" class="params-folded" @click="showParams = true">
      <span class="pf-icon">▸</span>
      <span class="pf-label">调参 · 选择你的视觉风格</span>
    </div>
    <!-- 展开态：完整参数面板 -->
    <template v-else>
      <div class="params-header" @click="showParams = false">
        <span class="pf-icon">▾</span>
        <span class="pf-label">调参 · 选择你的视觉风格</span>
        <span class="pf-hint">点击收起</span>
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
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore.js'
import { PARAMS } from '../data/constants.js'

const store = useGameStore()
const paramsConfig = PARAMS
const showParams = ref(true)
</script>

<style scoped>
.params-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 折叠态：实底渐变按钮（确保在斜线之上） */
.params-folded {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 16px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  cursor: pointer;
  transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
  user-select: none;
  font-family: inherit;
  box-sizing: border-box;
  background: linear-gradient(160deg, #ffffff 0%, #f0ebe2 100%);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
.params-folded:hover {
  transform: translateY(-1px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 6px 20px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border-color: var(--accent-gold);
}
.params-folded:active {
  transform: scale(0.98);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

/* 展开态：标题行 */
.params-header {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  padding: 0 2px;
}
.params-header:hover { opacity: 0.7; }
.pf-icon {
  font-size: 13px;
  color: var(--accent);
  line-height: 1;
}
.pf-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}
.pf-hint {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 400;
  margin-left: auto;
}

/* 参数组 */
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
