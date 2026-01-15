<script setup>
import { ref, watch } from 'vue'
import QRCode from 'qrcode'

const input = ref('')
const qrCodeUrl = ref('')
const size = ref(300)
const errorCorrection = ref('M')
const darkColor = ref('#000000')
const lightColor = ref('#FFFFFF')

const generateQR = async () => {
  if (!input.value.trim()) {
    qrCodeUrl.value = ''
    return
  }

  try {
    const options = {
      width: size.value,
      errorCorrectionLevel: errorCorrection.value,
      color: {
        dark: darkColor.value,
        light: lightColor.value,
      },
    }

    const url = await QRCode.toDataURL(input.value, options)
    qrCodeUrl.value = url
  } catch (err) {
    console.error('Error generating QR code:', err)
  }
}

watch([input, size, errorCorrection, darkColor, lightColor], () => {
  generateQR()
})

const downloadQR = () => {
  if (!qrCodeUrl.value) return

  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = qrCodeUrl.value
  link.click()
}

const clearAll = () => {
  input.value = ''
  qrCodeUrl.value = ''
}

const loadSample = () => {
  input.value = 'https://example.com'
  generateQR()
}
</script>

<template>
  <div class="qr-generator">
    <div class="page-header">
      <h1 class="page-title">QR Code Generator</h1>
      <p class="page-description">Generate QR codes for URLs, text, or any data</p>
    </div>

    <div class="controls">
      <button @click="loadSample" class="btn btn-primary">Load Sample</button>
      <button @click="clearAll" class="btn btn-secondary">Clear</button>
      <button v-if="qrCodeUrl" @click="downloadQR" class="btn btn-success">⬇ Download</button>
    </div>

    <div class="content-grid">
      <div class="input-section">
        <div class="panel-header">
          <h3>Input Data</h3>
        </div>
        <textarea
          v-model="input"
          placeholder="Enter URL, text, or any data to encode..."
          class="input-area"
          rows="6"
        ></textarea>

        <div class="options-section">
          <div class="option-group">
            <label>Size: {{ size }}px</label>
            <input
              v-model.number="size"
              type="range"
              min="150"
              max="600"
              step="50"
              class="slider"
            />
          </div>

          <div class="option-group">
            <label>Error Correction</label>
            <select v-model="errorCorrection" class="select-input">
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>

          <div class="color-group">
            <div class="color-option">
              <label>Dark Color</label>
              <input v-model="darkColor" type="color" class="color-input" />
              <code>{{ darkColor }}</code>
            </div>

            <div class="color-option">
              <label>Light Color</label>
              <input v-model="lightColor" type="color" class="color-input" />
              <code>{{ lightColor }}</code>
            </div>
          </div>
        </div>
      </div>

      <div class="preview-section">
        <div class="panel-header">
          <h3>QR Code Preview</h3>
        </div>
        <div class="preview-container">
          <div v-if="qrCodeUrl" class="qr-display">
            <img :src="qrCodeUrl" alt="QR Code" class="qr-image" />
          </div>
          <div v-else class="empty-state">
            <p>Enter data to generate QR code</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-generator {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #e5e7eb;
  margin-bottom: 0.5rem;
}

.page-description {
  color: #9ca3af;
  font-size: 1rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: #2d2d44;
  color: #e5e7eb;
}

.btn-secondary:hover {
  background: #3d3d54;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.input-section,
.preview-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  padding: 0.75rem 1rem;
  background: #16162a;
  border-bottom: 1px solid #2d2d44;
}

.panel-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-area {
  width: 100%;
  padding: 1rem;
  background: #0f0f1e;
  border: none;
  border-bottom: 1px solid #2d2d44;
  color: #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

.input-area::placeholder {
  color: #6b7280;
}

.options-section {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.slider {
  width: 100%;
  height: 6px;
  background: #2d2d44;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #6366f1;
  border-radius: 50%;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #6366f1;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.select-input {
  padding: 0.5rem 0.75rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
  cursor: pointer;
}

.select-input:focus {
  outline: none;
  border-color: #6366f1;
}

.color-group {
  display: flex;
  gap: 1rem;
}

.color-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-option label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.color-input {
  width: 100%;
  height: 40px;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  cursor: pointer;
  background: #0f0f1e;
}

.color-option code {
  font-size: 0.75rem;
  color: #10b981;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

.preview-container {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.qr-display {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.qr-image {
  display: block;
  max-width: 100%;
  height: auto;
}

.empty-state {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

@media (max-width: 968px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .color-group {
    flex-direction: column;
  }
}
</style>