<script setup>
import { ref, computed } from 'vue'

const input = ref('')
const serviceName = ref('app')
const composeVersion = ref('3.8')
const error = ref('')

const parseDockerRun = (command) => {
  const config = {
    image: '',
    container_name: '',
    ports: [],
    volumes: [],
    environment: [],
    networks: [],
    restart: '',
    command: '',
    working_dir: '',
    user: '',
    hostname: '',
    privileged: false,
    read_only: false,
    tty: false,
    stdin_open: false,
    detach: false,
    memory: '',
    cpus: '',
  }

  try {
    // Remove 'docker run' prefix
    let cmd = command.trim().replace(/^docker\s+run\s+/i, '')

    // Parse flags
    const flagPatterns = {
      name: /--name\s+(\S+)/,
      detach: /-d\b/,
      interactive: /-i\b/,
      tty: /-t\b/,
      rm: /--rm\b/,
      privileged: /--privileged\b/,
      readOnly: /--read-only\b/,
      port: /-p\s+(\S+)/g,
      volume: /-v\s+(\S+)/g,
      env: /-e\s+(\S+)/g,
      network: /--network\s+(\S+)/,
      restart: /--restart\s+(\S+)/,
      workdir: /-w\s+(\S+)/,
      user: /-u\s+(\S+)/,
      hostname: /-h\s+(\S+)/,
      memory: /--memory\s+(\S+)/,
      cpus: /--cpus\s+(\S+)/,
    }

    // Extract container name
    const nameMatch = cmd.match(flagPatterns.name)
    if (nameMatch) {
      config.container_name = nameMatch[1]
      cmd = cmd.replace(flagPatterns.name, '')
    }

    // Extract boolean flags
    config.detach = flagPatterns.detach.test(cmd)
    config.stdin_open = flagPatterns.interactive.test(cmd)
    config.tty = flagPatterns.tty.test(cmd)
    config.privileged = flagPatterns.privileged.test(cmd)
    config.read_only = flagPatterns.readOnly.test(cmd)

    // Extract restart policy
    const restartMatch = cmd.match(flagPatterns.restart)
    if (restartMatch) {
      config.restart = restartMatch[1]
      cmd = cmd.replace(flagPatterns.restart, '')
    }

    // Extract working directory
    const workdirMatch = cmd.match(flagPatterns.workdir)
    if (workdirMatch) {
      config.working_dir = workdirMatch[1]
      cmd = cmd.replace(flagPatterns.workdir, '')
    }

    // Extract user
    const userMatch = cmd.match(flagPatterns.user)
    if (userMatch) {
      config.user = userMatch[1]
      cmd = cmd.replace(flagPatterns.user, '')
    }

    // Extract hostname
    const hostnameMatch = cmd.match(flagPatterns.hostname)
    if (hostnameMatch) {
      config.hostname = hostnameMatch[1]
      cmd = cmd.replace(flagPatterns.hostname, '')
    }

    // Extract memory
    const memoryMatch = cmd.match(flagPatterns.memory)
    if (memoryMatch) {
      config.memory = memoryMatch[1]
      cmd = cmd.replace(flagPatterns.memory, '')
    }

    // Extract cpus
    const cpusMatch = cmd.match(flagPatterns.cpus)
    if (cpusMatch) {
      config.cpus = cpusMatch[1]
      cmd = cmd.replace(flagPatterns.cpus, '')
    }

    // Extract ports
    let portMatch
    while ((portMatch = flagPatterns.port.exec(cmd)) !== null) {
      config.ports.push(portMatch[1])
    }
    cmd = cmd.replace(flagPatterns.port, '')

    // Extract volumes
    let volumeMatch
    while ((volumeMatch = flagPatterns.volume.exec(cmd)) !== null) {
      config.volumes.push(volumeMatch[1])
    }
    cmd = cmd.replace(flagPatterns.volume, '')

    // Extract environment variables
    let envMatch
    while ((envMatch = flagPatterns.env.exec(cmd)) !== null) {
      config.environment.push(envMatch[1])
    }
    cmd = cmd.replace(flagPatterns.env, '')

    // Extract network
    const networkMatch = cmd.match(flagPatterns.network)
    if (networkMatch) {
      config.networks.push(networkMatch[1])
      cmd = cmd.replace(flagPatterns.network, '')
    }

    // Remove all flags
    cmd = cmd.replace(/-(d|i|t|-\w+)\s*/g, '').trim()

    // Extract image (first remaining argument)
    const parts = cmd.split(/\s+/)
    if (parts.length > 0) {
      config.image = parts[0]
      // Everything else is the command
      if (parts.length > 1) {
        config.command = parts.slice(1).join(' ')
      }
    }

    return config
  } catch (e) {
    throw new Error(`Failed to parse command: ${e.message}`)
  }
}

