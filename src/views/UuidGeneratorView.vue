<script setup>
import { ref } from 'vue'

const uuids = ref([])
const count = ref(1)
const version = ref('v4')
const uppercase = ref(false)
const hyphenated = ref(true)

const generateUuid = () => {
  // Generate UUID v4 (random)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const formatUuid = (uuid) => {
  let formatted = uuid
  if (!hyphenated.value) {
    formatted = uuid.replace(/-/g, '')
  }
  if (uppercase.value) {
    formatted = formatted.toUpperCase()
  }
  return formatted
}

const generateUuids = () => {
  const newUuids = []
  const numToGenerate = Math.min(Math.max(1, count.value), 100)

  for (let i = 0; i < numToGenerate; i++) {
    const uuid = generateUuid()
    newUuids.push(formatUuid(uuid))
  }

  uuids.value = newUuids
}

const copyAll = async () => {
  if (uuids.value.length > 0) {
    await navigator.clipboard.writeText(uuids.value.join('\n'))
  }
}

const copySingle = async (uuid) => {
  await navigator.clipboard.writeText(uuid)
}

const clearAll = () => {
  uuids.value = []
}

// Generate one UUID on mount
generateUuids()
</script>

<template>
  <div class="uuid-generator">
    <div class="page-header">
      <h1 class="page-title">UUID Generator</h1>
      <p class="page-description">Generate universally unique identifiers (UUID/GUID)</p>
    </div>

    <div class="controls">
      <div class="control-group">
        <label for="count">Count:</label>
        <input
          id="count"
          v-model.number="count"
          type="number"
          min="1"
          max="100"
          class="number-input"
        />
      </div>

      <div class="control-group">
        <label>
          <input v-model="uppercase" type="checkbox" class="checkbox-input" />
          Uppercase
        </label>
      </div>

      <div class="control-group">
        <label>
          <input v-model="hyphenated" type="checkbox" class="checkbox-input" />
          Hyphenated
        </label>
      </div>

      <div class="button-group">
        <button @click="generateUuids" class="btn btn-primary">Generate</button>
        <button v-if="uuids.length > 0" @click="copyAll" class="btn btn-secondary">
          Copy All
        </button>
        <button @click="clearAll" class="btn btn-danger">Clear</button>
      </div>
    </div>

    <div v-if="uuids.length > 0" class="output-section">
      <div class="output-header">
        <h3>Generated UUIDs ({{ uuids.length }})</h3>
      </div>
      <div class="uuid-list">
        <div v-for="(uuid, index) in uuids" :key="index" class="uuid-item">
          <code class="uuid-text">{{ uuid }}</code>
          <button @click="copySingle(uuid)" class="copy-btn" title="Copy">📋</button>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3 class="info-title">About UUIDs</h3>
      <p class="info-text">
        A UUID (Universally Unique Identifier) is a 128-bit number used to uniquely identify
        information. This tool generates UUID v4 (random) which uses random numbers for all bits
        except the version and variant fields.
      </p>
      <div class="info-details">
        <div class="info-item">
          <span class="info-label">Format:</span>
          <code class="info-value">xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</code>
        </div>
        <div class="info-item">
          <span class="info-label">Version:</span>
          <span class="info-value">4 (Random)</span>
        </div>
        <div class="info-item">
          <span class="info-label">Bits:</span>
          <span class="info-value">128-bit</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.uuid-generator {
  max-width: 1000px;
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 1rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  color: #9ca3af;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.number-input {
  padding: 0.5rem 1rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
  width: 80px;
}

.number-input:focus {
  outline: none;
  border-color: #6366f1;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #6366f1;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.output-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.output-header {
  padding: 0.75rem 1rem;
  background: #16162a;
  border-bottom: 1px solid #2d2d44;
}

.output-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.uuid-list {
  max-height: 400px;
  overflow-y: auto;
}

.uuid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #2d2d44;
  transition: background 0.2s ease;
}

.uuid-item:last-child {
  border-bottom: none;
}

.uuid-item:hover {
  background: rgba(99, 102, 241, 0.05);
}

.uuid-text {
  color: #10b981;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  flex: 1;
}

.copy-btn {
  padding: 0.375rem 0.75rem;
  background: #6366f1;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.copy-btn:hover {
  background: #7c3aed;
  opacity: 1;
}

.info-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  padding: 1.5rem;
}

.info-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 1rem;
}

.info-text {
  color: #9ca3af;
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.info-label {
  color: #6366f1;
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  color: #e5e7eb;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-group {
    width: 100%;
    justify-content: space-between;
  }

  .button-group {
    width: 100%;
    justify-content: stretch;
  }

  .btn {
    flex: 1;
  }

  .uuid-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .copy-btn {
    align-self: flex-end;
  }
}
</style>
