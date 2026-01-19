<script setup>
import { ref, computed } from 'vue'

const input = ref('')
const output = ref('')
const error = ref('')
const sourceVersion = ref('auto')
const targetVersion = ref('3')
const indentSize = ref(2)

const detectVersion = (yaml) => {
  const versionMatch = yaml.match(/version:\s*['"]?(\d+(?:\.\d+)?)/i)
  if (versionMatch) {
    const version = versionMatch[1]
    if (version.startsWith('2')) return '2'
    if (version.startsWith('3')) return '3'
  }
  return 'unknown'
}

const convertV2ToV3 = (yaml) => {
  let converted = yaml

  // Update version
  converted = converted.replace(/version:\s*['"]?2(\.\d+)?['"]?/i, "version: '3.8'")

  // Convert links to depends_on
  converted = converted.replace(/(\s+)links:/g, '$1depends_on:')

  // Convert volume_driver to driver (in volumes section)
  converted = converted.replace(/volume_driver:/g, 'driver:')

  // Add deploy section if using resources
  const serviceBlocks = converted.split(/(?=\s{2}\w+:)/g)
  const updatedBlocks = serviceBlocks.map((block) => {
    if (block.includes('cpu_shares:') || block.includes('mem_limit:')) {
      let newBlock = block

      // Extract resource limits
      const cpuMatch = block.match(/cpu_shares:\s*(\d+)/)
      const memMatch = block.match(/mem_limit:\s*(\S+)/)

      if (cpuMatch || memMatch) {
        // Remove old resource configs
        newBlock = newBlock.replace(/\s+cpu_shares:.*$/gm, '')
        newBlock = newBlock.replace(/\s+mem_limit:.*$/gm, '')

        // Add deploy section
        const indent = '    '
        let deploySection = `${indent}deploy:\n${indent}  resources:\n${indent}    limits:\n`

        if (memMatch) {
          deploySection += `${indent}      memory: ${memMatch[1]}\n`
        }
        if (cpuMatch) {
          const cpus = (parseInt(cpuMatch[1]) / 1024).toFixed(2)
          deploySection += `${indent}      cpus: '${cpus}'\n`
        }

        newBlock += '\n' + deploySection
      }

      return newBlock
    }
    return block
  })

  converted = updatedBlocks.join('')

  return converted
}

const convertV3ToV2 = (yaml) => {
  let converted = yaml

  // Update version
  converted = converted.replace(/version:\s*['"]?3(\.\d+)?['"]?/i, "version: '2.4'")

  // Convert depends_on to links (if simple array)
  converted = converted.replace(/(\s+)depends_on:/g, '$1links:')

  // Remove deploy sections
  converted = converted.replace(/\s+deploy:[\s\S]*?(?=\n\s{2,4}\w+:|\n\w+:|\n*$)/g, '')

  // Convert driver back to volume_driver in volumes
  converted = converted.replace(/(\s+)driver:(\s+\w+)/g, '$1volume_driver:$2')

  return converted
}

const convert = () => {
  error.value = ''
  output.value = ''

  if (!input.value.trim()) {
    error.value = 'Please enter Docker Compose content'
    return
  }

  try {
    const detectedVersion = sourceVersion.value === 'auto' ? detectVersion(input.value) : sourceVersion.value

    if (detectedVersion === 'unknown' && sourceVersion.value === 'auto') {
      error.value = 'Could not detect version. Please specify source version manually.'
      return
    }

    let converted = input.value

    if (detectedVersion === '2' && targetVersion.value === '3') {
      converted = convertV2ToV3(converted)
    } else if (detectedVersion === '3' && targetVersion.value === '2') {
      converted = convertV3ToV2(converted)
    } else if (detectedVersion === targetVersion.value) {
      error.value = `Source and target versions are the same (v${detectedVersion})`
      return
    }

    output.value = converted
  } catch (e) {
    error.value = `Conversion error: ${e.message}`
  }
}

const formatYaml = () => {
  if (!input.value.trim()) {
    error.value = 'Please enter Docker Compose content'
    return
  }

  try {
    error.value = ''
    // Simple YAML formatting
    const lines = input.value.split('\n')
    const indent = ' '.repeat(indentSize.value)
    let currentIndent = 0
    const formatted = []

    lines.forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed) {
        formatted.push('')
        return
      }

      // Decrease indent for closing or same-level keys
      if (line.match(/^\s*\w+:/) && currentIndent > 0) {
        const leadingSpaces = line.match(/^\s*/)[0].length
        if (leadingSpaces === 0) {
          currentIndent = 0
        }
      }

      formatted.push(trimmed)
    })

    output.value = formatted.join('\n')
  } catch (e) {
    error.value = `Formatting error: ${e.message}`
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
  input.value = `version: '2'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    links:
      - api
    mem_limit: 512m
    cpu_shares: 512

  api:
    image: node:16
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./app:/app

volumes:
  data:
    volume_driver: local`
  convert()
}
</script>

<template>
  <div class="docker-compose-converter">
    <div class="page-header">
      <h1 class="page-title">Docker Compose Converter</h1>
      <p class="page-description">Convert between Docker Compose v2 and v3 formats</p>
    </div>

    <div class="controls">
      <div class="control-group">
        <label for="source">Source Version:</label>
        <select id="source" v-model="sourceVersion" class="select-input">
          <option value="auto">Auto Detect</option>
          <option value="2">Version 2</option>
          <option value="3">Version 3</option>
        </select>
      </div>

      <div class="control-group">
        <label for="target">Target Version:</label>
        <select id="target" v-model="targetVersion" class="select-input">
          <option value="2">Version 2</option>
          <option value="3">Version 3</option>
        </select>
      </div>

      <div class="control-group">
        <label for="indent">Indent Size:</label>
        <select id="indent" v-model.number="indentSize" class="select-input">
          <option :value="2">2 spaces</option>
          <option :value="4">4 spaces</option>
        </select>
      </div>

      <div class="button-group">
        <button @click="convert" class="btn btn-primary">Convert</button>
        <button @click="formatYaml" class="btn btn-secondary">Format Only</button>
        <button @click="loadSample" class="btn btn-secondary">Load Sample</button>
        <button @click="clearAll" class="btn btn-danger">Clear</button>
      </div>
    </div>

    <div class="editor-container">
      <div class="editor-panel">
        <div class="panel-header">
          <h3>Input (docker-compose.yml)</h3>
        </div>
        <textarea
          v-model="input"
          placeholder="Paste your docker-compose.yml content here..."
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
          placeholder="Converted output will appear here..."
          class="code-editor"
          readonly
        ></textarea>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="info-section">
      <h3 class="info-title">Version Differences</h3>
      <div class="version-comparison">
        <div class="version-card">
          <h4>Version 2</h4>
          <ul>
            <li><code>links</code> - Link services</li>
            <li><code>mem_limit</code> - Memory limit</li>
            <li><code>cpu_shares</code> - CPU shares</li>
            <li><code>volume_driver</code> - Volume driver</li>
          </ul>
        </div>
        <div class="arrow">→</div>
        <div class="version-card">
          <h4>Version 3</h4>
          <ul>
            <li><code>depends_on</code> - Service dependencies</li>
            <li><code>deploy.resources.limits</code> - Resource limits</li>
            <li><code>deploy.resources.reservations</code> - Reservations</li>
            <li><code>driver</code> - Volume/network driver</li>
          </ul>
        </div>
      </div>
      <p class="info-note">
        Note: Version 3 is designed for Docker Swarm mode and has different resource management.
        Some v2 features may not have direct v3 equivalents.
      </p>
    </div>
  </div>
</template>

<style scoped>
.docker-compose-converter {
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
  white-space: nowrap;
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
  margin-bottom: 1.5rem;
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

.version-comparison {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 1rem;
}

.version-card {
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  padding: 1.5rem;
}

.version-card h4 {
  color: #6366f1;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.version-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.version-card li {
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #2d2d44;
}

.version-card li:last-child {
  border-bottom: none;
}

.version-card code {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

.arrow {
  color: #a78bfa;
  font-size: 2rem;
  font-weight: 700;
}

.info-note {
  color: #9ca3af;
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
  padding: 1rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 6px;
  border-left: 3px solid #6366f1;
}

@media (max-width: 768px) {
  .editor-container {
    grid-template-columns: 1fr;
  }

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
  }

  .btn {
    flex: 1;
  }

  .version-comparison {
    grid-template-columns: 1fr;
  }

  .arrow {
    text-align: center;
    transform: rotate(90deg);
  }
}
</style>