const generatedCompose = computed(() => {
  if (!input.value.trim()) {
    return '# Enter a docker run command to convert'
  }

  try {
    error.value = ''
    const config = parseDockerRun(input.value)

    if (!config.image) {
      error.value = 'Could not extract image name from command'
      return '# Error: No image found'
    }

    const indent = '  '
    let compose = `version: '${composeVersion.value}'\n\n`
    compose += `services:\n`
    compose += `${indent}${serviceName.value}:\n`

    // Image
    compose += `${indent}${indent}image: ${config.image}\n`

    // Container name
    if (config.container_name) {
      compose += `${indent}${indent}container_name: ${config.container_name}\n`
    }

    // Ports
    if (config.ports.length > 0) {
      compose += `${indent}${indent}ports:\n`
      config.ports.forEach((port) => {
        compose += `${indent}${indent}${indent}- "${port}"\n`
      })
    }

    // Volumes
    if (config.volumes.length > 0) {
      compose += `${indent}${indent}volumes:\n`
      config.volumes.forEach((vol) => {
        compose += `${indent}${indent}${indent}- ${vol}\n`
      })
    }

    // Environment
    if (config.environment.length > 0) {
      compose += `${indent}${indent}environment:\n`
      config.environment.forEach((env) => {
        compose += `${indent}${indent}${indent}- ${env}\n`
      })
    }

    // Networks
    if (config.networks.length > 0) {
      compose += `${indent}${indent}networks:\n`
      config.networks.forEach((net) => {
        compose += `${indent}${indent}${indent}- ${net}\n`
      })
    }

    // Restart policy
    if (config.restart) {
      compose += `${indent}${indent}restart: ${config.restart}\n`
    }

    // Working directory
    if (config.working_dir) {
      compose += `${indent}${indent}working_dir: ${config.working_dir}\n`
    }

    // User
    if (config.user) {
      compose += `${indent}${indent}user: ${config.user}\n`
    }

    // Hostname
    if (config.hostname) {
      compose += `${indent}${indent}hostname: ${config.hostname}\n`
    }

    // Boolean flags
    if (config.stdin_open) {
      compose += `${indent}${indent}stdin_open: true\n`
    }
    if (config.tty) {
      compose += `${indent}${indent}tty: true\n`
    }
    if (config.privileged) {
      compose += `${indent}${indent}privileged: true\n`
    }
    if (config.read_only) {
      compose += `${indent}${indent}read_only: true\n`
    }

    // Resource limits (v3 format)
    if (config.memory || config.cpus) {
      compose += `${indent}${indent}deploy:\n`
      compose += `${indent}${indent}${indent}resources:\n`
      compose += `${indent}${indent}${indent}${indent}limits:\n`
      if (config.memory) {
        compose += `${indent}${indent}${indent}${indent}${indent}memory: ${config.memory}\n`
      }
      if (config.cpus) {
        compose += `${indent}${indent}${indent}${indent}${indent}cpus: '${config.cpus}'\n`
      }
    }

    // Command
    if (config.command) {
      const cmdParts = config.command.split(/\s+/)
      if (cmdParts.length === 1) {
        compose += `${indent}${indent}command: ${config.command}\n`
      } else {
        compose += `${indent}${indent}command: [${cmdParts.map((p) => `"${p}"`).join(', ')}]\n`
      }
    }

    return compose
  } catch (e) {
    error.value = e.message
    return `# Error: ${e.message}`
  }
})

const copyCompose = async () => {
  await navigator.clipboard.writeText(generatedCompose.value)
}

