<script setup>
import { ref } from 'vue'

const input = ref('')
const output = ref('')
const columnName = ref('id')
const delimiter = ref('newline')
const quoteType = ref('single')
const error = ref('')

const generateInClause = () => {
  error.value = ''
  output.value = ''

  if (!input.value.trim()) {
    error.value = 'Please enter values'
    return
  }

  try {
    let values = []

    // Split by delimiter
    if (delimiter.value === 'newline') {
      values = input.value.split('\n')
    } else if (delimiter.value === 'comma') {
      values = input.value.split(',')
    } else if (delimiter.value === 'space') {
      values = input.value.split(/\s+/)
    } else if (delimiter.value === 'tab') {
      values = input.value.split('\t')
    }

    // Clean up values
    values = values
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((v) => {
        // Remove existing quotes
        v = v.replace(/^['"`]|['"`]$/g, '')
        return v
      })

    if (values.length === 0) {
      error.value = 'No valid values found'
      return
    }

    // Apply quotes
    let quotedValues
    if (quoteType.value === 'single') {
      quotedValues = values.map((v) => `'${v.replace(/'/g, "''")}'`)
    } else if (quoteType.value === 'double') {
      quotedValues = values.map((v) => `"${v.replace(/"/g, '""')}"`)
    } else {
      quotedValues = values
    }

    // Generate IN clause
    const inClause = quotedValues.join(', ')
    output.value = `${columnName.value} IN (${inClause})`
  } catch (e) {
    error.value = `Error: ${e.message}`
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
  input.value = `100
200
300
400
500`
  columnName.value = 'user_id'
  generateInClause()
}
</script>

<template>
  <div class="in-clause">
    <div class="page-header">
      <h1 class="page-title">IN Clause Generator</h1>
      <p class="page-description">Generate SQL IN clauses from lists of values</p>
    </div>

    <div class="controls">
      <div class="control-group">
        <label for="column">Column Name:</label>
        <input
          id="column"
          v-model="columnName"
          type="text"
          class="text-input"
          placeholder="column_name"
        />
      </div>

      <div class="control-group">
        <label for="delimiter">Delimiter:</label>
        <select id="delimiter" v-model="delimiter" class="select-input">
          <option value="newline">New Line</option>
          <option value="comma">Comma</option>
          <option value="space">Space</option>
          <option value="tab">Tab</option>
        </select>
      </div>

      <div class="control-group">
        <label for="quote">Quote Type:</label>
        <select id="quote" v-model="quoteType" class="select-input">
          <option value="single">Single Quotes (')</option>
          <option value="double">Double Quotes (")</option>
          <option value="none">No Quotes</option>
        </select>
      </div>

      <div class="button-group">
        <button @click="generateInClause" class="btn btn-primary">Generate</button>
        <button @click="loadSample" class="btn btn-secondary">Load Sample</button>
        <button @click="clearAll" class="btn btn-danger">Clear</button>
      </div>
    </div>

    <div class="editor-container">
      <div class="editor-panel">
        <div class="panel-header">
          <h3>Input Values</h3>
        </div>
        <textarea
          v-model="input"
          placeholder="Enter values (one per line by default)..."
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
          placeholder="Generated IN clause will appear here..."
          class="code-editor"
          readonly
        ></textarea>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<style scoped>
.in-clause {
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

.text-input {
  padding: 0.5rem 1rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
  min-width: 150px;
}

.text-input:focus {
  outline: none;
  border-color: #6366f1;
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

  .control-group {
    width: 100%;
  }

  .text-input,
  .select-input {
    flex: 1;
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
