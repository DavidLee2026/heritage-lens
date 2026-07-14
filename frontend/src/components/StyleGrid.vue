<template>
  <div class="section" id="styleSection">
    <div class="style-grid">
      <div
        v-for="s in styles"
        :key="s.id"
        class="style-card"
        :class="{ active: store.selectedStyle === s.id }"
        @click="store.selectStyle(s.id)"
      >
        <span class="sc-emoji">{{ s.emoji }}</span>
        <div class="sc-name">{{ s.name }}<span v-if="store.selectedStyle === s.id" class="sc-chosen">· 已选</span></div>
        <div class="sc-heritage">{{ s.heritage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore.js'
import { STYLES } from '../data/styles.js'

const store = useGameStore()
const styles = STYLES
</script>

<style scoped>
.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.style-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.style-card {
  position: relative;
  background: var(--bg-elevated);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 14px 8px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
}
.style-card:active { transform: scale(0.96); }
.style-card.active {
  border-color: var(--accent);
  background: var(--accent-light);
}
.sc-emoji { font-size: 28px; display: block; }
.sc-name { font-size: 12px; font-weight: 600; margin-top: 4px; }
.sc-heritage { font-size: 10px; color: var(--text-secondary); margin-top: 2px; }

/* 选中指示：温柔的文字提示 */
.sc-chosen {
  font-size: 10px;
  color: var(--accent);
  font-weight: 400;
  margin-left: 2px;
}
</style>
