<script setup>
import { ref } from 'vue'

const input = ref('')
const output = ref('')
const error = ref('')
const mode = ref('yaml-to-properties') // or 'properties-to-yaml'

const yamlToProperties = (yamlText) => {
  const lines = yamlText.trim().split('\n')
  const result = []
  const stack = []

  lines.forEach((line) => {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) return

    // Calculate indentation level
    const indent = line.search(/\S/)
    const trimmed = line.trim()

    // Adjust stack based on indentation
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }

    // Parse key-value
    if (trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':')
      const key = trimmed.substring(0, colonIndex).trim()
      const value = trimmed.substring(colonIndex + 1).trim()

      const fullKey = stack.length > 0
        ? stack.map(s => s.key).join('.') + '.' + key
        : key

      if (value) {
        // Has value - add to properties
        result.push(`${fullKey}=${value}`)
      } else {
        // No value - it's a parent key
        stack.push({ key, indent })
      }
    }
  })

  return result.join('\n')
}

const propertiesToYaml = (propsText) => {
  const lines = propsText.trim().split('\n')
  const tree = {}

  lines.forEach((line) => {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) return

    const equalIndex = line.indexOf('=')
    if (equalIndex === -1) return

    const key = line.substring(0, equalIndex).trim()
    const value = line.substring(equalIndex + 1).trim()

    // Build nested object
    const parts = key.split('.')
    let current = tree

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = value
      } else {
        if (!current[part]) current[part] = {}
        current = current[part]
      }
    })
  })

  // Convert tree to YAML
  const buildYaml = (obj, indent = 0) => {
    const spaces = '  '.repeat(indent)
    let result = []

    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        result.push(`${spaces}${key}:`)
        result.push(buildYaml(value, indent + 1))
      } else {
        result.push(`${spaces}${key}: ${value}`)
      }
    })

    return result.join('\n')
  }

  return buildYaml(tree)
}

const convert = () => {
  error.value = ''
  output.value = ''

  if (!input.value.trim()) {
    error.value = 'Please enter data to convert'
    return
  }

  try {
    if (mode.value === 'yaml-to-properties') {
      output.value = yamlToProperties(input.value)
    } else {
      output.value = propertiesToYaml(input.value)
    }
  } catch (e) {
    error.value = `Error: ${e.message}`
  }
}

const swapMode = () => {
  mode.value = mode.value === 'yaml-to-properties'
    ? 'properties-to-yaml'
    : 'yaml-to-properties'

  // Swap input and output
  const temp = input.value
  input.value = output.value
  output.value = temp
  error.value = ''
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
  if (mode.value === 'yaml-to-properties') {
    input.value = `spring:
  application:
    name: my-app
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: secret
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8080
  servlet:
    context-path: /api`
  } else {
    input.value = `spring.application.name=my-app
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=secret
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.port=8080
server.servlet.context-path=/api`
  }
  convert()
}
</script>

<template>
  <div class="yaml-properties">
    <div class="page-header">
      <h1 class="page-title">YAML ↔ Properties Converter</h1>
      <p class="page-description">Convert between YAML and Java Properties formats</p>
    </div>

    <div class="controls">
      <div class="mode-selector">
        <label>Conversion Mode:</label>
        <select v-model="mode" class="select-input">
          <option value="yaml-to-properties">YAML → Properties</option>
          <option value="properties-to-yaml">Properties → YAML</option>
        </select>
      </div>

      <div class="button-group">
        <button @click="convert" class="btn btn-primary">Convert</button>
        <button @click="swapMode" class="btn btn-secondary">⇄ Swap</button>
        <button @click="loadSample" class="btn btn-secondary">Load Sample</button>
        <button @click="clearAll" class="btn btn-danger">Clear</button>
      </div>
    </div>

    <div class="editor-container">
      <div class="editor-panel">
        <div class="panel-header">
          <h3>{{ mode === 'yaml-to-properties' ? 'YAML Input' : 'Properties Input' }}</h3>
        </div>
        <textarea
          v-model="input"
          :placeholder="`Paste your ${mode === 'yaml-to-properties' ? 'YAML' : 'Properties'} here...`"
          class="code-editor"
        ></textarea>
      </div>

      <div class="editor-panel">
        <div class="panel-header">
          <h3>{{ mode === 'yaml-to-properties' ? 'Properties Output' : 'YAML Output' }}</h3>
          <button v-if="output" @click="copyToClipboard" class="copy-btn">📋 Copy</button>
        </div>
        <textarea
          v-model="output"
          placeholder="Converted output will appear here..."
          class="code-editor"
          readonly
        ></textarea>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<style scoped>
.yaml-properties {
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

.mode-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mode-selector label {
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