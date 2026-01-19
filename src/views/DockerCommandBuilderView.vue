<script setup>
import { ref, computed } from 'vue'

const containerName = ref('')
const imageName = ref('')
const imageTag = ref('latest')
const detached = ref(true)
const interactive = ref(false)
const tty = ref(false)
const autoRemove = ref(false)

// Ports
const ports = ref([{ host: '', container: '' }])
const addPort = () => ports.value.push({ host: '', container: '' })
const removePort = (index) => ports.value.splice(index, 1)

// Volumes
const volumes = ref([{ host: '', container: '' }])
const addVolume = () => volumes.value.push({ host: '', container: '' })
const removeVolume = (index) => volumes.value.splice(index, 1)

// Environment Variables
const envVars = ref([{ key: '', value: '' }])
const addEnvVar = () => envVars.value.push({ key: '', value: '' })
const removeEnvVar = (index) => envVars.value.splice(index, 1)

// Network
const networkMode = ref('')
const customNetwork = ref('')

// Resources
const memoryLimit = ref('')
const cpuLimit = ref('')

// Restart Policy
const restartPolicy = ref('')

// Additional flags
const privileged = ref(false)
const readOnly = ref(false)

// Working directory
const workdir = ref('')

// Command
const command = ref('')

const generatedCommand = computed(() => {
  if (!imageName.value.trim()) {
    return 'docker run [Please enter image name]'
  }

  let cmd = 'docker run'

  // Flags
  if (detached.value) cmd += ' -d'
  if (interactive.value) cmd += ' -i'
  if (tty.value) cmd += ' -t'
  if (autoRemove.value) cmd += ' --rm'
  if (privileged.value) cmd += ' --privileged'
  if (readOnly.value) cmd += ' --read-only'

  // Container name
  if (containerName.value.trim()) {
    cmd += ` --name ${containerName.value.trim()}`
  }

  // Ports
  ports.value.forEach((port) => {
    if (port.host && port.container) {
      cmd += ` -p ${port.host}:${port.container}`
    }
  })

  // Volumes
  volumes.value.forEach((vol) => {
    if (vol.host && vol.container) {
      cmd += ` -v ${vol.host}:${vol.container}`
    }
  })

  // Environment variables
  envVars.value.forEach((env) => {
    if (env.key && env.value) {
      cmd += ` -e ${env.key}=${env.value}`
    }
  })

  // Network
  if (networkMode.value) {
    cmd += ` --network ${networkMode.value}`
  } else if (customNetwork.value.trim()) {
    cmd += ` --network ${customNetwork.value.trim()}`
  }

  // Resources
  if (memoryLimit.value) {
    cmd += ` --memory ${memoryLimit.value}`
  }
  if (cpuLimit.value) {
    cmd += ` --cpus ${cpuLimit.value}`
  }

  // Restart policy
  if (restartPolicy.value) {
    cmd += ` --restart ${restartPolicy.value}`
  }

  // Working directory
  if (workdir.value.trim()) {
    cmd += ` -w ${workdir.value.trim()}`
  }

  // Image
  const image = imageTag.value ? `${imageName.value}:${imageTag.value}` : imageName.value
  cmd += ` ${image}`

  // Command
  if (command.value.trim()) {
    cmd += ` ${command.value.trim()}`
  }

  return cmd
})

const copyCommand = async () => {
  await navigator.clipboard.writeText(generatedCommand.value)
}

const clearAll = () => {
  containerName.value = ''
  imageName.value = ''
  imageTag.value = 'latest'
  detached.value = true
  interactive.value = false
  tty.value = false
  autoRemove.value = false
  ports.value = [{ host: '', container: '' }]
  volumes.value = [{ host: '', container: '' }]
  envVars.value = [{ key: '', value: '' }]
  networkMode.value = ''
  customNetwork.value = ''
  memoryLimit.value = ''
  cpuLimit.value = ''
  restartPolicy.value = ''
  privileged.value = false
  readOnly.value = false
  workdir.value = ''
  command.value = ''
}

const loadExample = () => {
  containerName.value = 'my-nginx'
  imageName.value = 'nginx'
  imageTag.value = 'latest'
  detached.value = true
  ports.value = [{ host: '8080', container: '80' }]
  volumes.value = [{ host: './html', container: '/usr/share/nginx/html' }]
  envVars.value = [{ key: 'NGINX_HOST', value: 'example.com' }]
  restartPolicy.value = 'unless-stopped'
}
</script>

