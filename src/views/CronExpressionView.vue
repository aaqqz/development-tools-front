<script setup>
import { ref, computed } from 'vue'

const cronExpression = ref('0 0 * * *')
const error = ref('')

const parseCronPart = (part, type) => {
  if (part === '*') return `every ${type}`
  if (part.includes('/')) {
    const [range, step] = part.split('/')
    return `every ${step} ${type}${step > 1 ? 's' : ''}`
  }
  if (part.includes('-')) {
    const [start, end] = part.split('-')
    return `${type}s ${start} through ${end}`
  }
  if (part.includes(',')) {
    return `${type}s ${part.split(',').join(', ')}`
  }
  return `at ${type} ${part}`
}

const getDayName = (day) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[parseInt(day)] || day
}

const getMonthName = (month) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return months[parseInt(month) - 1] || month
}

const cronDescription = computed(() => {
  if (!cronExpression.value.trim()) {
    return ''
  }

  try {
    error.value = ''
    const parts = cronExpression.value.trim().split(/\s+/)

    if (parts.length < 5 || parts.length > 6) {
      error.value = 'Invalid cron expression. Expected 5 or 6 fields.'
      return ''
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek, year] = parts
    let description = 'Runs '

    // Special cases
    if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return 'Runs every day at midnight (12:00 AM)'
    }

    if (minute === '0' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return 'Runs every hour at minute 0'
    }

    if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return 'Runs every minute'
    }

    // Build description
    const parts_desc = []

    // Minute
    if (minute !== '*') {
      if (minute.includes('/')) {
        const step = minute.split('/')[1]
        parts_desc.push(`every ${step} minute${step > 1 ? 's' : ''}`)
      } else if (minute.includes(',')) {
        parts_desc.push(`at minute${minute.split(',').length > 1 ? 's' : ''} ${minute}`)
      } else {
        parts_desc.push(`at minute ${minute}`)
      }
    }

    // Hour
    if (hour !== '*') {
      if (hour.includes('/')) {
        const step = hour.split('/')[1]
        parts_desc.push(`every ${step} hour${step > 1 ? 's' : ''}`)
      } else if (hour.includes(',')) {
        parts_desc.push(`at hour${hour.split(',').length > 1 ? 's' : ''} ${hour}`)
      } else {
        const h = parseInt(hour)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const h12 = h % 12 || 12
        parts_desc.push(`at ${h12}:${minute === '*' ? 'XX' : minute.padStart(2, '0')} ${ampm}`)
      }
    }

    // Day of month
    if (dayOfMonth !== '*' && dayOfMonth !== '?') {
      if (dayOfMonth.includes('/')) {
        const step = dayOfMonth.split('/')[1]
        parts_desc.push(`every ${step} day${step > 1 ? 's' : ''}`)
      } else {
        parts_desc.push(`on day ${dayOfMonth}`)
      }
    }

    // Month
    if (month !== '*') {
      if (month.includes(',')) {
        const months = month.split(',').map(getMonthName)
        parts_desc.push(`in ${months.join(', ')}`)
      } else {
        parts_desc.push(`in ${getMonthName(month)}`)
      }
    }

    // Day of week
    if (dayOfWeek !== '*' && dayOfWeek !== '?') {
      if (dayOfWeek.includes(',')) {
        const days = dayOfWeek.split(',').map(getDayName)
        parts_desc.push(`on ${days.join(', ')}`)
      } else if (dayOfWeek.includes('-')) {
        const [start, end] = dayOfWeek.split('-')
        parts_desc.push(`on ${getDayName(start)} through ${getDayName(end)}`)
      } else {
        parts_desc.push(`on ${getDayName(dayOfWeek)}`)
      }
    }

    if (parts_desc.length === 0) {
      return 'Runs every minute'
    }

    return description + parts_desc.join(', ')
  } catch (e) {
    error.value = `Error parsing cron expression: ${e.message}`
    return ''
  }
})

const nextExecutions = computed(() => {
  // This is a simplified version - in production, you'd use a library like cron-parser
  const times = []
  const now = new Date()

  try {
    const parts = cronExpression.value.trim().split(/\s+/)
    if (parts.length >= 5) {
      const [minute, hour] = parts

      // Generate next 5 execution times (simplified)
      for (let i = 0; i < 5; i++) {
        const nextTime = new Date(now)
        nextTime.setDate(now.getDate() + i)

        if (hour !== '*') {
          nextTime.setHours(parseInt(hour))
        }

        if (minute !== '*') {
          nextTime.setMinutes(parseInt(minute))
        } else {
          nextTime.setMinutes(0)
        }

        nextTime.setSeconds(0)
        times.push(nextTime.toLocaleString())
      }
    }
  } catch (e) {
    // Ignore errors
  }

  return times
})

const commonExpressions = [
  { name: 'Every minute', expr: '* * * * *' },
  { name: 'Every hour', expr: '0 * * * *' },
  { name: 'Every day at midnight', expr: '0 0 * * *' },
  { name: 'Every day at noon', expr: '0 12 * * *' },
  { name: 'Every Monday at 9 AM', expr: '0 9 * * 1' },
  { name: 'Every weekday at 9 AM', expr: '0 9 * * 1-5' },
  { name: 'Every 5 minutes', expr: '*/5 * * * *' },
  { name: 'Every 15 minutes', expr: '*/15 * * * *' },
  { name: 'Every month on 1st at midnight', expr: '0 0 1 * *' },
]

