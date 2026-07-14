<template>
  <div class="header">
    <h1 class="header-title">🏮 非遗映像</h1>
    <span class="header-badge">传承 · 创新</span>
    <button class="header-about" @click="$emit('about')">关于</button>
  </div>
</template>

<script setup>
defineEmits(['about'])
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
  color: var(--accent-gold);
  font-weight: 600;
  letter-spacing: 1px;
}
.header-about {
  background: none;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
  font-family: inherit;
  color: var(--text-secondary);
  line-height: 1;
}
.header-about:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}
</style>
