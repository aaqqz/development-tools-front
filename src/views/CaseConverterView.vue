<script setup>
import { ref, computed } from 'vue'

const input = ref('')

const splitWords = (text) => {
  // Split by spaces, underscores, hyphens, and camelCase
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // Split PascalCase with acronyms
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .split(/\s+/)
    .filter(word => word.length > 0)
}

const camelCase = computed(() => {
  if (!input.value.trim()) return ''
  const words = splitWords(input.value)
  return words
    .map((word, index) => {
      word = word.toLowerCase()
      return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join('')
})

const pascalCase = computed(() => {
  if (!input.value.trim()) return ''
  const words = splitWords(input.value)
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
})

const snakeCase = computed(() => {
  if (!input.value.trim()) return ''
  const words = splitWords(input.value)
  return words.map(word => word.toLowerCase()).join('_')
})

const kebabCase = computed(() => {
  if (!input.value.trim()) return ''
  const words = splitWords(input.value)
  return words.map(word => word.toLowerCase()).join('-')
})

const constantCase = computed(() => {
  if (!input.value.trim()) return ''
  const words = splitWords(input.value)
  return words.map(word => word.toUpperCase()).join('_')
})

const titleCase = computed(() => {
  if (!input.value.trim()) return ''
  const words = splitWords(input.value)
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
})

const sentenceCase = computed(() => {
  if (!input.value.trim()) return ''
  const words = splitWords(input.value)
  const sentence = words.map(word => word.toLowerCase()).join(' ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1)
})

const dotCase = computed(() => {
  if (!input.value.trim()) return ''
  const words = splitWords(input.value)
  return words.map(word => word.toLowerCase()).join('.')
})

const pathCase = computed(() => {
  if (!input.value.trim()) return ''
  const words = splitWords(input.value)
  return words.map(word => word.toLowerCase()).join('/')
})

const cases = computed(() => [
  { name: 'camelCase', value: camelCase.value, description: 'First word lowercase, rest capitalized' },
  { name: 'PascalCase', value: pascalCase.value, description: 'All words capitalized' },
  { name: 'snake_case', value: snakeCase.value, description: 'Lowercase with underscores' },
  { name: 'kebab-case', value: kebabCase.value, description: 'Lowercase with hyphens' },
  { name: 'CONSTANT_CASE', value: constantCase.value, description: 'Uppercase with underscores' },
  { name: 'Title Case', value: titleCase.value, description: 'Each word capitalized' },
  { name: 'Sentence case', value: sentenceCase.value, description: 'Only first letter capitalized' },
  { name: 'dot.case', value: dotCase.value, description: 'Lowercase with dots' },
  { name: 'path/case', value: pathCase.value, description: 'Lowercase with slashes' },
])

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
}

const clearAll = () => {
  input.value = ''
}

const loadSample = () => {
  input.value = 'Hello World Example'
}
</script>

<template>
  <div class="case-converter">
    <div class="page-header">
      <h1 class="page-title">Case Converter</h1>
      <p class="page-description">Convert text between different naming conventions</p>
    </div>

    <div class="controls">
      <button @click="loadSample" class="btn btn-primary">Load Sample</button>
      <button @click="clearAll" class="btn btn-secondary">Clear</button>
    </div>

    <div class="input-section">
      <div class="panel-header">
        <h3>Input Text</h3>
      </div>
      <textarea
        v-model="input"
        placeholder="Enter text to convert (e.g., 'Hello World', 'helloWorld', 'hello_world')..."
        class="input-area"
        rows="4"
      ></textarea>
    </div>

    <div v-if="input.trim()" class="results-grid">
      <div
        v-for="caseType in cases"
        :key="caseType.name"
        class="case-item"
      >
        <div class="case-header">
          <label>{{ caseType.name }}</label>
          <button @click="copyToClipboard(caseType.value)" class="copy-btn">📋</button>
        </div>
        <div class="case-description">{{ caseType.description }}</div>
        <div class="case-value">
          <code>{{ caseType.value }}</code>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Enter some text above to see conversions in different cases</p>
    </div>
  </div>
</template>

<style scoped>
.case-converter {
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

.input-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
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
  color: #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

.input-area::placeholder {
  color: #6b7280;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.case-item {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.case-item:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.case-header label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #a78bfa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.copy-btn {
  padding: 0.25rem 0.5rem;
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

.case-description {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.75rem;
}

.case-value {
  background: #0f0f1e;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #2d2d44;
}

.case-value code {
  color: #10b981;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  word-break: break-all;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
  font-size: 0.875rem;
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>