const downloadCompose = () => {
  const blob = new Blob([generatedCompose.value], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'docker-compose.yml'
  a.click()
  window.URL.revokeObjectURL(url)
}

const clearAll = () => {
  input.value = ''
  error.value = ''
}

const loadExample = () => {
  input.value = `docker run -d --name my-nginx -p 8080:80 -v ./html:/usr/share/nginx/html -e NGINX_HOST=example.com --restart unless-stopped nginx:latest`
}
</script>

<template>
  <div class="docker-run-to-compose">
    <div class="page-header">
      <h1 class="page-title">Docker Run → Compose</h1>
      <p class="page-description">Convert docker run commands to docker-compose.yml</p>
    </div>

    <div class="converter-container">
      <div class="input-section">
        <div class="section-header">
          <h3>Docker Run Command</h3>
          <div class="options">
            <div class="option-group">
              <label>Service Name:</label>
              <input v-model="serviceName" type="text" class="input-field small" />
            </div>
            <div class="option-group">
              <label>Version:</label>
              <select v-model="composeVersion" class="select-input small">
                <option value="3.8">3.8</option>
                <option value="3.7">3.7</option>
                <option value="2.4">2.4</option>
              </select>
            </div>
          </div>
        </div>
        <textarea
          v-model="input"
          placeholder="docker run -d --name my-app -p 8080:80 nginx:latest"
          class="command-input"
        ></textarea>
        <div class="button-group">
          <button @click="loadExample" class="btn btn-secondary">Load Example</button>
          <button @click="clearAll" class="btn btn-danger">Clear</button>
        </div>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="output-section">
        <div class="section-header">
          <h3>Generated docker-compose.yml</h3>
          <div class="button-group">
            <button @click="copyCompose" class="btn btn-secondary">📋 Copy</button>
            <button @click="downloadCompose" class="btn btn-primary">💾 Download</button>
          </div>
        </div>
        <pre class="compose-output">{{ generatedCompose }}</pre>
      </div>
    </div>

    <div class="info-section">
      <h3 class="info-title">Supported Flags</h3>
      <div class="flags-grid">
        <div class="flag-item">
          <code>--name</code>
          <span>→ container_name</span>
        </div>
        <div class="flag-item">
          <code>-p, --publish</code>
          <span>→ ports</span>
        </div>
        <div class="flag-item">
          <code>-v, --volume</code>
          <span>→ volumes</span>
        </div>
        <div class="flag-item">
          <code>-e, --env</code>
          <span>→ environment</span>
        </div>
        <div class="flag-item">
          <code>--network</code>
          <span>→ networks</span>
        </div>
        <div class="flag-item">
          <code>--restart</code>
          <span>→ restart</span>
        </div>
        <div class="flag-item">
          <code>-w, --workdir</code>
          <span>→ working_dir</span>
        </div>
        <div class="flag-item">
          <code>-u, --user</code>
          <span>→ user</span>
        </div>
        <div class="flag-item">
          <code>-d, --detach</code>
          <span>→ (implicit)</span>
        </div>
        <div class="flag-item">
          <code>-i, --interactive</code>
          <span>→ stdin_open</span>
        </div>
        <div class="flag-item">
          <code>-t, --tty</code>
          <span>→ tty</span>
        </div>
        <div class="flag-item">
          <code>--privileged</code>
          <span>→ privileged</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.docker-run-to-compose {
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

.converter-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-section,
.output-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  overflow: hidden;
}

.section-header {
  padding: 1rem;
  background: #16162a;
  border-bottom: 1px solid #2d2d44;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.options {
  display: flex;
  gap: 1rem;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.option-group label {
  color: #9ca3af;
  font-size: 0.75rem;
  white-space: nowrap;
}

.input-field.small {
  padding: 0.375rem 0.625rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 4px;
  color: #e5e7eb;
  font-size: 0.75rem;
  width: 100px;
}

.input-field.small:focus {
  outline: none;
  border-color: #6366f1;
}

.select-input.small {
  padding: 0.375rem 0.625rem;
  background: #0f0f1e;
  border: 1px solid #2d2d44;
  border-radius: 4px;
  color: #e5e7eb;
  font-size: 0.75rem;
  cursor: pointer;
  width: 80px;
}

.select-input.small:focus {
  outline: none;
  border-color: #6366f1;
}

.command-input {
  width: 100%;
  min-height: 120px;
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

.command-input::placeholder {
  color: #6b7280;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #2d2d44;
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
}

.compose-output {
  padding: 1.5rem;
  background: #0f0f1e;
  color: #10b981;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.8;
  margin: 0;
  white-space: pre;
  overflow-x: auto;
  min-height: 300px;
}

.info-section {
  background: #1a1a2e;
  border: 1px solid #2d2d44;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.info-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 1rem;
}

.flags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.flag-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #0f0f1e;
  border-radius: 4px;
  font-size: 0.875rem;
}

.flag-item code {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.75rem;
}

.flag-item span {
  color: #9ca3af;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .options {
    width: 100%;
    flex-direction: column;
  }

  .option-group {
    width: 100%;
    justify-content: space-between;
  }

  .input-field.small,
  .select-input.small {
    width: auto;
    flex: 1;
  }

  .flags-grid {
    grid-template-columns: 1fr;
  }
}
</style>
