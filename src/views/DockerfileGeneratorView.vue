<script setup>
import { ref, computed } from 'vue'

const selectedTemplate = ref('nodejs')
const nodeVersion = ref('20')
const pythonVersion = ref('3.11')
const javaVersion = ref('17')
const goVersion = ref('1.21')
const phpVersion = ref('8.2')

const workDir = ref('/app')
const exposedPort = ref('3000')
const buildStage = ref(false)

const templates = {
  nodejs: {
    name: 'Node.js',
    icon: '🟢',
    description: 'Node.js application with npm/yarn',
  },
  'nodejs-next': {
    name: 'Next.js',
    icon: '▲',
    description: 'Next.js React framework',
  },
  python: {
    name: 'Python',
    icon: '🐍',
    description: 'Python application with pip',
  },
  'python-django': {
    name: 'Django',
    icon: '🎸',
    description: 'Django web framework',
  },
  java: {
    name: 'Java Spring Boot',
    icon: '☕',
    description: 'Spring Boot with Maven',
  },
  go: {
    name: 'Go',
    icon: '🔵',
    description: 'Go application',
  },
  php: {
    name: 'PHP',
    icon: '🐘',
    description: 'PHP application',
  },
  nginx: {
    name: 'Nginx',
    icon: '🌐',
    description: 'Static site with Nginx',
  },
}

const generatedDockerfile = computed(() => {
  const indent = '  '
  let dockerfile = ''

  switch (selectedTemplate.value) {
    case 'nodejs':
      dockerfile = buildStage.value
        ? `# Build stage
FROM node:${nodeVersion.value}-alpine AS builder

WORKDIR ${workDir.value}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Production stage
FROM node:${nodeVersion.value}-alpine

WORKDIR ${workDir.value}

# Copy from builder
COPY --from=builder ${workDir.value}/node_modules ./node_modules
COPY --from=builder ${workDir.value} .

# Expose port
EXPOSE ${exposedPort.value}

# Start application
CMD ["node", "index.js"]`
        : `FROM node:${nodeVersion.value}-alpine

WORKDIR ${workDir.value}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE ${exposedPort.value}

# Start application
CMD ["npm", "start"]`
      break

    case 'nodejs-next':
      dockerfile = `# Build stage
FROM node:${nodeVersion.value}-alpine AS builder

WORKDIR ${workDir.value}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Production stage
FROM node:${nodeVersion.value}-alpine

WORKDIR ${workDir.value}

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder ${workDir.value}/next.config.js ./
COPY --from=builder ${workDir.value}/public ./public
COPY --from=builder ${workDir.value}/.next ./.next
COPY --from=builder ${workDir.value}/node_modules ./node_modules
COPY --from=builder ${workDir.value}/package.json ./package.json

# Expose port
EXPOSE ${exposedPort.value}

# Start application
CMD ["npm", "start"]`
      break

    case 'python':
      dockerfile = `FROM python:${pythonVersion.value}-slim

WORKDIR ${workDir.value}

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE ${exposedPort.value}

# Start application
CMD ["python", "app.py"]`
      break

    case 'python-django':
      dockerfile = `FROM python:${pythonVersion.value}-slim

WORKDIR ${workDir.value}

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE ${exposedPort.value}

# Start application
CMD ["gunicorn", "--bind", "0.0.0.0:${exposedPort.value}", "project.wsgi:application"]`
      break

    case 'java':
      dockerfile = buildStage.value
        ? `# Build stage
FROM maven:3.9-eclipse-temurin-${javaVersion.value} AS builder

WORKDIR ${workDir.value}

# Copy pom.xml
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Production stage
FROM eclipse-temurin:${javaVersion.value}-jre-alpine

WORKDIR ${workDir.value}

# Copy jar from builder
COPY --from=builder ${workDir.value}/target/*.jar app.jar

# Expose port
EXPOSE ${exposedPort.value}

# Start application
ENTRYPOINT ["java", "-jar", "app.jar"]`
        : `FROM eclipse-temurin:${javaVersion.value}-jre-alpine

WORKDIR ${workDir.value}

# Copy jar file
COPY target/*.jar app.jar

# Expose port
EXPOSE ${exposedPort.value}

# Start application
ENTRYPOINT ["java", "-jar", "app.jar"]`
      break

    case 'go':
      dockerfile = buildStage.value
        ? `# Build stage
FROM golang:${goVersion.value}-alpine AS builder

WORKDIR ${workDir.value}

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Production stage
FROM alpine:latest

WORKDIR /root/

# Copy binary from builder
COPY --from=builder ${workDir.value}/main .

# Expose port
EXPOSE ${exposedPort.value}

# Start application
CMD ["./main"]`
        : `FROM golang:${goVersion.value}-alpine

WORKDIR ${workDir.value}

# Copy source code
COPY . .

# Download dependencies
RUN go mod download

# Build application
RUN go build -o main .

# Expose port
EXPOSE ${exposedPort.value}

# Start application
CMD ["./main"]`
      break

    case 'php':
      dockerfile = `FROM php:${phpVersion.value}-fpm-alpine

WORKDIR ${workDir.value}

# Install dependencies
RUN docker-php-ext-install pdo pdo_mysql

# Copy composer files
COPY composer.json composer.lock ./

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy source code
COPY . .

# Expose port
EXPOSE ${exposedPort.value}

# Start PHP-FPM
CMD ["php-fpm"]`
      break

    case 'nginx':
      dockerfile = `FROM nginx:alpine

# Copy nginx configuration (if you have one)
# COPY nginx.conf /etc/nginx/nginx.conf

# Copy static files
COPY dist/ /usr/share/nginx/html/

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]`
      break

    default:
      dockerfile = '# Select a template to generate Dockerfile'
  }

  return dockerfile
})

