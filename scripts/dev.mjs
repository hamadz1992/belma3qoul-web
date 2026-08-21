import { spawn, execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const processes = []

function start(name, command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      ...extraEnv,
    },
  })

  child.on('exit', (code, signal) => {
    if (stopping) {
      return
    }

    stopping = true
    const reason = signal ?? code ?? 1
    console.error(`\n${name} exited unexpectedly (${reason}). Stopping other processes...`)
    shutdown()
    process.exit(typeof code === 'number' ? code : 1)
  })

  processes.push(child)
  return child
}

let stopping = false

function shutdown() {
  for (const child of processes) {
    if (!child.killed) {
      child.kill('SIGINT')
    }
  }
}

process.on('SIGINT', () => {
  if (stopping) return
  stopping = true
  shutdown()
  process.exit(0)
})

process.on('SIGTERM', () => {
  if (stopping) return
  stopping = true
  shutdown()
  process.exit(0)
})
function freePort8787() {
  if (process.platform !== 'win32') return

  try {
    const output = execSync('netstat -ano | findstr :8787', {
      encoding: 'utf8',
    })

    const lines = output
      .split('\n')
      .filter((line) => line.includes('LISTENING'))

    for (const line of lines) {
      const pid = line.trim().split(/\s+/).pop()

      if (pid) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
          console.log(`Closed process ${pid} on port 8787`)
        } catch {}
      }
    }
  } catch {
    // لا توجد عملية تستخدم المنفذ
  }
}
freePort8787()
start('server', process.execPath, ['server/index.js'])
start('vite', process.execPath, ['node_modules/vite/bin/vite.js'])
