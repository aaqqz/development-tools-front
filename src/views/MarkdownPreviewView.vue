<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'

const input = ref('')

const htmlOutput = computed(() => {
  if (!input.value.trim()) return ''

  try {
    return marked(input.value)
  } catch (err) {
    return `<p style="color: #ef4444;">Error parsing markdown: ${err.message}</p>`
  }
})

const copyMarkdown = () => {
  navigator.clipboard.writeText(input.value)
}

const copyHtml = () => {
  navigator.clipboard.writeText(htmlOutput.value)
}

const clearAll = () => {
  input.value = ''
}

const loadSample = () => {
  input.value = `# Markdown Preview

## Features

This is a **markdown preview** tool that supports:

- **Bold** and *italic* text
- [Links](https://example.com)
- Code blocks
- Tables
- And more!

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Table Example

| Feature | Status |
|---------|--------|
| Headers | ✅ |
| Lists | ✅ |
| Code | ✅ |

> This is a blockquote
> It can span multiple lines

---

### Task List

- [x] Completed task
- [ ] Pending task
- [ ] Another task

**Try editing the markdown on the left!**`
}
</script>

<template>
  <div class="markdown-preview">
    <div class="page-header">
      <h1 class="page-title">Markdown Preview</h1>
      <p class="page-description">Write and preview markdown in real-time</p>
    </div>

    <div class="controls">
      <button @click="loadSample" class="btn btn-primary">Load Sample</button>
      <button @click="clearAll" class="btn btn-secondary">Clear</button>
      <button v-if="input" @click="copyMarkdown" class="btn btn-secondary">📋 Copy Markdown</button>
      <button v-if="htmlOutput" @click="copyHtml" class="btn btn-secondary">📋 Copy HTML</button>
    </div>

    <div class="editor-container">
      <div class="editor-panel">
        <div class="panel-header">
          <h3>Markdown Editor</h3>
        </div>
        <textarea
          v-model="input"
          placeholder="Write your markdown here..."
          class="markdown-input"
        ></textarea>
      </div>

      <div class="preview-panel">
        <div class="panel-header">
          <h3>Live Preview</h3>
        </div>
        <div v-if="htmlOutput" class="markdown-preview-content" v-html="htmlOutput"></div>
        <div v-else class="empty-state">
          <p>Write some markdown to see the preview</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.markdown-preview {
  max-width: 1600px;
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

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  height: calc(100vh - 250px);
}

.editor-panel,
.preview-panel {
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
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

.markdown-input {
  flex: 1;
  padding: 1rem;
  background: #0f0f1e;
  border: none;
  color: #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.markdown-input::placeholder {
  color: #6b7280;
}

.markdown-preview-content {
  flex: 1;
  padding: 2rem;
  background: #0f0f1e;
  overflow-y: auto;
  color: #e5e7eb;
  line-height: 1.7;
}

.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Markdown content styling */
.markdown-preview-content :deep(h1) {
  font-size: 2rem;
  font-weight: 700;
  margin: 1.5rem 0 1rem;
  color: #c4b5fd;
  border-bottom: 2px solid #2d2d44;
  padding-bottom: 0.5rem;
}

.markdown-preview-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.25rem 0 0.75rem;
  color: #a78bfa;
}

.markdown-preview-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
  color: #a78bfa;
}

.markdown-preview-content :deep(p) {
  margin: 0.75rem 0;
}

.markdown-preview-content :deep(a) {
  color: #6366f1;
  text-decoration: none;
  border-bottom: 1px solid #6366f1;
}

.markdown-preview-content :deep(a:hover) {
  color: #7c3aed;
  border-bottom-color: #7c3aed;
}

.markdown-preview-content :deep(strong) {
  font-weight: 700;
  color: #fbbf24;
}

.markdown-preview-content :deep(em) {
  font-style: italic;
  color: #10b981;
}

.markdown-preview-content :deep(code) {
  background: #1a1a2e;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875em;
  color: #10b981;
}

.markdown-preview-content :deep(pre) {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-preview-content :deep(pre code) {
  background: none;
  padding: 0;
  color: #e5e7eb;
}

.markdown-preview-content :deep(blockquote) {
  border-left: 4px solid #6366f1;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #9ca3af;
  font-style: italic;
}

.markdown-preview-content :deep(ul),
.markdown-preview-content :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 2rem;
}

.markdown-preview-content :deep(li) {
  margin: 0.25rem 0;
}

.markdown-preview-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-preview-content :deep(th),
.markdown-preview-content :deep(td) {
  padding: 0.75rem;
  border: 1px solid #2d2d44;
  text-align: left;
}

.markdown-preview-content :deep(th) {
  background: #1a1a2e;
  font-weight: 600;
  color: #a78bfa;
}

.markdown-preview-content :deep(tr:nth-child(even)) {
  background: rgba(99, 102, 241, 0.05);
}

.markdown-preview-content :deep(hr) {
  border: none;
  border-top: 2px solid #2d2d44;
  margin: 2rem 0;
}

.markdown-preview-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 1rem 0;
}

@media (max-width: 968px) {
  .editor-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .editor-panel,
  .preview-panel {
    height: 400px;
  }
}
</style>