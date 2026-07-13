<template>
  <div
    class="upload-area"
    :class="{ 'has-img': store.uploadImage, dragover: dragOver }"
    @click="triggerUpload"
    @dragover.prevent="dragOver = true"
    @dragleave="dragOver = false"
    @drop.prevent="handleDrop"
  >
    <template v-if="!store.uploadImage">
      <span class="upload-icon">📸</span>
      <div class="upload-label">上传你的照片</div>
      <div class="upload-hint">点击选择照片 · 正面半身照效果最佳</div>
    </template>
    <template v-else>
      <img :src="store.uploadImage" class="upload-preview" alt="预览" />
      <div class="upload-status">✅ 已上传，选择风格继续</div>
    </template>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="file-input"
      @change="handleFile"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore.js'

const store = useGameStore()
const fileInput = ref(null)
const dragOver = ref(false)

function triggerUpload() {
  fileInput.value?.click()
}

function handleDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function handleFile(e) {
  const file = e.target.files?.[0]
  if (file) processFile(file)
}

function processFile(file) {
  if (!file || !/^image\/(png|jpe?g)/.test(file.type)) {
    store.errorMessage = '请上传 JPG 或 PNG 格式的图片'
    setTimeout(() => (store.errorMessage = ''), 3000)
    return
  }

  store.resetGenerate()

  const reader = new FileReader()
  reader.onload = (ev) => {
    const data = ev.target.result
    const base64 = data.split(',')[1]
    store.setUploadImage(data, base64)
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.upload-area {
  background: var(--bg-elevated);
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
}
.upload-area:hover {
  border-color: var(--accent);
  background: var(--accent-light);
}
.upload-area.dragover {
  border-color: var(--accent-gold);
  background: var(--accent-light);
  transform: scale(1.01);
}
.upload-area.has-img {
  padding: 12px;
  border-style: solid;
  border-color: var(--border-light);
}
.upload-icon { font-size: 40px; display: block; margin-bottom: 8px; }
.upload-label { font-weight: 600; margin-bottom: 4px; font-size: 14px; }
.upload-hint { font-size: 12px; color: var(--text-secondary); }
.upload-preview {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 6px;
}
.upload-status {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
}
.file-input { display: none; }
</style>
