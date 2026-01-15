<script setup>
import { ref, computed } from 'vue'

const text1 = ref('')
const text2 = ref('')

const differences = computed(() => {
  const lines1 = text1.value.split('\n')
  const lines2 = text2.value.split('\n')
  const maxLines = Math.max(lines1.length, lines2.length)

  const result = []
  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] || ''
    const line2 = lines2[i] || ''

    if (line1 === line2) {
      result.push({ type: 'equal', line1, line2, lineNum: i + 1 })
    } else if (!line1) {
      result.push({ type: 'added', line1, line2, lineNum: i + 1 })
    } else if (!line2) {
      result.push({ type: 'removed', line1, line2, lineNum: i + 1 })
    } else {
      result.push({ type: 'modified', line1, line2, lineNum: i + 1 })
    }
  }

  return result
})

const stats = computed(() => {
  const added = differences.value.filter(d => d.type === 'added').length
  const removed = differences.value.filter(d => d.type === 'removed').length
  const modified = differences.value.filter(d => d.type === 'modified').length
  const equal = differences.value.filter(d => d.type === 'equal').length

  return { added, removed, modified, equal }
})

const clearAll = () => {
  text1.value = ''
  text2.value = ''
}

const loadSample = () => {
  text1.value = `function hello() {
  console.log("Hello World");
  return true;
}`

  text2.value = `function hello() {
  console.log("Hello Universe");
  console.log("Welcome!");
  return true;
}`
}
</script>

<template>
  <div class="diff-checker">
    <div class="page-header">
      <h1 class="page-title">Diff Checker</h1>
      <p class="page-description">Compare two text snippets and see the differences</p>
    </div>

    <div class="controls">
      <button @click="loadSample" class="btn btn-primary">Load Sample</button>
      <button @click="clearAll" class="btn btn-secondary">Clear All</button>
    </div>

    <div v-if="text1 || text2" class="stats">
      <div class="stat-item added">{{ stats.added }} Added</div>
      <div class="stat-item removed">{{ stats.removed }} Removed</div>
      <div class="stat-item modified">{{ stats.modified }} Modified</div>
      <div class="stat-item equal">{{ stats.equal }} Equal</div>
    </div>

    <div class="editor-container">
      <div class="editor-panel">
        <div class="panel-header">
          <h3>Original Text</h3>
        </div>
        <textarea
          v-model="text1"
          placeholder="Paste your original text here..."
          class="code-editor"
        ></textarea>
      </div>

      <div class="editor-panel">
        <div class="panel-header">
          <h3>Modified Text</h3>
        </div>
        <textarea
          v-model="text2"
          placeholder="Paste your modified text here..."
          class="code-editor"
        ></textarea>
      </div>
    </div>

    <div v-if="differences.length > 0" class="diff-view">
      <div class="panel-header">
        <h3>Differences</h3>
      </div>
      <div class="diff-lines">
        <div
          v-for="diff in differences"
          :key="diff.lineNum"
          :class="['diff-line', diff.type]"
        >
          <span class="line-num">{{ diff.lineNum }}</span>
          <div class="line-content">
            <div class="original">
              <span v-if="diff.type === 'removed'" class="indicator">-</span>
              <span v-else-if="diff.type === 'modified'" class="indicator">~</span>
              <span v-else class="indicator">&nbsp;</span>
              {{ diff.line1 || '(empty)' }}
            </div>
            <div class="modified">
              <span v-if="diff.type === 'added'" class="indicator">+</span>
              <span v-else-if="diff.type === 'modified'" class="indicator">~</span>
              <span v-else class="indicator">&nbsp;</span>
              {{ diff.line2 || '(empty)' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diff-checker {
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
  margin-bottom: 1rem;
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

.stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.stat-item {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

.stat-item.added {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.stat-item.removed {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.stat-item.modified {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.stat-item.equal {
  background: rgba(107, 114, 128, 0.1);
  color: #9ca3af;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.editor-panel {
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
  height: 300px;
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

.diff-view {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
}

.diff-lines {
  max-height: 400px;
  overflow-y: auto;
}

.diff-line {
  display: flex;
  border-bottom: 1px solid #2d2d44;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
}

.diff-line.equal {
  background: #0f0f1e;
}

.diff-line.added {
  background: rgba(16, 185, 129, 0.05);
}

.diff-line.removed {
  background: rgba(239, 68, 68, 0.05);
}

.diff-line.modified {
  background: rgba(251, 191, 36, 0.05);
}

.line-num {
  padding: 0.5rem;
  color: #6b7280;
  text-align: right;
  min-width: 50px;
  background: #16162a;
  border-right: 1px solid #2d2d44;
  user-select: none;
}

.line-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.original,
.modified {
  padding: 0.5rem 1rem;
  display: flex;
  gap: 0.5rem;
}

.original {
  border-bottom: 1px solid #2d2d44;
}

.indicator {
  color: #9ca3af;
  font-weight: bold;
  min-width: 20px;
}

.diff-line.added .modified .indicator {
  color: #10b981;
}

.diff-line.removed .original .indicator {
  color: #ef4444;
}

.diff-line.modified .indicator {
  color: #fbbf24;
}

@media (max-width: 768px) {
  .editor-container {
    grid-template-columns: 1fr;
  }
}
</style>