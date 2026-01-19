<script setup>
import { ref, computed, watch } from 'vue'

const currentTimestamp = ref(Math.floor(Date.now() / 1000))
const inputTimestamp = ref('')
const inputDate = ref('')
const inputTime = ref('')
const timestampUnit = ref('seconds')
const error = ref('')

// Update current timestamp every second
setInterval(() => {
  currentTimestamp.value = Math.floor(Date.now() / 1000)
}, 1000)

const currentDate = computed(() => {
  const date = new Date(currentTimestamp.value * 1000)
  return {
    iso: date.toISOString(),
    local: date.toLocaleString(),
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString(),
    utc: date.toUTCString(),
  }
})

const convertedDate = computed(() => {
  if (!inputTimestamp.value) return null

  try {
    error.value = ''
    let timestamp = parseInt(inputTimestamp.value)

    if (isNaN(timestamp)) {
      error.value = 'Invalid timestamp'
      return null
    }

    // Convert to milliseconds if needed
    if (timestampUnit.value === 'seconds') {
      timestamp = timestamp * 1000
    }

    const date = new Date(timestamp)

    if (isNaN(date.getTime())) {
      error.value = 'Invalid date'
      return null
    }

    return {
      iso: date.toISOString(),
      local: date.toLocaleString(),
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      utc: date.toUTCString(),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds(),
    }
  } catch (e) {
    error.value = `Conversion error: ${e.message}`
    return null
  }
})

const dateToTimestamp = computed(() => {
  if (!inputDate.value) return null

  try {
    error.value = ''
    let dateStr = inputDate.value

    if (inputTime.value) {
      dateStr += ` ${inputTime.value}`
    }

    const date = new Date(dateStr)

    if (isNaN(date.getTime())) {
      error.value = 'Invalid date format'
      return null
    }

    return {
      seconds: Math.floor(date.getTime() / 1000),
      milliseconds: date.getTime(),
      iso: date.toISOString(),
    }
  } catch (e) {
    error.value = `Conversion error: ${e.message}`
    return null
  }
})

const useCurrentTimestamp = () => {
  inputTimestamp.value = currentTimestamp.value.toString()
  timestampUnit.value = 'seconds'
}

const useCurrentDate = () => {
  const now = new Date()
  inputDate.value = now.toISOString().split('T')[0]
  inputTime.value = now.toTimeString().split(' ')[0].substring(0, 5)
}

const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text)
}

const clearAll = () => {
  inputTimestamp.value = ''
  inputDate.value = ''
  inputTime.value = ''
  error.value = ''
}
</script>