const useExpression = (expr) => {
  cronExpression.value = expr
}

const clearAll = () => {
  cronExpression.value = ''
  error.value = ''
}
</script>

<template>
  <div class="cron-expression">
    <div class="page-header">
      <h1 class="page-title">Cron Expression Helper</h1>
      <p class="page-description">Parse and understand cron expressions</p>
    </div>

    <div class="input-section">
      <div class="cron-input-group">
        <label for="cron" class="input-label">Cron Expression:</label>
        <input
          id="cron"
          v-model="cronExpression"
          type="text"
          placeholder="* * * * *"
          class="cron-input"
        />
      </div>

      <div class="field-labels">
        <span class="field-label">Minute</span>
        <span class="field-label">Hour</span>
        <span class="field-label">Day</span>
        <span class="field-label">Month</span>
        <span class="field-label">Weekday</span>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="cronDescription" class="description-section">
      <div class="description-header">
        <h3>Description</h3>
      </div>
      <div class="description-content">
        <p class="description-text">{{ cronDescription }}</p>
      </div>
    </div>

    <div class="common-expressions">
      <h3 class="section-title">Common Expressions</h3>
      <div class="expression-grid">
        <button
          v-for="item in commonExpressions"
          :key="item.name"
          @click="useExpression(item.expr)"
          class="expression-btn"
        >
          <span class="expr-name">{{ item.name }}</span>
          <code class="expr-code">{{ item.expr }}</code>
        </button>
      </div>
    </div>

    <div class="controls">
      <button @click="clearAll" class="btn btn-danger">Clear</button>
    </div>

    <div class="reference-section">
      <h3 class="section-title">Field Reference</h3>
      <div class="reference-grid">
        <div class="reference-item">
          <div class="ref-field">Minute (0-59)</div>
          <div class="ref-examples">
            <code>*</code> - Every minute<br />
            <code>0</code> - At minute 0<br />
            <code>*/5</code> - Every 5 minutes<br />
            <code>0,30</code> - At minutes 0 and 30
          </div>
        </div>

        <div class="reference-item">
          <div class="ref-field">Hour (0-23)</div>
          <div class="ref-examples">
            <code>*</code> - Every hour<br />
            <code>0</code> - At midnight<br />
            <code>12</code> - At noon<br />
            <code>9-17</code> - 9 AM to 5 PM
          </div>
        </div>

        <div class="reference-item">
          <div class="ref-field">Day of Month (1-31)</div>
          <div class="ref-examples">
            <code>*</code> - Every day<br />
            <code>1</code> - On the 1st<br />
            <code>15</code> - On the 15th<br />
            <code>1,15</code> - On 1st and 15th
          </div>
        </div>

        <div class="reference-item">
          <div class="ref-field">Month (1-12)</div>
          <div class="ref-examples">
            <code>*</code> - Every month<br />
            <code>1</code> - January<br />
            <code>12</code> - December<br />
            <code>1-6</code> - Jan through Jun
          </div>
        </div>

        <div class="reference-item">
          <div class="ref-field">Day of Week (0-6)</div>
          <div class="ref-examples">
            <code>*</code> - Every day<br />
            <code>0</code> - Sunday<br />
            <code>1-5</code> - Monday to Friday<br />
            <code>1,3,5</code> - Mon, Wed, Fri
          </div>
        </div>

        <div class="reference-item">
          <div class="ref-field">Special Characters</div>
          <div class="ref-examples">
            <code>*</code> - Any value<br />
            <code>,</code> - Value list<br />
            <code>-</code> - Range<br />
            <code>/</code> - Step values
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cron-expression {
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

.input-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.cron-input-group {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.cron-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 1.25rem;
  text-align: center;
  letter-spacing: 0.5rem;
}

.cron-input:focus {
  outline: none;
  border-color: #6366f1;
}

.field-labels {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  text-align: center;
}

.field-label {
  color: #9ca3af;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

.description-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.description-header {
  padding: 0.75rem 1rem;
  background: #16162a;
  border-bottom: 1px solid #2d2d44;
}

.description-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.description-content {
  padding: 1.5rem;
}

.description-text {
  color: #10b981;
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
}

.common-expressions {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.expression-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
}

.expression-btn {
  padding: 1rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expression-btn:hover {
  background: #16162a;
  border-color: #6366f1;
}

.expr-name {
  display: block;
  color: #e5e7eb;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.expr-code {
  display: block;
  color: #a78bfa;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.75rem;
}

.controls {
  display: flex;
  justify-content: flex-end;
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

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.reference-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  padding: 1.5rem;
}

.reference-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.reference-item {
  background: #0f0f1e;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #2d2d44;
}

.ref-field {
  color: #6366f1;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.ref-examples {
  color: #9ca3af;
  font-size: 0.75rem;
  line-height: 1.8;
}

.ref-examples code {
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

@media (max-width: 768px) {
  .cron-input {
    font-size: 1rem;
    letter-spacing: 0.3rem;
  }

  .field-labels {
    font-size: 0.625rem;
  }

  .expression-grid {
    grid-template-columns: 1fr;
  }

  .reference-grid {
    grid-template-columns: 1fr;
  }
}
</style>
