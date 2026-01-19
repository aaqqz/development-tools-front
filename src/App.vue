<script setup>
import { ref } from 'vue'
import { RouterView, RouterLink } from 'vue-router'

const sidebarOpen = ref(true)
const searchQuery = ref('')

const toolCategories = [
  {
    name: 'String Utils',
    icon: '📝',
    tools: [
      { name: 'JSON Formatter', path: '/json-formatter' },
      { name: 'XML Formatter', path: '/xml-formatter' },
      { name: 'Base64 Encoder', path: '/base64' },
      { name: 'URL Encoder', path: '/url-encoder' },
      { name: 'Case Converter', path: '/case-converter' },
      { name: 'Diff Checker', path: '/diff-checker' },
    ],
  },
  {
    name: 'SQL Tools',
    icon: '🗄️',
    tools: [
      { name: 'SQL Formatter', path: '/sql-formatter' },
      { name: 'IN Clause Generator', path: '/in-clause' },
    ],
  },
  {
    name: 'API & Security',
    icon: '🔐',
    tools: [
      { name: 'JWT Decoder', path: '/jwt-decoder' },
      { name: 'Hash Generator', path: '/hash-generator' },
      { name: 'Password Generator', path: '/password-generator' },
      { name: 'UUID Generator', path: '/uuid-generator' },
      { name: 'QR Code Generator', path: '/qr-generator' },
    ],
  },
  {
    name: 'Java Tools',
    icon: '☕',
    tools: [
      { name: 'Stack Trace Analyzer', path: '/stack-trace' },
      { name: 'YAML ↔ Properties', path: '/yaml-properties' },
    ],
  },
  {
    name: 'Network & API',
    icon: '🌐',
    tools: [
      { name: 'HTTP Request Builder', path: '/http-request' },
    ],
  },
  {
    name: 'Utilities',
    icon: '🛠️',
    tools: [
      { name: 'Regex Tester', path: '/regex-tester' },
      { name: 'Cron Expression', path: '/cron-expression' },
      { name: 'Timestamp Converter', path: '/timestamp' },
      { name: 'Markdown Preview', path: '/markdown-preview' },
    ],
  },
  {
    name: 'Docker Tools',
    icon: '🐳',
    tools: [
      { name: 'Compose Converter', path: '/docker-compose-converter' },
      { name: 'Command Builder', path: '/docker-command-builder' },
      { name: 'Dockerfile Generator', path: '/dockerfile-generator' },
      { name: 'Compose Validator', path: '/docker-compose-validator' },
      { name: 'Run → Compose', path: '/docker-run-to-compose' },
    ],
  },
]
</script>

<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside :class="['sidebar', { collapsed: !sidebarOpen }]">
      <div class="sidebar-header">
        <RouterLink to="/" class="logo-link">
          <h1 class="logo">
            <span class="logo-icon">⚡</span>
            <span v-if="sidebarOpen" class="logo-text">DevKit</span>
          </h1>
        </RouterLink>
      </div>

      <nav v-if="sidebarOpen" class="sidebar-nav">
        <div v-for="category in toolCategories" :key="category.name" class="nav-category">
          <div class="category-title">
            <span class="category-icon">{{ category.icon }}</span>
            {{ category.name }}
          </div>
          <ul class="tool-list">
            <li v-for="tool in category.tools" :key="tool.path">
              <RouterLink :to="tool.path" class="tool-link">
                {{ tool.name }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <button @click="sidebarOpen = !sidebarOpen" class="toggle-sidebar">
        {{ sidebarOpen ? '◀' : '▶' }}
      </button>
    </aside>

    <!-- Main Content -->
    <div class="main-wrapper">
      <header class="top-header">
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tools..."
            class="search-input"
          />
        </div>
        <div class="header-actions">
          <a
            href="https://github.com/yourusername/devkit"
            target="_blank"
            class="github-link"
            title="GitHub Repository"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
          </a>
        </div>
      </header>

      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: #0f0f1e;
  color: #e5e7eb;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%);
  border-right: 1px solid #2d2d44;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #2d2d44;
}

.logo-link {
  text-decoration: none;
  cursor: pointer;
  display: block;
  transition: opacity 0.2s ease;
}

.logo-link:hover {
  opacity: 0.8;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #a78bfa;
  margin: 0;
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  background: linear-gradient(135deg, #a78bfa 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-category {
  margin-bottom: 1.5rem;
}

.category-title {
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-icon {
  font-size: 1rem;
}

.tool-list {
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0 0;
}

.tool-link {
  display: block;
  padding: 0.625rem 1.5rem 0.625rem 3rem;
  color: #d1d5db;
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.tool-link:hover {
  background: rgba(167, 139, 250, 0.1);
  color: #a78bfa;
  border-left-color: #a78bfa;
}

.tool-link.router-link-active {
  background: rgba(99, 102, 241, 0.15);
  color: #c4b5fd;
  border-left-color: #6366f1;
  font-weight: 500;
}

.toggle-sidebar {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: #6366f1;
  border: none;
  border-radius: 0 8px 8px 0;
  color: white;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.toggle-sidebar:hover {
  background: #7c3aed;
  width: 28px;
}

/* Main Content Styles */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-header {
  background: #16162a;
  border-bottom: 1px solid #2d2d44;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.search-container {
  flex: 1;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  color: #e5e7eb;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-input::placeholder {
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.github-link {
  color: #9ca3af;
  transition: color 0.2s ease;
}

.github-link:hover {
  color: #a78bfa;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

/* Scrollbar Styles */
.sidebar-nav::-webkit-scrollbar,
.main-content::-webkit-scrollbar {
  width: 8px;
}

.sidebar-nav::-webkit-scrollbar-track,
.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb,
.main-content::-webkit-scrollbar-thumb {
  background: #2d2d44;
  border-radius: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover,
.main-content::-webkit-scrollbar-thumb:hover {
  background: #3d3d54;
}
</style>
