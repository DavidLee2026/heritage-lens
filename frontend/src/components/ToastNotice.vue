<template>
  <Teleport to="body">
    <transition name="toast">
      <div v-if="visible" class="reso-upgrade-toast">
        🎵 共鸣升级！Lv.{{ level }} · 解锁新内容 ✨
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  level: { type: Number, default: 0 },
})

const emit = defineEmits(['done'])
const visible = ref(false)

watch(
  () => props.level,
  (val) => {
    if (val > 0) {
      visible.value = true
      setTimeout(() => {
        visible.value = false
        emit('done')
      }, 3000)
    }
  }
)
</script>

<style scoped>
.reso-upgrade-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: #fff;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 300;
  white-space: nowrap;
  pointer-events: none;
}
.toast-enter-active {
  transition: all 300ms ease-out;
}
.toast-leave-active {
  transition: all 300ms ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
