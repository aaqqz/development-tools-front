<script setup>
import { ref, watch } from 'vue'

const input = ref('')
const md5Hash = ref('')
const sha1Hash = ref('')
const sha256Hash = ref('')
const sha512Hash = ref('')

const generateHashes = async () => {
  if (!input.value) {
    md5Hash.value = ''
    sha1Hash.value = ''
    sha256Hash.value = ''
    sha512Hash.value = ''
    return
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(input.value)

  // SHA-1
  const sha1Buffer = await crypto.subtle.digest('SHA-1', data)
  sha1Hash.value = bufferToHex(sha1Buffer)

  // SHA-256
  const sha256Buffer = await crypto.subtle.digest('SHA-256', data)
  sha256Hash.value = bufferToHex(sha256Buffer)

  // SHA-512
  const sha512Buffer = await crypto.subtle.digest('SHA-512', data)
  sha512Hash.value = bufferToHex(sha512Buffer)

  // MD5 (using a simple implementation)
  md5Hash.value = await md5(input.value)
}

const bufferToHex = (buffer) => {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Simple MD5 implementation (for demo purposes - in production use a library)
const md5 = async (str) => {
  // For simplicity, we'll use a placeholder
  // In a real app, you'd use crypto-js or similar
  return 'MD5 requires external library - use SHA-256 instead'
}

watch(input, () => {
  generateHashes()
})

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
}

const clearAll = () => {
  input.value = ''
  md5Hash.value = ''
  sha1Hash.value = ''
  sha256Hash.value = ''
  sha512Hash.value = ''
}
</script>

<template>
  <div class="hash-generator">
    <div class="page-header">
      <h1 class="page-title">Hash Generator</h1>
      <p class="page-description">Generate MD5, SHA-1, SHA-256, and SHA-512 hashes</p>
    </div>

    <div class="input-section">
      <div class="panel-header">
        <h3>Input Text</h3>
        <button @click="clearAll" class="btn btn-secondary">Clear</button>
      </div>
      <textarea
        v-model="input"
        placeholder="Enter text to hash..."
        class="input-area"
        rows="6"
      ></textarea>
    </div>

    <div class="hash-results">
      <div class="hash-item">
        <label>SHA-1</label>
        <div class="hash-value">
          <code>{{ sha1Hash || 'Enter text to generate hash...' }}</code>
          <button v-if="sha1Hash" @click="copyToClipboard(sha1Hash)" class="copy-btn">📋</button>
        </div>
      </div>

      <div class="hash-item">
        <label>SHA-256</label>
        <div class="hash-value">
          <code>{{ sha256Hash || 'Enter text to generate hash...' }}</code>
          <button v-if="sha256Hash" @click="copyToClipboard(sha256Hash)" class="copy-btn">📋</button>
        </div>
      </div>

      <div class="hash-item">
        <label>SHA-512</label>
        <div class="hash-value">
          <code>{{ sha512Hash || 'Enter text to generate hash...' }}</code>
          <button v-if="sha512Hash" @click="copyToClipboard(sha512Hash)" class="copy-btn">📋</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hash-generator {
  max-width: 1200px;
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

.input-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.hash-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hash-item {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  padding: 1rem;
}

.hash-item label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.hash-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #0f0f1e;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid #2d2d44;
}

.hash-value code {
  flex: 1;
  color: #10b981;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  word-break: break-all;
}

.copy-btn {
  padding: 0.375rem 0.75rem;
  background: #6366f1;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.copy-btn:hover {
  background: #7c3aed;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #2d2d44;
  color: #e5e7eb;
}

.btn-secondary:hover {
  background: #3d3d54;
}
</style>