<template>
  <div class="timestamp-converter">
    <div class="page-header">
      <h1 class="page-title">Timestamp Converter</h1>
      <p class="page-description">Convert between Unix timestamps and human-readable dates</p>
    </div>

    <div class="current-time-section">
      <div class="section-header">
        <h3>Current Timestamp</h3>
      </div>
      <div class="current-time-content">
        <div class="timestamp-display">
          <div class="timestamp-value">{{ currentTimestamp }}</div>
          <div class="timestamp-label">Unix Timestamp (seconds)</div>
        </div>
        <div class="timestamp-display">
          <div class="timestamp-value">{{ currentTimestamp * 1000 }}</div>
          <div class="timestamp-label">Unix Timestamp (milliseconds)</div>
        </div>
        <div class="current-date-info">
          <div class="info-row">
            <span class="info-label">ISO 8601:</span>
            <code class="info-value">{{ currentDate.iso }}</code>
          </div>
          <div class="info-row">
            <span class="info-label">Local:</span>
            <code class="info-value">{{ currentDate.local }}</code>
          </div>
          <div class="info-row">
            <span class="info-label">UTC:</span>
            <code class="info-value">{{ currentDate.utc }}</code>
          </div>
        </div>
      </div>
    </div>

    <div class="converter-grid">
      <!-- Timestamp to Date -->
      <div class="converter-section">
        <div class="section-header">
          <h3>Timestamp → Date</h3>
        </div>
        <div class="converter-content">
          <div class="input-group">
            <input
              v-model="inputTimestamp"
              type="text"
              placeholder="Enter timestamp..."
              class="converter-input"
            />
            <select v-model="timestampUnit" class="unit-select">
              <option value="seconds">Seconds</option>
              <option value="milliseconds">Milliseconds</option>
            </select>
          </div>
          <button @click="useCurrentTimestamp" class="btn btn-secondary">Use Current</button>

          <div v-if="convertedDate" class="result-section">
            <div class="result-item">
              <span class="result-label">ISO 8601:</span>
              <div class="result-value-row">
                <code class="result-value">{{ convertedDate.iso }}</code>
                <button @click="copyToClipboard(convertedDate.iso)" class="copy-icon-btn">
                  📋
                </button>
              </div>
            </div>
            <div class="result-item">
              <span class="result-label">Local:</span>
              <div class="result-value-row">
                <code class="result-value">{{ convertedDate.local }}</code>
                <button @click="copyToClipboard(convertedDate.local)" class="copy-icon-btn">
                  📋
                </button>
              </div>
            </div>
            <div class="result-item">
              <span class="result-label">UTC:</span>
              <div class="result-value-row">
                <code class="result-value">{{ convertedDate.utc }}</code>
                <button @click="copyToClipboard(convertedDate.utc)" class="copy-icon-btn">
                  📋
                </button>
              </div>
            </div>
            <div class="result-item">
              <span class="result-label">Components:</span>
              <code class="result-value">
                Year: {{ convertedDate.year }}, Month: {{ convertedDate.month }}, Day:
                {{ convertedDate.day }}, Hour: {{ convertedDate.hours }}, Minute:
                {{ convertedDate.minutes }}, Second: {{ convertedDate.seconds }}
              </code>
            </div>
          </div>
        </div>
      </div>

      <!-- Date to Timestamp -->
      <div class="converter-section">
        <div class="section-header">
          <h3>Date → Timestamp</h3>
        </div>
        <div class="converter-content">
          <div class="input-group">
            <input v-model="inputDate" type="date" class="converter-input" />
            <input v-model="inputTime" type="time" class="converter-input" />
          </div>
          <button @click="useCurrentDate" class="btn btn-secondary">Use Current</button>

          <div v-if="dateToTimestamp" class="result-section">
            <div class="result-item">
              <span class="result-label">Seconds:</span>
              <div class="result-value-row">
                <code class="result-value">{{ dateToTimestamp.seconds }}</code>
                <button
                  @click="copyToClipboard(dateToTimestamp.seconds.toString())"
                  class="copy-icon-btn"
                >
                  📋
                </button>
              </div>
            </div>
            <div class="result-item">
              <span class="result-label">Milliseconds:</span>
              <div class="result-value-row">
                <code class="result-value">{{ dateToTimestamp.milliseconds }}</code>
                <button
                  @click="copyToClipboard(dateToTimestamp.milliseconds.toString())"
                  class="copy-icon-btn"
                >
                  📋
                </button>
              </div>
            </div>
            <div class="result-item">
              <span class="result-label">ISO 8601:</span>
              <div class="result-value-row">
                <code class="result-value">{{ dateToTimestamp.iso }}</code>
                <button @click="copyToClipboard(dateToTimestamp.iso)" class="copy-icon-btn">
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="controls">
      <button @click="clearAll" class="btn btn-danger">Clear All</button>
    </div>

    <div class="info-section">
      <h3 class="info-title">About Unix Timestamps</h3>
      <p class="info-text">
        A Unix timestamp is the number of seconds (or milliseconds) that have elapsed since January
        1, 1970, 00:00:00 UTC (the Unix epoch). It's a common way to represent dates and times in
        programming.
      </p>
      <div class="info-details">
        <div class="info-item">
          <span class="info-label">Epoch Start:</span>
          <span class="info-value">January 1, 1970, 00:00:00 UTC</span>
        </div>
        <div class="info-item">
          <span class="info-label">Common Units:</span>
          <span class="info-value">Seconds (10 digits) or Milliseconds (13 digits)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timestamp-converter {
  max-width: 1200px;
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

.current-time-section {
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

.current-time-content {
  padding: 1.5rem;
}

.timestamp-display {
  text-align: center;
  margin-bottom: 1.5rem;
}

.timestamp-value {
  font-size: 2rem;
  font-weight: 700;
  color: #6366f1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  margin-bottom: 0.5rem;
}

.timestamp-label {
  color: #9ca3af;
  font-size: 0.875rem;
}

.current-date-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #0f0f1e;
  border-radius: 6px;
  gap: 1rem;
}

.info-label {
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  color: #10b981;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  flex: 1;
  text-align: right;
}

.converter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.converter-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
}

.converter-content {
  padding: 1.5rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.converter-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
}

.converter-input:focus {
  outline: none;
  border-color: #6366f1;
}

.unit-select {
  padding: 0.75rem 1rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
  cursor: pointer;
}

.unit-select:focus {
  outline: none;
  border-color: #6366f1;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-bottom: 1rem;
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

.result-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: #0f0f1e;
  border-radius: 6px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-label {
  color: #9ca3af;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.result-value-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.result-value {
  color: #10b981;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  flex: 1;
  word-break: break-all;
}

.copy-icon-btn {
  padding: 0.25rem 0.5rem;
  background: #6366f1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.copy-icon-btn:hover {
  background: #7c3aed;
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

.controls {
  display: flex;
  justify-content: flex-end;
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

.info-text {
  color: #9ca3af;
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
}

.info-item .info-label {
  color: #6366f1;
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 120px;
}

.info-item .info-value {
  color: #e5e7eb;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .converter-grid {
    grid-template-columns: 1fr;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-value {
    text-align: left;
  }
}
</style>
