<script setup>
import { ref, computed } from 'vue'

const input = ref('')
const error = ref('')

const decodedHeader = ref(null)
const decodedPayload = ref(null)
const signature = ref('')

const decodeJwt = () => {
  error.value = ''
  decodedHeader.value = null
  decodedPayload.value = null
  signature.value = ''

  if (!input.value.trim()) {
    error.value = 'Please enter a JWT token'
    return
  }

  try {
    const parts = input.value.trim().split('.')

    if (parts.length !== 3) {
      error.value = 'Invalid JWT format. JWT should have 3 parts separated by dots.'
      return
    }

    // Decode header
    try {
      const headerJson = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'))
      decodedHeader.value = JSON.parse(headerJson)
    } catch (e) {
      error.value = 'Failed to decode header: Invalid base64 encoding'
      return
    }

    // Decode payload
    try {
      const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
      decodedPayload.value = JSON.parse(payloadJson)
    } catch (e) {
      error.value = 'Failed to decode payload: Invalid base64 encoding'
      return
    }

    // Store signature (can't decode without secret key)
    signature.value = parts[2]
  } catch (e) {
    error.value = `Decoding error: ${e.message}`
  }
}

const formattedHeader = computed(() => {
  return decodedHeader.value ? JSON.stringify(decodedHeader.value, null, 2) : ''
})

const formattedPayload = computed(() => {
  return decodedPayload.value ? JSON.stringify(decodedPayload.value, null, 2) : ''
})

const copyHeader = async () => {
  if (formattedHeader.value) {
    await navigator.clipboard.writeText(formattedHeader.value)
  }
}

const copyPayload = async () => {
  if (formattedPayload.value) {
    await navigator.clipboard.writeText(formattedPayload.value)
  }
}

const clearAll = () => {
  input.value = ''
  decodedHeader.value = null
  decodedPayload.value = null
  signature.value = ''
  error.value = ''
}

const loadSample = () => {
  input.value =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzY4MjM1MjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  decodeJwt()
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A'
  try {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString()
  } catch (e) {
    return 'Invalid timestamp'
  }
}
</script>

<template>
  <div class="jwt-decoder">
    <div class="page-header">
      <h1 class="page-title">JWT Decoder</h1>
      <p class="page-description">Decode and inspect JSON Web Tokens (JWT)</p>
    </div>

    <div class="controls">
      <div class="button-group">
        <button @click="decodeJwt" class="btn btn-primary">Decode</button>
        <button @click="loadSample" class="btn btn-secondary">Load Sample</button>
        <button @click="clearAll" class="btn btn-danger">Clear</button>
      </div>
    </div>

    <div class="input-section">
      <div class="panel-header">
        <h3>JWT Token</h3>
      </div>
      <textarea
        v-model="input"
        placeholder="Paste your JWT token here..."
        class="code-editor input-editor"
      ></textarea>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="decodedHeader || decodedPayload" class="output-section">
      <div class="output-grid">
        <!-- Header -->
        <div class="output-panel">
          <div class="panel-header">
            <h3>Header</h3>
            <button v-if="formattedHeader" @click="copyHeader" class="copy-btn" title="Copy">
              📋 Copy
            </button>
          </div>
          <pre class="code-output">{{ formattedHeader }}</pre>
        </div>

        <!-- Payload -->
        <div class="output-panel">
          <div class="panel-header">
            <h3>Payload</h3>
            <button v-if="formattedPayload" @click="copyPayload" class="copy-btn" title="Copy">
              📋 Copy
            </button>
          </div>
          <pre class="code-output">{{ formattedPayload }}</pre>
          <div v-if="decodedPayload" class="payload-info">
            <div v-if="decodedPayload.iat" class="info-item">
              <span class="info-label">Issued At:</span>
              <span class="info-value">{{ formatTimestamp(decodedPayload.iat) }}</span>
            </div>
            <div v-if="decodedPayload.exp" class="info-item">
              <span class="info-label">Expires At:</span>
              <span class="info-value">{{ formatTimestamp(decodedPayload.exp) }}</span>
            </div>
            <div v-if="decodedPayload.nbf" class="info-item">
              <span class="info-label">Not Before:</span>
              <span class="info-value">{{ formatTimestamp(decodedPayload.nbf) }}</span>
            </div>
          </div>
        </div>

        <!-- Signature -->
        <div class="output-panel signature-panel">
          <div class="panel-header">
            <h3>Signature</h3>
          </div>
          <div class="signature-content">
            <code class="signature-text">{{ signature }}</code>
            <p class="signature-note">
              Note: Signature verification requires the secret key and cannot be done in the
              browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jwt-decoder {
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
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
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

.input-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
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

.input-editor {
  width: 100%;
  min-height: 120px;
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

.input-editor::placeholder {
  color: #6b7280;
}

.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #fca5a5;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.output-section {
  margin-top: 1.5rem;
}

.output-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.output-panel {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
}

.signature-panel {
  grid-column: 1 / -1;
}

.code-output {
  padding: 1rem;
  background: #0f0f1e;
  color: #10b981;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.payload-info {
  padding: 1rem;
  background: #16162a;
  border-top: 1px solid #2d2d44;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #2d2d44;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
}

.info-value {
  color: #e5e7eb;
  font-size: 0.875rem;
}

.signature-content {
  padding: 1rem;
  background: #0f0f1e;
}

.signature-text {
  display: block;
  color: #a78bfa;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  word-break: break-all;
  padding: 1rem;
  background: #1a1a2e;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.signature-note {
  color: #9ca3af;
  font-size: 0.75rem;
  font-style: italic;
  margin: 0;
}

@media (max-width: 768px) {
  .output-grid {
    grid-template-columns: 1fr;
  }

  .signature-panel {
    grid-column: 1;
  }
}
</style>
