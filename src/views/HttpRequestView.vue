<script setup>
import { ref, computed } from 'vue'

const url = ref('https://jsonplaceholder.typicode.com/posts/1')
const method = ref('GET')
const headers = ref([{ key: 'Content-Type', value: 'application/json', enabled: true }])
const body = ref('')
const response = ref(null)
const loading = ref(false)
const activeTab = ref('headers') // headers, body, response

const addHeader = () => {
  headers.value.push({ key: '', value: '', enabled: true })
}

const removeHeader = (index) => {
  headers.value.splice(index, 1)
}

const enabledHeaders = computed(() => {
  return headers.value.filter(h => h.enabled && h.key.trim())
})

const sendRequest = async () => {
  loading.value = true
  response.value = null

  try {
    const options = {
      method: method.value,
      headers: {}
    }

    // Add enabled headers
    enabledHeaders.value.forEach(header => {
      options.headers[header.key] = header.value
    })

    // Add body for non-GET requests
    if (method.value !== 'GET' && method.value !== 'HEAD' && body.value.trim()) {
      options.body = body.value
    }

    const startTime = Date.now()
    const res = await fetch(url.value, options)
    const endTime = Date.now()

    const responseHeaders = {}
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    let responseBody
    const contentType = res.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      responseBody = await res.json()
      responseBody = JSON.stringify(responseBody, null, 2)
    } else {
      responseBody = await res.text()
    }

    response.value = {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
      body: responseBody,
      time: endTime - startTime,
      size: new Blob([responseBody]).size
    }

    activeTab.value = 'response'
  } catch (err) {
    response.value = {
      error: true,
      message: err.message
    }
    activeTab.value = 'response'
  } finally {
    loading.value = false
  }
}

const formatBody = () => {
  try {
    const parsed = JSON.parse(body.value)
    body.value = JSON.stringify(parsed, null, 2)
  } catch (err) {
    console.error('Invalid JSON')
  }
}

const clearAll = () => {
  url.value = ''
  method.value = 'GET'
  headers.value = [{ key: 'Content-Type', value: 'application/json', enabled: true }]
  body.value = ''
  response.value = null
}

const loadSample = () => {
  url.value = 'https://jsonplaceholder.typicode.com/posts'
  method.value = 'POST'
  headers.value = [
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'Accept', value: 'application/json', enabled: true }
  ]
  body.value = JSON.stringify({
    title: 'Sample Post',
    body: 'This is a sample POST request',
    userId: 1
  }, null, 2)
}

const copyResponse = () => {
  if (response.value && !response.value.error) {
    navigator.clipboard.writeText(response.value.body)
  }
}
</script>

