<template>
  <div class="header">
    <h1 class="header-title">🏮 非遗映像</h1>
    <span class="header-badge">共鸣 {{ resoLabel }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore.js'

const store = useGameStore()
const resoLabel = computed(() => `Lv.${store.currentResonance.level}`)
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
.header-title {
  font-size: 20px;
  font-weight: 700;
  flex: 1;
  font-family: var(--font-display);
}
.header-badge {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
