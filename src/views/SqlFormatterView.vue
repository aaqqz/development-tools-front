<script setup>
import { ref } from 'vue'

const input = ref('')
const output = ref('')
const error = ref('')
const indentSize = ref(2)

const keywords = [
  'SELECT',
  'FROM',
  'WHERE',
  'AND',
  'OR',
  'ORDER BY',
  'GROUP BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'INNER JOIN',
  'OUTER JOIN',
  'ON',
  'AS',
  'IN',
  'EXISTS',
  'NOT',
  'NULL',
  'IS',
  'LIKE',
  'BETWEEN',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'INSERT INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE FROM',
  'CREATE TABLE',
  'ALTER TABLE',
  'DROP TABLE',
  'TRUNCATE',
  'DISTINCT',
  'COUNT',
  'SUM',
  'AVG',
  'MAX',
  'MIN',
]

const formatSql = () => {
  error.value = ''
  output.value = ''

  if (!input.value.trim()) {
    error.value = 'Please enter SQL query'
    return
  }

  try {
    let sql = input.value.trim()
    const indent = ' '.repeat(indentSize.value)

    // Remove extra whitespace
    sql = sql.replace(/\s+/g, ' ')

    // Add line breaks before major keywords
    const majorKeywords = [
      'SELECT',
      'FROM',
      'WHERE',
      'ORDER BY',
      'GROUP BY',
      'HAVING',
      'LIMIT',
      'UNION',
      'INSERT INTO',
      'UPDATE',
      'DELETE FROM',
      'VALUES',
    ]

    majorKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      sql = sql.replace(regex, `\n${keyword}`)
    })

    // Add line breaks before JOIN keywords
    const joinKeywords = ['JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN']
    joinKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      sql = sql.replace(regex, `\n${keyword}`)
    })

    // Add line breaks before AND/OR in WHERE clauses
    sql = sql.replace(/\b(AND|OR)\b/gi, (match) => `\n${indent}${match}`)

    // Add line breaks after commas in SELECT
    sql = sql.replace(/,\s*/g, ',\n' + indent)

    // Clean up and format
    let lines = sql.split('\n').map((line) => line.trim())
    let formatted = []
    let currentIndent = 0

    lines.forEach((line) => {
      if (!line) return

      // Decrease indent for certain keywords
      if (
        line.match(/^\b(WHERE|ORDER BY|GROUP BY|HAVING|LIMIT)\b/i) ||
        line.match(/^\b(FROM)\b/i)
      ) {
        currentIndent = 0
      }

      // Add the line with current indentation
      if (line.match(/^\b(AND|OR)\b/i)) {
        formatted.push(indent + line)
      } else if (line.match(/^\b(SELECT)\b/i)) {
        formatted.push(line)
        currentIndent = 1
      } else if (currentIndent > 0 && !line.match(/^\b(FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|ORDER BY|GROUP BY|HAVING|LIMIT)\b/i)) {
        formatted.push(indent.repeat(currentIndent) + line)
      } else {
        formatted.push(line)
      }

      // Increase indent after SELECT
      if (line.match(/^\b(SELECT)\b/i)) {
        currentIndent = 1
      } else if (line.match(/^\b(FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN)\b/i)) {
        currentIndent = 1
      }
    })

    output.value = formatted.join('\n')
  } catch (e) {
    error.value = `Formatting error: ${e.message}`
  }
}

const minifySql = () => {
  error.value = ''
  output.value = ''

  if (!input.value.trim()) {
    error.value = 'Please enter SQL query'
    return
  }

  try {
    output.value = input.value.replace(/\s+/g, ' ').trim()
  } catch (e) {
    error.value = `Minifying error: ${e.message}`
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
  input.value = `SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND u.created_at > '2024-01-01' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY order_count DESC LIMIT 10`
  formatSql()
}
</script>

<template>
  <div class="sql-formatter">
    <div class="page-header">
      <h1 class="page-title">SQL Formatter</h1>
      <p class="page-description">Format and beautify your SQL queries</p>
    </div>

    <div class="controls">
      <div class="control-group">
        <label for="indent">Indent Size:</label>
        <select id="indent" v-model.number="indentSize" class="select-input">
          <option :value="2">2 spaces</option>
          <option :value="4">4 spaces</option>
          <option :value="8">8 spaces</option>
        </select>
      </div>

      <div class="button-group">
        <button @click="formatSql" class="btn btn-primary">Format</button>
        <button @click="minifySql" class="btn btn-secondary">Minify</button>
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
          placeholder="Paste your SQL query here..."
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
          placeholder="Formatted SQL will appear here..."
          class="code-editor"
          readonly
        ></textarea>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<style scoped>
.sql-formatter {
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