<template>
  <div class="http-request">
    <div class="page-header">
      <h1 class="page-title">HTTP Request Builder</h1>
      <p class="page-description">Build and test HTTP API requests</p>
    </div>

    <div class="controls">
      <button @click="loadSample" class="btn btn-primary">Load Sample</button>
      <button @click="clearAll" class="btn btn-secondary">Clear</button>
    </div>

    <div class="request-builder">
      <div class="url-section">
        <select v-model="method" class="method-select">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
          <option value="HEAD">HEAD</option>
          <option value="OPTIONS">OPTIONS</option>
        </select>
        <input
          v-model="url"
          type="text"
          placeholder="https://api.example.com/endpoint"
          class="url-input"
        />
        <button @click="sendRequest" :disabled="loading" class="send-btn">
          {{ loading ? 'Sending...' : 'Send' }}
        </button>
      </div>

      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'headers' }]"
          @click="activeTab = 'headers'"
        >
          Headers ({{ enabledHeaders.length }})
        </button>
        <button
          :class="['tab', { active: activeTab === 'body' }]"
          @click="activeTab = 'body'"
        >
          Body
        </button>
        <button
          v-if="response"
          :class="['tab', { active: activeTab === 'response' }]"
          @click="activeTab = 'response'"
        >
          Response
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'headers'" class="headers-panel">
          <div class="headers-list">
            <div
              v-for="(header, index) in headers"
              :key="index"
              class="header-row"
            >
              <input
                type="checkbox"
                v-model="header.enabled"
                class="header-checkbox"
              />
              <input
                v-model="header.key"
                type="text"
                placeholder="Header name"
                class="header-input"
              />
              <input
                v-model="header.value"
                type="text"
                placeholder="Header value"
                class="header-input"
              />
              <button @click="removeHeader(index)" class="remove-btn">✕</button>
            </div>
          </div>
          <button @click="addHeader" class="add-header-btn">+ Add Header</button>
        </div>

        <div v-if="activeTab === 'body'" class="body-panel">
          <div class="body-controls">
            <button @click="formatBody" class="btn-small">Format JSON</button>
          </div>
          <textarea
            v-model="body"
            placeholder="Request body (JSON, XML, etc.)..."
            class="body-textarea"
          ></textarea>
        </div>

        <div v-if="activeTab === 'response'" class="response-panel">
          <div v-if="response && !response.error" class="response-success">
            <div class="response-meta">
              <div class="meta-item">
                <label>Status:</label>
                <span :class="['status-badge', response.status < 300 ? 'success' : 'error']">
                  {{ response.status }} {{ response.statusText }}
                </span>
              </div>
              <div class="meta-item">
                <label>Time:</label>
                <span>{{ response.time }}ms</span>
              </div>
              <div class="meta-item">
                <label>Size:</label>
                <span>{{ (response.size / 1024).toFixed(2) }} KB</span>
              </div>
              <button @click="copyResponse" class="copy-btn">📋 Copy</button>
            </div>

            <div class="response-headers">
              <h4>Response Headers</h4>
              <div class="headers-list">
                <div v-for="(value, key) in response.headers" :key="key" class="header-item">
                  <span class="header-key">{{ key }}:</span>
                  <span class="header-value">{{ value }}</span>
                </div>
              </div>
            </div>

            <div class="response-body">
              <h4>Response Body</h4>
              <pre><code>{{ response.body }}</code></pre>
            </div>
          </div>

          <div v-else-if="response && response.error" class="response-error">
            <h4>Error</h4>
            <p>{{ response.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.http-request {
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

.request-builder {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
}

.url-section {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid #2d2d44;
}

.method-select {
  padding: 0.75rem 1rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  min-width: 120px;
}

.method-select:focus {
  outline: none;
  border-color: #6366f1;
}

.url-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

.url-input:focus {
  outline: none;
  border-color: #6366f1;
}

.url-input::placeholder {
  color: #6b7280;
}

.send-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #2d2d44;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab:hover {
  color: #e5e7eb;
  background: rgba(99, 102, 241, 0.05);
}

.tab.active {
  color: #c4b5fd;
  border-bottom-color: #6366f1;
}

.tab-content {
  padding: 1.5rem;
  min-height: 300px;
}

.headers-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.headers-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.header-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #6366f1;
}

.header-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

.header-input:focus {
  outline: none;
  border-color: #6366f1;
}

.header-input::placeholder {
  color: #6b7280;
}

.remove-btn {
  padding: 0.5rem;
  background: #ef4444;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #dc2626;
}

.add-header-btn {
  padding: 0.625rem 1rem;
  background: #2d2d44;
  border: none;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.add-header-btn:hover {
  background: #3d3d54;
}

.body-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.body-controls {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.5rem 1rem;
  background: #2d2d44;
  border: none;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-small:hover {
  background: #3d3d54;
}

.body-textarea {
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

.body-textarea::placeholder {
  color: #6b7280;
}

.response-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.response-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: #0f0f1e;
  border-radius: 6px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-item label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.875rem;
}

.status-badge.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.copy-btn {
  margin-left: auto;
  padding: 0.5rem 1rem;
  background: #6366f1;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: #7c3aed;
}

.response-headers,
.response-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.response-headers h4,
.response-body h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-item {
  padding: 0.5rem 0.75rem;
  background: #0f0f1e;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
}

.header-key {
  color: #a78bfa;
  font-weight: 600;
}

.header-value {
  color: #10b981;
}

.response-body pre {
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  max-height: 400px;
}

.response-body code {
  color: #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.response-error {
  padding: 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: 6px;
}

.response-error h4 {
  color: #ef4444;
  margin-bottom: 0.5rem;
}

.response-error p {
  color: #fca5a5;
}

@media (max-width: 768px) {
  .url-section {
    flex-direction: column;
  }

  .response-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .copy-btn {
    margin-left: 0;
  }
}
</style>