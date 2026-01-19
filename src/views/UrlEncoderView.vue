<script setup>
import { ref } from 'vue'

const input = ref('')
const output = ref('')
const error = ref('')
const mode = ref('encode')

const encode = () => {
  error.value = ''
  output.value = ''

  if (!input.value) {
    error.value = 'Please enter text to encode'
    return
  }

  try {
    output.value = encodeURIComponent(input.value)
  } catch (e) {
    error.value = `Encoding error: ${e.message}`
  }
}

const decode = () => {
  error.value = ''
  output.value = ''

  if (!input.value.trim()) {
    error.value = 'Please enter URL encoded text to decode'
    return
  }

  try {
    output.value = decodeURIComponent(input.value)
  } catch (e) {
    error.value = `Decoding error: Invalid URL encoded string`
  }
}

const process = () => {
  if (mode.value === 'encode') {
    encode()
  } else {
    decode()
  }
}

const copyToClipboard = async () => {
  if (output.value) {
    await navigator.clipboard.writeText(output.value)
  }
}

const clearAll = () => {
  input.value = ''
  output.value = ''
  error.value = ''
}

const loadSample = () => {
  if (mode.value === 'encode') {
    input.value = 'https://example.com/search?q=Hello World&filter=active'
  } else {
    input.value = 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3DHello%20World%26filter%3Dactive'
  }
  process()
}
</script>

<template>
  <div class="url-encoder">
    <div class="page-header">
      <h1 class="page-title">URL Encoder/Decoder</h1>
      <p class="page-description">Encode and decode URL strings for safe transmission</p>
    </div>

    <div class="controls">
      <div class="control-group">
        <label for="mode">Mode:</label>
        <select id="mode" v-model="mode" class="select-input" @change="clearAll">
          <option value="encode">Encode</option>
          <option value="decode">Decode</option>
        </select>
      </div>

      <div class="button-group">
        <button @click="process" class="btn btn-primary">
          {{ mode === 'encode' ? 'Encode' : 'Decode' }}
        </button>
        <button @click="loadSample" class="btn btn-secondary">Load Sample</button>
        <button @click="clearAll" class="btn btn-danger">Clear</button>
      </div>
    </div>

    <div class="editor-container">
      <div class="editor-panel">
        <div class="panel-header">
          <h3>Input</h3>
        </div>
        <textarea
          v-model="input"
          :placeholder="
            mode === 'encode'
              ? 'Enter URL or text to encode...'
              : 'Enter URL encoded text to decode...'
          "
          class="code-editor"
        ></textarea>
      </div>

      <div class="editor-panel">
        <div class="panel-header">
          <h3>Output</h3>
          <button v-if="output" @click="copyToClipboard" class="copy-btn" title="Copy to clipboard">
            📋 Copy
          </button>
        </div>
        <textarea
          v-model="output"
          placeholder="Result will appear here..."
          class="code-editor"
          readonly
        ></textarea>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<style scoped>
.url-encoder {
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
}

.select-input {
  padding: 0.5rem 1rem;
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

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.editor-panel {
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
  height: 500px;
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

.copy-btn {
  padding: 0.375rem 0.75rem;
  background: #6366f1;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: #7c3aed;
}

.code-editor {
  flex: 1;
  padding: 1rem;
  background: #0f0f1e;
  border: none;
  color: #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: none;
  outline: none;
}

.code-editor::placeholder {
  color: #6b7280;
}

.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #fca5a5;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .editor-container {
    grid-template-columns: 1fr;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .button-group {
    width: 100%;
    justify-content: stretch;
  }

  .btn {
    flex: 1;
  }
}
</style>