const copyDockerfile = async () => {
  await navigator.clipboard.writeText(generatedDockerfile.value)
}

const downloadDockerfile = () => {
  const blob = new Blob([generatedDockerfile.value], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Dockerfile'
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="dockerfile-generator">
    <div class="page-header">
      <h1 class="page-title">Dockerfile Generator</h1>
      <p class="page-description">Generate Dockerfiles from templates for various frameworks</p>
    </div>

    <div class="generator-container">
      <div class="template-panel">
        <h3 class="section-title">Select Template</h3>
        <div class="template-grid">
          <button
            v-for="(template, key) in templates"
            :key="key"
            @click="selectedTemplate = key"
            :class="['template-card', { active: selectedTemplate === key }]"
          >
            <div class="template-icon">{{ template.icon }}</div>
            <div class="template-name">{{ template.name }}</div>
            <div class="template-desc">{{ template.description }}</div>
          </button>
        </div>

        <div class="options-section">
          <h3 class="section-title">Options</h3>

          <div v-if="selectedTemplate.startsWith('nodejs')" class="option-group">
            <label>Node.js Version:</label>
            <select v-model="nodeVersion" class="select-input">
              <option value="20">20 (LTS)</option>
              <option value="18">18 (LTS)</option>
              <option value="16">16</option>
            </select>
          </div>

          <div v-if="selectedTemplate.startsWith('python')" class="option-group">
            <label>Python Version:</label>
            <select v-model="pythonVersion" class="select-input">
              <option value="3.12">3.12</option>
              <option value="3.11">3.11</option>
              <option value="3.10">3.10</option>
            </select>
          </div>

          <div v-if="selectedTemplate === 'java'" class="option-group">
            <label>Java Version:</label>
            <select v-model="javaVersion" class="select-input">
              <option value="21">21</option>
              <option value="17">17 (LTS)</option>
              <option value="11">11 (LTS)</option>
            </select>
          </div>

          <div v-if="selectedTemplate === 'go'" class="option-group">
            <label>Go Version:</label>
            <select v-model="goVersion" class="select-input">
              <option value="1.21">1.21</option>
              <option value="1.20">1.20</option>
            </select>
          </div>

          <div v-if="selectedTemplate === 'php'" class="option-group">
            <label>PHP Version:</label>
            <select v-model="phpVersion" class="select-input">
              <option value="8.3">8.3</option>
              <option value="8.2">8.2</option>
              <option value="8.1">8.1</option>
            </select>
          </div>

          <div v-if="selectedTemplate !== 'nginx'" class="option-group">
            <label>Working Directory:</label>
            <input v-model="workDir" type="text" class="input-field" />
          </div>

          <div v-if="selectedTemplate !== 'nginx'" class="option-group">
            <label>Exposed Port:</label>
            <input v-model="exposedPort" type="text" class="input-field" />
          </div>

          <div
            v-if="['nodejs', 'java', 'go'].includes(selectedTemplate)"
            class="option-group"
          >
            <label class="checkbox-label">
              <input v-model="buildStage" type="checkbox" />
              <span>Multi-stage Build</span>
            </label>
          </div>
        </div>
      </div>

      <div class="output-panel">
        <div class="output-header">
          <h3>Generated Dockerfile</h3>
          <div class="button-group">
            <button @click="copyDockerfile" class="btn btn-secondary">📋 Copy</button>
            <button @click="downloadDockerfile" class="btn btn-primary">💾 Download</button>
          </div>
        </div>
        <div class="dockerfile-output">
          <pre class="dockerfile-text">{{ generatedDockerfile }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dockerfile-generator {
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

.generator-container {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 1.5rem;
}

.template-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.template-card {
  padding: 1.25rem;
  background: #1a1a2e;
  border: 2px solid #2d2d44;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.template-card:hover {
  border-color: #6366f1;
  transform: translateY(-2px);
}

.template-card.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.template-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.template-name {
  color: #e5e7eb;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.template-desc {
  color: #9ca3af;
  font-size: 0.75rem;
}

.options-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  padding: 1.5rem;
}

.option-group {
  margin-bottom: 1rem;
}

.option-group:last-child {
  margin-bottom: 0;
}

.option-group label {
  display: block;
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #e5e7eb;
  font-size: 0.875rem;
}

.input-field:focus {
  outline: none;
  border-color: #6366f1;
}

.select-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #6366f1;
}

.output-panel {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
  height: fit-content;
  position: sticky;
  top: 1rem;
}

.output-header {
  padding: 1rem;
  background: #16162a;
  border-bottom: 1px solid #2d2d44;
}

.output-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
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
  flex: 1;
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

.dockerfile-output {
  padding: 1.5rem;
  background: #0f0f1e;
  max-height: 600px;
  overflow-y: auto;
}

.dockerfile-text {
  color: #10b981;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.8;
  margin: 0;
  white-space: pre;
}

@media (max-width: 1024px) {
  .generator-container {
    grid-template-columns: 1fr;
  }

  .output-panel {
    position: static;
    order: -1;
  }

  .template-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
