<script setup>
import { ref, computed } from 'vue'

const input = ref('')
const parsedTrace = computed(() => {
  if (!input.value.trim()) return null

  const lines = input.value.split('\n')
  const result = {
    exception: null,
    message: '',
    frames: []
  }

  lines.forEach((line, index) => {
    line = line.trim()
    if (!line) return

    // Exception line (first line usually)
    if (index === 0 && line.includes(':')) {
      const parts = line.split(':')
      result.exception = parts[0].trim()
      result.message = parts.slice(1).join(':').trim()
    }
    // Stack frame lines
    else if (line.startsWith('at ')) {
      const frameText = line.substring(3)

      // Parse method and location
      const methodMatch = frameText.match(/^(.+?)\((.+?)\)/)
      if (methodMatch) {
        const method = methodMatch[1].trim()
        const location = methodMatch[2].trim()

        // Extract file and line number
        const fileMatch = location.match(/(.+?):(\d+)/)
        const file = fileMatch ? fileMatch[1] : location
        const lineNum = fileMatch ? fileMatch[2] : null

        result.frames.push({
          method,
          file,
          lineNum,
          fullText: line
        })
      } else {
        result.frames.push({
          method: frameText,
          file: '',
          lineNum: null,
          fullText: line
        })
      }
    }
    // Caused by lines
    else if (line.startsWith('Caused by:')) {
      result.frames.push({
        method: line,
        file: '',
        lineNum: null,
        fullText: line,
        isCausedBy: true
      })
    }
    // Other lines (suppressed, etc.)
    else {
      result.frames.push({
        method: line,
        file: '',
        lineNum: null,
        fullText: line,
        isOther: true
      })
    }
  })

  return result
})

const searchTerm = ref('')
const filteredFrames = computed(() => {
  if (!parsedTrace.value || !searchTerm.value.trim()) {
    return parsedTrace.value?.frames || []
  }

  const term = searchTerm.value.toLowerCase()
  return parsedTrace.value.frames.filter(frame =>
    frame.fullText.toLowerCase().includes(term)
  )
})

const copyToClipboard = () => {
  navigator.clipboard.writeText(input.value)
}

const clearAll = () => {
  input.value = ''
  searchTerm.value = ''
}

const loadSample = () => {
  input.value = `java.lang.NullPointerException: Cannot invoke "String.length()" because "str" is null
at com.example.service.UserService.processUser(UserService.java:42)
at com.example.controller.UserController.createUser(UserController.java:28)
at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77)
at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
at java.base/java.lang.reflect.Method.invoke(Method.java:568)
at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:205)
at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:150)
Caused by: java.lang.IllegalArgumentException: User ID cannot be null
at com.example.repository.UserRepository.findById(UserRepository.java:15)
... 8 more`
}
</script>

<template>
  <div class="stack-trace-analyzer">
    <div class="page-header">
      <h1 class="page-title">Stack Trace Analyzer</h1>
      <p class="page-description">Analyze and parse Java stack traces</p>
    </div>

    <div class="controls">
      <button @click="loadSample" class="btn btn-primary">Load Sample</button>
      <button @click="clearAll" class="btn btn-secondary">Clear</button>
      <button v-if="input" @click="copyToClipboard" class="btn btn-secondary">📋 Copy</button>
    </div>

    <div class="input-section">
      <div class="panel-header">
        <h3>Stack Trace Input</h3>
      </div>
      <textarea
        v-model="input"
        placeholder="Paste your stack trace here..."
        class="input-area"
        rows="12"
      ></textarea>
    </div>

    <div v-if="parsedTrace" class="analysis-section">
      <div class="exception-info">
        <div class="info-header">
          <h3>Exception Details</h3>
        </div>
        <div class="info-content">
          <div v-if="parsedTrace.exception" class="info-row">
            <label>Exception Type:</label>
            <code class="exception-type">{{ parsedTrace.exception }}</code>
          </div>
          <div v-if="parsedTrace.message" class="info-row">
            <label>Message:</label>
            <span class="exception-message">{{ parsedTrace.message }}</span>
          </div>
          <div class="info-row">
            <label>Stack Depth:</label>
            <span class="stack-depth">{{ parsedTrace.frames.length }} frames</span>
          </div>
        </div>
      </div>

      <div class="frames-section">
        <div class="frames-header">
          <h3>Stack Frames</h3>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Filter frames..."
            class="filter-input"
          />
        </div>

        <div class="frames-list">
          <div
            v-for="(frame, index) in filteredFrames"
            :key="index"
            :class="['frame-item', {
              'caused-by': frame.isCausedBy,
              'other': frame.isOther
            }]"
          >
            <span class="frame-number">{{ index + 1 }}</span>
            <div class="frame-content">
              <div class="frame-method">{{ frame.method }}</div>
              <div v-if="frame.file" class="frame-location">
                <span class="file-name">{{ frame.file }}</span>
                <span v-if="frame.lineNum" class="line-number">:{{ frame.lineNum }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stack-trace-analyzer {
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
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

.input-area::placeholder {
  color: #6b7280;
}

.analysis-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.exception-info {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
}

.info-header {
  padding: 0.75rem 1rem;
  background: #16162a;
  border-bottom: 1px solid #2d2d44;
}

.info-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.exception-type {
  color: #ef4444;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 1rem;
  font-weight: 600;
}

.exception-message {
  color: #fbbf24;
  font-size: 0.875rem;
  line-height: 1.5;
}

.stack-depth {
  color: #10b981;
  font-weight: 600;
}

.frames-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
}

.frames-header {
  padding: 0.75rem 1rem;
  background: #16162a;
  border-bottom: 1px solid #2d2d44;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.frames-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-input {
  padding: 0.5rem 0.75rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
  width: 250px;
}

.filter-input:focus {
  outline: none;
  border-color: #6366f1;
}

.filter-input::placeholder {
  color: #6b7280;
}

.frames-list {
  max-height: 600px;
  overflow-y: auto;
}

.frame-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #2d2d44;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  background: #0f0f1e;
  transition: background 0.2s ease;
}

.frame-item:hover {
  background: #16162a;
}

.frame-item.caused-by {
  background: rgba(239, 68, 68, 0.05);
  border-left: 3px solid #ef4444;
}

.frame-item.other {
  opacity: 0.7;
}

.frame-number {
  color: #6b7280;
  min-width: 30px;
  text-align: right;
  user-select: none;
}

.frame-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.frame-method {
  color: #c4b5fd;
  font-weight: 500;
}

.frame-location {
  color: #9ca3af;
  font-size: 0.8125rem;
}

.file-name {
  color: #10b981;
}

.line-number {
  color: #fbbf24;
  font-weight: 600;
}

@media (max-width: 768px) {
  .frames-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-input {
    width: 100%;
  }
}
</style>