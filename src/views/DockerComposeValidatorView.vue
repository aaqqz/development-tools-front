<script setup>
import { ref, computed } from 'vue'

const input = ref('')
const validationResults = ref([])
const isValid = ref(null)

const validateCompose = () => {
  validationResults.value = []
  isValid.value = null

  if (!input.value.trim()) {
    validationResults.value.push({
      type: 'error',
      message: 'Please enter Docker Compose content',
    })
    isValid.value = false
    return
  }

  const issues = []

  // Check for version
  if (!input.value.match(/version:\s*['"]?\d/i)) {
    issues.push({
      type: 'error',
      category: 'Structure',
      message: 'Missing version field',
      suggestion: "Add 'version' field at the top (e.g., version: '3.8')",
    })
  }

  // Check for services
  if (!input.value.match(/services:/i)) {
    issues.push({
      type: 'error',
      category: 'Structure',
      message: 'Missing services section',
      suggestion: "Add 'services:' section to define containers",
    })
  }

  // Check for deprecated 'links'
  if (input.value.match(/links:/i)) {
    issues.push({
      type: 'warning',
      category: 'Deprecation',
      message: "Use of deprecated 'links' found",
      suggestion: "Use 'depends_on' instead of 'links'",
    })
  }

  // Check for exposed ports without mapping
  const exposedPorts = input.value.match(/expose:\s*\n([\s\S]*?)(?=\n\s{0,4}\w|$)/gi)
  if (exposedPorts) {
    issues.push({
      type: 'info',
      category: 'Best Practice',
      message: "Using 'expose' without port mapping",
      suggestion: "Consider using 'ports' for external access",
    })
  }

  // Check for missing restart policy
  if (!input.value.match(/restart:/i)) {
    issues.push({
      type: 'info',
      category: 'Best Practice',
      message: 'No restart policy specified',
      suggestion: "Add 'restart: unless-stopped' or 'restart: always'",
    })
  }

  // Check for hardcoded environment variables
  const envMatches = input.value.match(/environment:\s*\n([\s\S]*?)(?=\n\s{0,6}\w|$)/gi)
  if (envMatches) {
    envMatches.forEach((match) => {
      if (match.match(/password|secret|key|token/i)) {
        issues.push({
          type: 'warning',
          category: 'Security',
          message: 'Potential sensitive data in environment variables',
          suggestion: 'Use env_file or secrets for sensitive data',
        })
      }
    })
  }

  // Check for missing healthcheck
  if (!input.value.match(/healthcheck:/i)) {
    issues.push({
      type: 'info',
      category: 'Best Practice',
      message: 'No healthcheck defined',
      suggestion: 'Add healthcheck for better container monitoring',
    })
  }

  // Check for using 'latest' tag
  if (input.value.match(/image:.*:latest/i) || input.value.match(/image:\s*\w+\s*$/m)) {
    issues.push({
      type: 'warning',
      category: 'Best Practice',
      message: "Using 'latest' or no tag for image",
      suggestion: 'Specify explicit version tags for reproducibility',
    })
  }

  // Check for privileged mode
  if (input.value.match(/privileged:\s*true/i)) {
    issues.push({
      type: 'warning',
      category: 'Security',
      message: 'Using privileged mode',
      suggestion: 'Avoid privileged mode unless absolutely necessary',
    })
  }

  // Check for host network mode
  if (input.value.match(/network_mode:\s*host/i)) {
    issues.push({
      type: 'warning',
      category: 'Security',
      message: 'Using host network mode',
      suggestion: 'Use custom networks for better isolation',
    })
  }

  // Check for missing resource limits
  if (!input.value.match(/mem_limit:|memory:/i)) {
    issues.push({
      type: 'info',
      category: 'Best Practice',
      message: 'No memory limits specified',
      suggestion: 'Add memory limits to prevent resource exhaustion',
    })
  }

  // Check YAML indentation
  const lines = input.value.split('\n')
  lines.forEach((line, index) => {
    if (line.trim() && !line.match(/^\s*#/)) {
      const spaces = line.match(/^\s*/)[0].length
      if (spaces % 2 !== 0) {
        issues.push({
          type: 'error',
          category: 'Syntax',
          message: `Line ${index + 1}: Inconsistent indentation`,
          suggestion: 'Use 2 or 4 spaces for indentation',
        })
      }
    }
  })

  // Check for duplicate keys
  const serviceMatches = input.value.match(/^\s{2,4}(\w+):/gm)
  if (serviceMatches) {
    const services = serviceMatches.map((m) => m.trim().replace(':', ''))
    const duplicates = services.filter((item, index) => services.indexOf(item) !== index)
    if (duplicates.length > 0) {
      issues.push({
        type: 'error',
        category: 'Structure',
        message: `Duplicate service names found: ${[...new Set(duplicates)].join(', ')}`,
        suggestion: 'Ensure all service names are unique',
      })
    }
  }

  // Check for volume syntax in v3
  const version = input.value.match(/version:\s*['"]?(\d+)/i)
  if (version && version[1] === '3') {
    if (input.value.match(/volume_driver:/i)) {
      issues.push({
        type: 'error',
        category: 'Version Compatibility',
        message: "volume_driver is not supported in v3",
        suggestion: "Use 'driver' instead of 'volume_driver'",
      })
    }
  }

  validationResults.value = issues

  // Determine overall validity
  const hasErrors = issues.some((issue) => issue.type === 'error')
  isValid.value = !hasErrors
}

const getTypeIcon = (type) => {
  switch (type) {
    case 'error':
      return '❌'
    case 'warning':
      return '⚠️'
    case 'info':
      return 'ℹ️'
    default:
      return '•'
  }
}

const getTypeClass = (type) => {
  switch (type) {
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return ''
  }
}

const resultsSummary = computed(() => {
  const errors = validationResults.value.filter((r) => r.type === 'error').length
  const warnings = validationResults.value.filter((r) => r.type === 'warning').length
  const info = validationResults.value.filter((r) => r.type === 'info').length

  return { errors, warnings, info }
})

const clearAll = () => {
  input.value = ''
  validationResults.value = []
  isValid.value = null
}

const loadSample = () => {
  input.value = `version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    links:
      - api
    environment:
      - API_KEY=secret123
      - PASSWORD=admin

  api:
    image: node
    expose:
      - 3000
    privileged: true
    network_mode: host

volumes:
  data:
    volume_driver: local`
  validateCompose()
}
</script>

<template>
  <div class="docker-compose-validator">
    <div class="page-header">
      <h1 class="page-title">Docker Compose Validator</h1>
      <p class="page-description">Validate Docker Compose files and check best practices</p>
    </div>

    <div class="controls">
      <div class="button-group">
        <button @click="validateCompose" class="btn btn-primary">Validate</button>
        <button @click="loadSample" class="btn btn-secondary">Load Sample (with issues)</button>
        <button @click="clearAll" class="btn btn-danger">Clear</button>
      </div>
    </div>

    <div class="validator-container">
      <div class="input-panel">
        <div class="panel-header">
          <h3>Docker Compose YAML</h3>
        </div>
        <textarea
          v-model="input"
          placeholder="Paste your docker-compose.yml content here..."
          class="code-editor"
        ></textarea>
      </div>

      <div class="results-panel">
        <div class="panel-header">
          <h3>Validation Results</h3>
          <div v-if="isValid !== null" class="validation-badge" :class="{ valid: isValid, invalid: !isValid }">
            {{ isValid ? '✓ Valid' : '✗ Invalid' }}
          </div>
        </div>

        <div v-if="validationResults.length === 0 && isValid === null" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>Click "Validate" to check your Docker Compose file</p>
        </div>

        <div v-else-if="validationResults.length === 0 && isValid === true" class="success-state">
          <div class="success-icon">✅</div>
          <h3>All checks passed!</h3>
          <p>Your Docker Compose file looks good.</p>
        </div>

        <div v-else class="results-content">
          <div class="summary">
            <div class="summary-item error" v-if="resultsSummary.errors > 0">
              <span class="count">{{ resultsSummary.errors }}</span>
              <span class="label">Error{{ resultsSummary.errors !== 1 ? 's' : '' }}</span>
            </div>
            <div class="summary-item warning" v-if="resultsSummary.warnings > 0">
              <span class="count">{{ resultsSummary.warnings }}</span>
              <span class="label">Warning{{ resultsSummary.warnings !== 1 ? 's' : '' }}</span>
            </div>
            <div class="summary-item info" v-if="resultsSummary.info > 0">
              <span class="count">{{ resultsSummary.info }}</span>
              <span class="label">Info</span>
            </div>
          </div>

          <div class="issues-list">
            <div
              v-for="(issue, index) in validationResults"
              :key="index"
              :class="['issue-card', getTypeClass(issue.type)]"
            >
              <div class="issue-header">
                <span class="issue-icon">{{ getTypeIcon(issue.type) }}</span>
                <span class="issue-category">{{ issue.category }}</span>
              </div>
              <div class="issue-message">{{ issue.message }}</div>
              <div v-if="issue.suggestion" class="issue-suggestion">
                <span class="suggestion-label">💡 Suggestion:</span>
                {{ issue.suggestion }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.docker-compose-validator {
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
}

.button-group {
  display: flex;
  gap: 0.5rem;
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

.validator-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.input-panel,
.results-panel {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 0.75rem 1rem;
  background: #16162a;
  border-bottom: 1px solid #2d2d44;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.validation-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.validation-badge.valid {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid #10b981;
}

.validation-badge.invalid {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid #ef4444;
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
  min-height: 600px;
}

.code-editor::placeholder {
  color: #6b7280;
}

.results-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  max-height: 600px;
}

.empty-state,
.success-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #9ca3af;
}

.empty-icon,
.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-state h3 {
  color: #10b981;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #0f0f1e;
  border-radius: 6px;
  border: 2px solid;
  min-width: 100px;
}

.summary-item.error {
  border-color: #ef4444;
}

.summary-item.warning {
  border-color: #fbbf24;
}

.summary-item.info {
  border-color: #6366f1;
}

.summary-item .count {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e5e7eb;
}

.summary-item .label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.issue-card {
  padding: 1rem;
  background: #0f0f1e;
  border-radius: 6px;
  border-left: 4px solid;
}

.issue-card.error {
  border-color: #ef4444;
}

.issue-card.warning {
  border-color: #fbbf24;
}

.issue-card.info {
  border-color: #6366f1;
}

.issue-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.issue-icon {
  font-size: 1rem;
}

.issue-category {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.issue-message {
  color: #e5e7eb;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.issue-suggestion {
  color: #9ca3af;
  font-size: 0.75rem;
  font-style: italic;
  padding: 0.5rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 4px;
}

.suggestion-label {
  color: #fbbf24;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .validator-container {
    grid-template-columns: 1fr;
  }

  .results-panel {
    order: -1;
  }
}
</style>
