<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const featuredTools = [
  {
    name: 'JSON Formatter',
    description: 'Format, validate and beautify JSON data',
    icon: '{ }',
    path: '/json-formatter',
    color: '#10b981',
  },
  {
    name: 'SQL Formatter',
    description: 'Format and beautify SQL queries',
    icon: 'SQL',
    path: '/sql-formatter',
    color: '#f59e0b',
  },
  {
    name: 'Base64 Encoder',
    description: 'Encode and decode Base64 strings',
    icon: '🔤',
    path: '/base64',
    color: '#3b82f6',
  },
  {
    name: 'JWT Decoder',
    description: 'Decode and verify JWT tokens',
    icon: '🔐',
    path: '/jwt-decoder',
    color: '#8b5cf6',
  },
  {
    name: 'UUID Generator',
    description: 'Generate random UUIDs',
    icon: '🎲',
    path: '/uuid-generator',
    color: '#ec4899',
  },
  {
    name: 'Regex Tester',
    description: 'Test regular expressions in real-time',
    icon: '.*',
    path: '/regex-tester',
    color: '#ef4444',
  },
]

const navigateToTool = (path) => {
  router.push(path)
}
</script>

<template>
  <div class="home-view">
    <div class="hero-section">
      <h1 class="hero-title">
        <span class="gradient-text">Developer's</span>
        <br />
        Essential Toolkit
      </h1>
      <p class="hero-subtitle">
        Collection of essential tools for developers. Format, validate, and transform
        data with ease.
      </p>
    </div>

    <section class="tools-section">
      <h2 class="section-title">Popular Tools</h2>
      <div class="tools-grid">
        <div
          v-for="tool in featuredTools"
          :key="tool.path"
          class="tool-card"
          @click="navigateToTool(tool.path)"
        >
          <div class="tool-icon" :style="{ backgroundColor: tool.color + '20', color: tool.color }">
            {{ tool.icon }}
          </div>
          <h3 class="tool-name">{{ tool.name }}</h3>
          <p class="tool-description">{{ tool.description }}</p>
          <div class="tool-arrow">→</div>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="feature">
        <div class="feature-icon">⚡</div>
        <h3>Fast & Efficient</h3>
        <p>Optimized for quick and seamless workflows</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🔒</div>
        <h3>Privacy Focused</h3>
        <p>Most tools process data locally in your browser</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🎯</div>
        <h3>Developer Focused</h3>
        <p>Built by developers, for developers</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 3rem 0 4rem;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: #e5e7eb;
}

.gradient-text {
  background: linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #9ca3af;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #e5e7eb;
  margin-bottom: 2rem;
}

.tools-section {
  margin-bottom: 4rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.tool-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16162a 100%);
  border: 1px solid #2d2d44;
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tool-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #a78bfa 0%, #6366f1 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tool-card:hover::before {
  opacity: 1;
}

.tool-card:hover {
  transform: translateY(-4px);
  border-color: #6366f1;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
}

.tool-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
}

.tool-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 0.75rem;
}

.tool-description {
  color: #9ca3af;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.tool-arrow {
  color: #6366f1;
  font-size: 1.5rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.tool-card:hover .tool-arrow {
  opacity: 1;
  transform: translateX(0);
}

.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 3rem 0;
  border-top: 1px solid #2d2d44;
}

.feature {
  text-align: center;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 0.5rem;
}

.feature p {
  color: #9ca3af;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>