<template>
  <div class="docker-command-builder">
    <div class="page-header">
      <h1 class="page-title">Docker Command Builder</h1>
      <p class="page-description">Build docker run commands with a visual interface</p>
    </div>

    <div class="builder-container">
      <div class="options-panel">
        <!-- Basic Options -->
        <div class="option-section">
          <h3 class="section-title">Basic Options</h3>

          <div class="input-row">
            <label>Image Name *</label>
            <div class="image-input-group">
              <input v-model="imageName" type="text" placeholder="nginx" class="input-field" />
              <span class="separator">:</span>
              <input v-model="imageTag" type="text" placeholder="latest" class="input-field tag-field" />
            </div>
          </div>

          <div class="input-row">
            <label>Container Name</label>
            <input v-model="containerName" type="text" placeholder="my-container" class="input-field" />
          </div>

          <div class="checkbox-group">
            <label class="checkbox-label">
              <input v-model="detached" type="checkbox" />
              <span>Detached (-d) - Run in background</span>
            </label>
            <label class="checkbox-label">
              <input v-model="interactive" type="checkbox" />
              <span>Interactive (-i) - Keep STDIN open</span>
            </label>
            <label class="checkbox-label">
              <input v-model="tty" type="checkbox" />
              <span>TTY (-t) - Allocate pseudo-TTY</span>
            </label>
            <label class="checkbox-label">
              <input v-model="autoRemove" type="checkbox" />
              <span>Auto Remove (--rm) - Remove on exit</span>
            </label>
          </div>
        </div>

        <!-- Port Mappings -->
        <div class="option-section">
          <h3 class="section-title">Port Mappings</h3>
          <div v-for="(port, index) in ports" :key="index" class="mapping-row">
            <input v-model="port.host" type="text" placeholder="Host Port" class="input-field" />
            <span class="separator">:</span>
            <input v-model="port.container" type="text" placeholder="Container Port" class="input-field" />
            <button @click="removePort(index)" class="btn-icon btn-remove" :disabled="ports.length === 1">
              ✕
            </button>
          </div>
          <button @click="addPort" class="btn btn-add">+ Add Port</button>
        </div>

        <!-- Volume Mounts -->
        <div class="option-section">
          <h3 class="section-title">Volume Mounts</h3>
          <div v-for="(vol, index) in volumes" :key="index" class="mapping-row">
            <input v-model="vol.host" type="text" placeholder="Host Path" class="input-field" />
            <span class="separator">:</span>
            <input v-model="vol.container" type="text" placeholder="Container Path" class="input-field" />
            <button @click="removeVolume(index)" class="btn-icon btn-remove" :disabled="volumes.length === 1">
              ✕
            </button>
          </div>
          <button @click="addVolume" class="btn btn-add">+ Add Volume</button>
        </div>

        <!-- Environment Variables -->
        <div class="option-section">
          <h3 class="section-title">Environment Variables</h3>
          <div v-for="(env, index) in envVars" :key="index" class="mapping-row">
            <input v-model="env.key" type="text" placeholder="KEY" class="input-field" />
            <span class="separator">=</span>
            <input v-model="env.value" type="text" placeholder="value" class="input-field" />
            <button @click="removeEnvVar(index)" class="btn-icon btn-remove" :disabled="envVars.length === 1">
              ✕
            </button>
          </div>
          <button @click="addEnvVar" class="btn btn-add">+ Add Variable</button>
        </div>

        <!-- Network -->
        <div class="option-section">
          <h3 class="section-title">Network</h3>
          <div class="input-row">
            <label>Network Mode</label>
            <select v-model="networkMode" class="select-input">
              <option value="">Default</option>
              <option value="bridge">Bridge</option>
              <option value="host">Host</option>
              <option value="none">None</option>
            </select>
          </div>
          <div class="input-row">
            <label>Custom Network</label>
            <input v-model="customNetwork" type="text" placeholder="my-network" class="input-field" />
          </div>
        </div>

        <!-- Resources -->
        <div class="option-section">
          <h3 class="section-title">Resources</h3>
          <div class="input-row">
            <label>Memory Limit</label>
            <input v-model="memoryLimit" type="text" placeholder="512m" class="input-field" />
          </div>
          <div class="input-row">
            <label>CPU Limit</label>
            <input v-model="cpuLimit" type="text" placeholder="1.5" class="input-field" />
          </div>
        </div>

        <!-- Advanced -->
        <div class="option-section">
          <h3 class="section-title">Advanced</h3>
          <div class="input-row">
            <label>Restart Policy</label>
            <select v-model="restartPolicy" class="select-input">
              <option value="">No restart</option>
              <option value="always">Always</option>
              <option value="unless-stopped">Unless Stopped</option>
              <option value="on-failure">On Failure</option>
            </select>
          </div>
          <div class="input-row">
            <label>Working Directory</label>
            <input v-model="workdir" type="text" placeholder="/app" class="input-field" />
          </div>
          <div class="input-row">
            <label>Command</label>
            <input v-model="command" type="text" placeholder="bash" class="input-field" />
          </div>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input v-model="privileged" type="checkbox" />
              <span>Privileged Mode</span>
            </label>
            <label class="checkbox-label">
              <input v-model="readOnly" type="checkbox" />
              <span>Read-Only Filesystem</span>
            </label>
          </div>
        </div>
      </div>

      <div class="output-panel">
        <div class="output-header">
          <h3>Generated Command</h3>
          <div class="button-group">
            <button @click="loadExample" class="btn btn-secondary">Load Example</button>
            <button @click="clearAll" class="btn btn-danger">Clear All</button>
            <button @click="copyCommand" class="btn btn-primary">📋 Copy</button>
          </div>
        </div>
        <div class="command-output">
          <pre class="command-text">{{ generatedCommand }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.docker-command-builder {
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

.builder-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.options-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.option-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  padding: 1.5rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.input-row {
  margin-bottom: 1rem;
}

.input-row:last-child {
  margin-bottom: 0;
}

.input-row label {
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

.image-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-field {
  width: 120px;
}

.separator {
  color: #6366f1;
  font-weight: 700;
  font-size: 1.125rem;
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

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #6366f1;
}

.mapping-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.btn-icon {
  padding: 0.5rem;
  background: transparent;
  border: 1px solid #2d2d44;
  border-radius: 6px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 36px;
}

.btn-icon:hover:not(:disabled) {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.btn-icon:disabled {
  opacity: 0.3;
  cursor: not-allowed;
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

.btn-add {
  width: 100%;
  background: #2d2d44;
  color: #e5e7eb;
  margin-top: 0.5rem;
}

.btn-add:hover {
  background: #3d3d54;
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

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
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

.command-output {
  padding: 1.5rem;
  background: #0f0f1e;
  min-height: 200px;
}

.command-text {
  color: #10b981;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.8;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

@media (max-width: 1024px) {
  .builder-container {
    grid-template-columns: 1fr;
  }

  .output-panel {
    position: static;
    order: -1;
  }
}
</style>
