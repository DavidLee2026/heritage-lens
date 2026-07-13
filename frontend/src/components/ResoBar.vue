<template>
  <div class="resonance-bar">
    <div class="level" :class="levelClass">{{ `Lv.${reso.level}` }}</div>
    <div class="info">
      <div class="name">{{ styleData?.emoji }} {{ styleData?.name || '未知' }}</div>
      <div class="progress">{{ remainText }}</div>
      <div class="reso-track">
        <div class="reso-fill" :style="{ width: prog.pct + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore.js'

const store = useGameStore()

const reso = computed(() => store.currentResonance)
const styleData = computed(() => store.currentStyleData)
const prog = computed(() => store.getResonanceProgress(store.selectedStyle))

const levelClass = computed(() => `lv${reso.value.level}`)
const remainText = computed(() =>
  prog.value.remain > 0 ? `还需 ${prog.value.remain} 次升级` : '已满级 ✨'
)
</script>

<style scoped>
.resonance-bar {
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.level {
  font-size: 24px;
  font-weight: 800;
  min-width: 36px;
  font-family: var(--font-display);
}
.level.lv0 { color: var(--text-tertiary); }
.level.lv1 { color: var(--silver, #e0d9ce); }
.level.lv2 { color: var(--text-secondary); }
.level.lv3 { color: var(--accent-gold); }
.level.lv4 { color: var(--accent-gold); }
.level.lv5 {
  background: linear-gradient(135deg, var(--accent-gold), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.info { flex: 1; }
.name { font-weight: 600; font-size: 13px; }
.progress { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
.reso-track {
  height: 4px;
  background: var(--border-primary);
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
}
.reso-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--silver, #e0d9ce), var(--accent-gold));
  border-radius: 2px;
  transition: width 0.3s;
}
</style>
