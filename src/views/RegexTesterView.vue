<script setup>
import { ref, computed } from 'vue'

const pattern = ref('')
const flags = ref({
  g: true,
  i: false,
  m: false,
  s: false,
  u: false,
  y: false,
})
const testString = ref('')
const error = ref('')

const matches = computed(() => {
  if (!pattern.value || !testString.value) {
    return []
  }

  try {
    error.value = ''
    const flagString = Object.keys(flags.value)
      .filter((key) => flags.value[key])
      .join('')
    const regex = new RegExp(pattern.value, flagString)
    const result = []

    if (flags.value.g) {
      let match
      while ((match = regex.exec(testString.value)) !== null) {
        result.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
        })
        // Prevent infinite loop
        if (match.index === regex.lastIndex) {
          regex.lastIndex++
        }
      }
    } else {
      const match = regex.exec(testString.value)
      if (match) {
        result.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
        })
      }
    }

    return result
  } catch (e) {
    error.value = `Invalid regex: ${e.message}`
    return []
  }
})

const highlightedText = computed(() => {
  if (!pattern.value || !testString.value || matches.value.length === 0) {
    return testString.value
  }

  let result = testString.value
  const sortedMatches = [...matches.value].sort((a, b) => b.index - a.index)

  sortedMatches.forEach((match) => {
    const before = result.substring(0, match.index)
    const highlighted = `<mark>${match.match}</mark>`
    const after = result.substring(match.index + match.match.length)
    result = before + highlighted + after
  })

  return result
})

const matchCount = computed(() => matches.value.length)

const clearAll = () => {
  pattern.value = ''
  testString.value = ''
  error.value = ''
  flags.value = {
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  }
}

const loadSample = () => {
  pattern.value = '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b'
  testString.value = `Contact us at support@example.com or sales@company.org
For urgent matters, email admin@test.co.uk
Invalid emails: user@, @domain.com, user@domain`
  flags.value.g = true
  flags.value.i = false
}

const commonPatterns = [
  { name: 'Email', pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b' },
  { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
  { name: 'Phone (US)', pattern: '\\(?(\\d{3})\\)?[-.\\s]?(\\d{3})[-.\\s]?(\\d{4})' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])' },
  { name: 'IP Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
  { name: 'Hex Color', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})' },
]

const usePattern = (patternStr) => {
  pattern.value = patternStr
}
</script>

<template>
  <div class="regex-tester">
    <div class="page-header">
      <h1 class="page-title">Regex Tester</h1>
      <p class="page-description">Test and debug regular expressions</p>
    </div>

    <div class="pattern-section">
      <div class="pattern-input-group">
        <span class="pattern-delimiter">/</span>
        <input
          v-model="pattern"
          type="text"
          placeholder="Enter regex pattern..."
          class="pattern-input"
        />
        <span class="pattern-delimiter">/</span>
        <div class="flags-group">
          <label v-for="(value, key) in flags" :key="key" class="flag-label">
            <input v-model="flags[key]" type="checkbox" class="flag-checkbox" />
            <span class="flag-name">{{ key }}</span>
          </label>
        </div>
      </div>

      <div class="match-info">
        <span v-if="matchCount > 0" class="match-count">{{ matchCount }} match{{ matchCount !== 1 ? 'es' : '' }} found</span>
        <span v-else-if="pattern && testString" class="no-match">No matches</span>
      </div>
    </div>

    <div class="common-patterns">
      <h3 class="section-title">Common Patterns</h3>
      <div class="pattern-buttons">
        <button
          v-for="item in commonPatterns"
          :key="item.name"
          @click="usePattern(item.pattern)"
          class="pattern-btn"
        >
          {{ item.name }}
        </button>
      </div>
    </div>

    <div class="controls">
      <div class="button-group">
        <button @click="loadSample" class="btn btn-secondary">Load Sample</button>
        <button @click="clearAll" class="btn btn-danger">Clear</button>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="editor-container">
      <div class="editor-panel">
        <div class="panel-header">
          <h3>Test String</h3>
        </div>
        <textarea
          v-model="testString"
          placeholder="Enter test string here..."
          class="code-editor"
        ></textarea>
      </div>

      <div class="editor-panel">
        <div class="panel-header">
          <h3>Highlighted Matches</h3>
        </div>
        <div class="highlighted-output" v-html="highlightedText"></div>
      </div>
    </div>

    <div v-if="matches.length > 0" class="matches-section">
      <div class="section-header">
        <h3>Match Details</h3>
      </div>
      <div class="matches-list">
        <div v-for="(match, index) in matches" :key="index" class="match-item">
          <div class="match-header">
            <span class="match-index">Match {{ index + 1 }}</span>
            <span class="match-position">Position: {{ match.index }}</span>
          </div>
          <div class="match-content">
            <code class="match-text">{{ match.match }}</code>
          </div>
          <div v-if="match.groups.length > 0" class="match-groups">
            <div v-for="(group, gIndex) in match.groups" :key="gIndex" class="group-item">
              <span class="group-label">Group {{ gIndex + 1 }}:</span>
              <code class="group-value">{{ group }}</code>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3 class="info-title">Flag Reference</h3>
      <div class="flag-reference">
        <div class="flag-info">
          <code>g</code> - Global search (find all matches)
        </div>
        <div class="flag-info">
          <code>i</code> - Case-insensitive search
        </div>
        <div class="flag-info">
          <code>m</code> - Multi-line search
        </div>
        <div class="flag-info">
          <code>s</code> - Allows . to match newline characters
        </div>
        <div class="flag-info">
          <code>u</code> - Unicode mode
        </div>
        <div class="flag-info">
          <code>y</code> - Sticky search (matches from the current position)
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.regex-tester {
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

.pattern-section {
  margin-bottom: 1.5rem;
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  padding: 1.5rem;
}

.pattern-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.pattern-delimiter {
  color: #6366f1;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

.pattern-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 1rem;
}

.pattern-input:focus {
  outline: none;
  border-color: #6366f1;
}

.flags-group {
  display: flex;
  gap: 1rem;
  padding: 0 0.5rem;
}

.flag-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  color: #9ca3af;
}

.flag-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #6366f1;
}

