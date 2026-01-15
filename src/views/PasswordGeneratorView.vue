<script setup>
import { ref } from 'vue'

const password = ref('')
const length = ref(16)
const includeUppercase = ref(true)
const includeLowercase = ref(true)
const includeNumbers = ref(true)
const includeSymbols = ref(true)
const generatedPasswords = ref([])

const generatePassword = () => {
  let charset = ''
  if (includeLowercase.value) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (includeUppercase.value) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (includeNumbers.value) charset += '0123456789'
  if (includeSymbols.value) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  if (charset === '') {
    password.value = 'Please select at least one character type'
    return
  }

  let result = ''
  const array = new Uint32Array(length.value)
  crypto.getRandomValues(array)

  for (let i = 0; i < length.value; i++) {
    result += charset[array[i] % charset.length]
  }

  password.value = result
}

const generateMultiple = () => {
  generatedPasswords.value = []
  for (let i = 0; i < 5; i++) {
    generatePassword()
    generatedPasswords.value.push(password.value)
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
}

const getStrength = (pwd) => {
  let strength = 0
  if (pwd.length >= 12) strength++
  if (pwd.length >= 16) strength++
  if (/[a-z]/.test(pwd)) strength++
  if (/[A-Z]/.test(pwd)) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++

  if (strength <= 2) return { text: 'Weak', color: '#ef4444' }
  if (strength <= 4) return { text: 'Medium', color: '#fbbf24' }
  return { text: 'Strong', color: '#10b981' }
}

generatePassword()
</script>

<template>
  <div class="password-generator">
    <div class="page-header">
      <h1 class="page-title">Password Generator</h1>
      <p class="page-description">Generate secure random passwords</p>
    </div>

    <div class="main-section">
      <div class="password-display">
        <input v-model="password" type="text" readonly class="password-input" />
        <button @click="copyToClipboard(password)" class="copy-btn">📋 Copy</button>
      </div>

      <div v-if="password && password.length > 0" class="strength-meter">
        <span>Strength:</span>
        <span :style="{ color: getStrength(password).color, fontWeight: 'bold' }">
          {{ getStrength(password).text }}
        </span>
      </div>

      <div class="options">
        <div class="option-row">
          <label for="length">Length: {{ length }}</label>
          <input
            id="length"
            v-model.number="length"
            type="range"
            min="8"
            max="64"
            class="slider"
          />
        </div>

        <div class="checkbox-group">
          <label class="checkbox-label">
            <input v-model="includeUppercase" type="checkbox" />
            <span>Uppercase (A-Z)</span>
          </label>

          <label class="checkbox-label">
            <input v-model="includeLowercase" type="checkbox" />
            <span>Lowercase (a-z)</span>
          </label>

          <label class="checkbox-label">
            <input v-model="includeNumbers" type="checkbox" />
            <span>Numbers (0-9)</span>
          </label>

          <label class="checkbox-label">
            <input v-model="includeSymbols" type="checkbox" />
            <span>Symbols (!@#$%...)</span>
          </label>
        </div>
      </div>

      <div class="button-group">
        <button @click="generatePassword" class="btn btn-primary">Generate New</button>
        <button @click="generateMultiple" class="btn btn-secondary">Generate 5</button>
      </div>

      <div v-if="generatedPasswords.length > 0" class="password-list">
        <h3>Generated Passwords</h3>
        <div
          v-for="(pwd, index) in generatedPasswords"
          :key="index"
          class="password-item"
        >
          <code>{{ pwd }}</code>
          <button @click="copyToClipboard(pwd)" class="copy-btn-small">📋</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.password-generator {
  max-width: 800px;
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

.main-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  padding: 2rem;
}

.password-display {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.password-input {
  flex: 1;
  padding: 1rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 1.125rem;
  text-align: center;
  letter-spacing: 0.05em;
}

.strength-meter {
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: #0f0f1e;
  border-radius: 6px;
  text-align: center;
  font-size: 0.875rem;
  color: #9ca3af;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.copy-btn {
  padding: 0.75rem 1.5rem;
  background: #6366f1;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: #7c3aed;
}

.options {
  margin-bottom: 1.5rem;
}

.option-row {
  margin-bottom: 1.5rem;
}

.option-row label {
  display: block;
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.slider {
  width: 100%;
  height: 6px;
  background: #2d2d44;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #6366f1;
  border-radius: 50%;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #6366f1;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #d1d5db;
  font-size: 0.875rem;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #6366f1;
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.btn {
  flex: 1;
  padding: 0.875rem 1.5rem;
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

.password-list {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #2d2d44;
}

.password-list h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.password-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.password-item code {
  flex: 1;
  color: #10b981;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
}

.copy-btn-small {
  padding: 0.375rem 0.75rem;
  background: #6366f1;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn-small:hover {
  background: #7c3aed;
}
</style>