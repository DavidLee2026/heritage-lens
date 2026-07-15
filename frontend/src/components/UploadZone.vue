<template>
  <div
    class="upload-area"
    :class="{ 'has-img': store.uploadImage, dragover: dragOver }"
    @dragover.prevent="dragOver = true"
    @dragleave="dragOver = false"
    @drop.prevent="handleDrop"
  >
    <template v-if="!store.uploadImage">
      <div class="upload-options">
        <div class="upload-option" @click="triggerUpload">
          <div class="uo-icon-wrap">
            <span class="uo-icon">📷</span>
          </div>
          <span class="uo-label">上传照片</span>
          <span class="uo-hint">选择一张清晰的正脸照</span>
        </div>
        <div class="upload-option" @click="loadSample">
          <div class="uo-icon-wrap uo-icon-wrap--sample">
            <span class="uo-icon">✨</span>
          </div>
          <span class="uo-label">使用样例</span>
          <span class="uo-hint">没有照片？先试试效果</span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="preview-wrap">
        <button class="preview-cancel" @click.stop="cancelImage" title="重新选择">✕</button>
        <img :src="store.uploadImage" class="upload-preview" alt="预览" @click="triggerUpload" />
        <div class="upload-status">✅ 点击照片可更换 · ✕ 取消选择</div>
      </div>
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

const emit = defineEmits(['uploaded'])
const store = useGameStore()
const fileInput = ref(null)
const dragOver = ref(false)

const SAMPLE_COUNT = 3

function randomSamplePath() {
  const idx = Math.floor(Math.random() * SAMPLE_COUNT) + 1
  return `/images/female/female_0${idx}.jpg`
}

function triggerUpload() {
  fileInput.value?.click()
}

function loadSample() {
  store.resetGenerate()
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    const base64 = dataUrl.split(',')[1]
    store.setUploadImage(dataUrl, base64)
    emit('uploaded')
  }
  img.onerror = () => {
    store.showToast('样例图片加载失败，请尝试上传自己的照片', 'error')
  }
  img.src = randomSamplePath()
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

function cancelImage() {
  store.resetUpload()
  store.showToast('已清除，可重新选择照片或使用样图', 'info')
}

function processFile(file) {
  if (!file || !/^image\/(png|jpe?g)/.test(file.type)) {
    store.showToast('请上传 JPG 或 PNG 格式的图片', 'error')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    store.showToast('图片超过 10MB 限制，请压缩后再试', 'error')
    return
  }

  store.resetGenerate()

  const reader = new FileReader()
  reader.onload = (ev) => {
    const data = ev.target.result
    const base64 = data.split(',')[1]
    store.setUploadImage(data, base64)
    store.showToast('照片已加载 ✅ 选择风格开始生成', 'success')
    emit('uploaded')
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.upload-area {
  background: var(--bg-elevated);
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 18px 14px;
  text-align: center;
  cursor: default;
  transition: 0.2s;
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
  cursor: pointer;
}

/* ===== 两个选项按钮 ===== */
.upload-options {
  display: flex;
  gap: 10px;
}
.upload-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px 14px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
  /* 质感：渐变底 + 内阴影 + 外阴影 */
  background: linear-gradient(160deg, #ffffff 0%, #f5f0e8 100%);
  border: 1px solid var(--border-light);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 2px 8px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
.upload-option:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 6px 20px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border-color: var(--accent-gold);
}
.upload-option:active {
  transform: scale(0.97);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

/* 图标圆形底座 */
.uo-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a365d 0%, #2a4a7d 100%);
  box-shadow: 0 2px 8px rgba(26, 54, 93, 0.3);
  margin-bottom: 2px;
}
.uo-icon-wrap--sample {
  background: linear-gradient(135deg, #8e2a2b 0%, #b8432a 100%);
  box-shadow: 0 2px 8px rgba(142, 42, 43, 0.3);
}
.uo-icon {
  font-size: 22px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
}
.uo-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}
.uo-hint {
  font-size: 11px;
  color: var(--text-tertiary);
  line-height: 1.4;
}

/* 预览态 */
.preview-wrap {
  position: relative;
  display: inline-block;
  width: 100%;
}
.preview-cancel {
  position: absolute;
  top: -6px;
  right: -6px;
  z-index: 10;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.15s;
  line-height: 1;
  font-family: inherit;
  backdrop-filter: blur(4px);
}
.preview-cancel:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}
.preview-cancel:active { transform: scale(0.9); }
.upload-preview {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.15s;
}
.upload-preview:hover { opacity: 0.85; }
.upload-preview:active { opacity: 0.7; }
.upload-status {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
  text-align: center;
}
.file-input { display: none; }
</style>