.flag-name {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
}

.match-info {
  text-align: center;
}

.match-count {
  color: #10b981;
  font-weight: 600;
  font-size: 0.875rem;
}

.no-match {
  color: #9ca3af;
  font-size: 0.875rem;
}

.common-patterns {
  margin-bottom: 1.5rem;
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  padding: 1rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.pattern-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pattern-btn {
  padding: 0.5rem 1rem;
  background: #2d2d44;
  border: none;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pattern-btn:hover {
  background: #3d3d54;
  color: #a78bfa;
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

.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #fca5a5;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.editor-panel {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 400px;
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
  margin: 0;
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

.highlighted-output {
  flex: 1;
  padding: 1rem;
  background: #0f0f1e;
  color: #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.highlighted-output :deep(mark) {
  background: rgba(16, 185, 129, 0.3);
  color: #10b981;
  padding: 2px 4px;
  border-radius: 3px;
}

.matches-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.section-header {
  padding: 0.75rem 1rem;
  background: #16162a;
  border-bottom: 1px solid #2d2d44;
}

.section-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.matches-list {
  max-height: 300px;
  overflow-y: auto;
}

.match-item {
  padding: 1rem;
  border-bottom: 1px solid #2d2d44;
}

.match-item:last-child {
  border-bottom: none;
}

.match-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.match-index {
  color: #6366f1;
  font-weight: 600;
  font-size: 0.875rem;
}

.match-position {
  color: #9ca3af;
  font-size: 0.75rem;
}

.match-content {
  margin-bottom: 0.5rem;
}

.match-text {
  color: #10b981;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.match-groups {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
  padding-left: 1rem;
}

.group-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.group-label {
  color: #9ca3af;
}

.group-value {
  color: #a78bfa;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
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

.flag-reference {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 0.75rem;
}

.flag-info {
  color: #9ca3af;
  font-size: 0.875rem;
}

.flag-info code {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

@media (max-width: 768px) {
  .editor-container {
    grid-template-columns: 1fr;
  }

  .pattern-input-group {
    flex-wrap: wrap;
  }

  .flags-group {
    width: 100%;
    justify-content: space-between;
  }

  .flag-reference {
    grid-template-columns: 1fr;
  }
}
</style>
