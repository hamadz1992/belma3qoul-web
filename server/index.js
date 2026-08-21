import http from 'node:http'
import crypto from 'node:crypto'
import { createReadStream } from 'node:fs'
import { access, readFile, writeFile, stat, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadFacebookData } from './facebook-storage.js'
import { fetchFacebookPosts, fetchFacebookPostById } from './facebook.js'
import {
  facebookLogin,
  facebookCallback,
} from './routes/facebook-auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const dataDir = path.join(__dirname, 'data')

const featuredFile = path.join(dataDir, 'featured-posts.json')
const settingsFile = path.join(dataDir, 'settings.json')
const analyticsFile = path.join(dataDir, 'analytics.json')

const port = Number.parseInt(
  process.env.FACEBOOK_API_PORT || process.env.PORT || '8787',
  10
)

const DEFAULT_SETTINGS = {
  site: {
    name: '',
    description: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    googleMaps: '',
    hours: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    telegram: '',
    youtube: '',
  },
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
    telegram: '',
    youtube: '',
    whatsapp: '',
    messenger: '',
  },
}

const sessions = new Map()
const loginAttempts = new Map()
const SESSION_TTL_MS = 8 * 60 * 60 * 1000
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 5
const ADMIN_COOKIE = '__Host-belma3qoul_admin'
const VISITOR_COOKIE = '__Host-belma3qoul_visitor'

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getClientIp(req) {
  const forwarded = text(req.headers['x-forwarded-for'])
  return forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || 'unknown'
}

function getCookie(req, name) {
  const raw = text(req.headers.cookie)
  if (!raw) return ''
  for (const part of raw.split(';')) {
    const index = part.indexOf('=')
    if (index === -1) continue
    if (part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim())
  }
  return ''
}

function isHttps(req) {
  return text(req.headers['x-forwarded-proto']).split(',')[0].trim() === 'https' || process.env.NODE_ENV === 'production'
}

function setSessionCookie(req, res, token) {
  const secure = isHttps(req) ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${secure}`)
}

function clearSessionCookie(req, res) {
  const secure = isHttps(req) ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`)
}

function cleanupSessions() {
  const now = Date.now()
  for (const [token, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(token)
  }
  for (const [ip, attempt] of loginAttempts) {
    if (attempt.resetAt <= now) loginAttempts.delete(ip)
  }
}

setInterval(cleanupSessions, 10 * 60 * 1000).unref()

function isSameOrigin(req) {
  const origin = text(req.headers.origin)
  if (!origin) return true
  const host = text(req.headers.host)
  const protocol = text(req.headers['x-forwarded-proto']).split(',')[0].trim() || (isHttps(req) ? 'https' : 'http')
  try {
    return new URL(origin).host === host && new URL(origin).protocol === `${protocol}:`
  } catch {
    return false
  }
}

function getSession(req) {
  const token = getCookie(req, ADMIN_COOKIE)
  if (!token) return null
  const session = sessions.get(token)
  if (!session || session.expiresAt <= Date.now()) {
    if (session) sessions.delete(token)
    return null
  }
  session.expiresAt = Date.now() + SESSION_TTL_MS
  return { token, ...session }
}

function requireAdmin(req, res) {
  const session = getSession(req)
  if (!session) {
    sendJson(res, 401, { success: false, authenticated: false, error: 'Authentication required' })
    return null
  }
  return session
}

function verifyCredentials(username, password) {
  const expectedUsername = text(process.env.ADMIN_USERNAME)
  const expectedPassword = process.env.ADMIN_PASSWORD || ''
  if (!expectedUsername || !expectedPassword) return false
  const usernameBuffer = Buffer.from(username)
  const expectedUsernameBuffer = Buffer.from(expectedUsername)
  const passwordBuffer = Buffer.from(password)
  const expectedPasswordBuffer = Buffer.from(expectedPassword)
  const usernameOk = usernameBuffer.length === expectedUsernameBuffer.length && crypto.timingSafeEqual(usernameBuffer, expectedUsernameBuffer)
  const passwordOk = passwordBuffer.length === expectedPasswordBuffer.length && crypto.timingSafeEqual(passwordBuffer, expectedPasswordBuffer)
  return usernameOk && passwordOk
}

async function readRequestJson(req) {
  let body = ''
  for await (const chunk of req) body += chunk
  if (Buffer.byteLength(body, 'utf8') > 64 * 1024) throw new Error('Payload too large')
  return JSON.parse(body || '{}')
}

async function handleAdminLogin(req, res) {
  if (!isSameOrigin(req)) {
    sendJson(res, 403, { success: false, error: 'Invalid request origin' })
    return
  }

  const ip = getClientIp(req)
  const now = Date.now()
  const current = loginAttempts.get(ip)
  if (current && current.resetAt > now && current.count >= MAX_LOGIN_ATTEMPTS) {
    sendJson(res, 429, { success: false, error: 'محاولات كثيرة. حاول مرة أخرى بعد قليل.' })
    return
  }

  if (!text(process.env.ADMIN_USERNAME) || !process.env.ADMIN_PASSWORD) {
    sendJson(res, 503, { success: false, error: 'لم يتم إعداد بيانات دخول لوحة التحكم في Render.' })
    return
  }

  try {
    const body = await readRequestJson(req)
    const username = text(body.username)
    const password = typeof body.password === 'string' ? body.password : ''

    if (!verifyCredentials(username, password)) {
      const next = current && current.resetAt > now ? current : { count: 0, resetAt: now + LOGIN_WINDOW_MS }
      next.count += 1
      loginAttempts.set(ip, next)
      sendJson(res, 401, { success: false, authenticated: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' })
      return
    }

    loginAttempts.delete(ip)
    const token = crypto.randomBytes(32).toString('hex')
    sessions.set(token, {
      username,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    })
    setSessionCookie(req, res, token)
    sendJson(res, 200, { success: true, authenticated: true, username })
  } catch {
    sendJson(res, 400, { success: false, authenticated: false, error: 'بيانات تسجيل الدخول غير صالحة' })
  }
}

function handleAdminSession(req, res) {
  const session = getSession(req)
  if (!session) {
    sendJson(res, 200, { success: true, authenticated: false })
    return
  }
  sendJson(res, 200, { success: true, authenticated: true, username: session.username, expiresAt: new Date(session.expiresAt).toISOString() })
}

function handleAdminLogout(req, res) {
  if (!isSameOrigin(req)) {
    sendJson(res, 403, { success: false, error: 'Invalid request origin' })
    return
  }
  const token = getCookie(req, ADMIN_COOKIE)
  if (token) sessions.delete(token)
  clearSessionCookie(req, res)
  sendJson(res, 200, { success: true, authenticated: false })
}

async function ensureDataDirectory() {
  await mkdir(dataDir, { recursive: true })
}

async function getSettings() {
  try {
    const data = await readFile(settingsFile, 'utf8')
    const parsed = JSON.parse(data)
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      site: { ...DEFAULT_SETTINGS.site, ...(parsed?.site || {}) },
      social: { ...DEFAULT_SETTINGS.social, ...(parsed?.social || {}) },
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

async function saveSettings(settings) {
  await ensureDataDirectory()
  await writeFile(settingsFile, JSON.stringify(settings, null, 2), 'utf8')
  return settings
}

async function updateSettings(req, res) {
  if (!isSameOrigin(req) || !requireAdmin(req, res)) return
  try {
    const payload = await readRequestJson(req)
    const current = await getSettings()
    const settings = {
      ...current,
      ...payload,
      site: { ...current.site, ...(payload?.site || {}) },
      social: { ...current.social, ...(payload?.social || {}) },
    }
    await saveSettings(settings)
    sendJson(res, 200, { success: true, settings })
  } catch (error) {
    console.error('Failed to save settings:', error)
    sendJson(res, 400, { success: false, error: 'Invalid settings data' })
  }
}

async function getFeaturedPosts() {
  try {
    const data = await readFile(featuredFile, 'utf8')
    return JSON.parse(data).posts || []
  } catch {
    return []
  }
}

async function saveFeaturedPosts(posts) {
  await ensureDataDirectory()
  await writeFile(featuredFile, JSON.stringify({ posts }, null, 2), 'utf8')
}

const DEFAULT_ANALYTICS = { days: {} }

function analyticsDayKey(value = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Algiers' }).format(new Date(value))
}

async function getAnalytics() {
  try {
    const data = await readFile(analyticsFile, 'utf8')
    const parsed = JSON.parse(data)
    return parsed && typeof parsed === 'object' && parsed.days ? parsed : DEFAULT_ANALYTICS
  } catch {
    return DEFAULT_ANALYTICS
  }
}

async function saveAnalytics(data) {
  await ensureDataDirectory()
  await writeFile(analyticsFile, JSON.stringify(data, null, 2), 'utf8')
}

function getVisitorId(req) {
  const existing = getCookie(req, VISITOR_COOKIE)
  return existing || crypto.randomBytes(18).toString('hex')
}

function setVisitorCookie(req, res, visitorId) {
  if (getCookie(req, VISITOR_COOKIE)) return
  const secure = isHttps(req) ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${VISITOR_COOKIE}=${encodeURIComponent(visitorId)}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}${secure}`)
}

async function trackAnalyticsEvent(req, res) {
  if (!isSameOrigin(req)) {
    sendJson(res, 403, { success: false, error: 'Invalid request origin' })
    return
  }
  try {
    const body = await readRequestJson(req)
    const event = text(body.event).slice(0, 80)
    if (!event) { sendJson(res, 400, { success: false, error: 'Event is required' }); return }
    const visitorId = getVisitorId(req)
    const dayKey = analyticsDayKey()
    const analytics = await getAnalytics()
    const day = analytics.days[dayKey] || { visits: 0, visitors: [], events: {} }
    if (event === 'page_view') {
      day.visits += 1
      if (!day.visitors.includes(visitorId)) day.visitors.push(visitorId)
    } else {
      day.events[event] = (day.events[event] || 0) + 1
    }
    analytics.days[dayKey] = day
    const keys = Object.keys(analytics.days).sort()
    for (const key of keys.slice(0, -120)) delete analytics.days[key]
    await saveAnalytics(analytics)
    setVisitorCookie(req, res, visitorId)
    sendJson(res, 200, { success: true })
  } catch {
    sendJson(res, 400, { success: false, error: 'Invalid analytics event' })
  }
}

function aggregateAnalytics(analytics, daysBack = 30) {
  const today = new Date()
  const result = []
  const totals = { visits: 0, visitors: 0, events: {} }
  for (let offset = daysBack - 1; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const key = analyticsDayKey(date)
    const day = analytics.days[key] || { visits: 0, visitors: [], events: {} }
    const visitors = Array.isArray(day.visitors) ? day.visitors.length : 0
    result.push({ date: key, visits: Number(day.visits || 0), visitors, events: day.events || {} })
    totals.visits += Number(day.visits || 0)
    totals.visitors += visitors
    for (const [event, count] of Object.entries(day.events || {})) totals.events[event] = (totals.events[event] || 0) + Number(count || 0)
  }
  return { days: result, totals }
}

async function handleAnalytics(req, res) {
  if (!requireAdmin(req, res)) return
  const analytics = await getAnalytics()
  sendJson(res, 200, { success: true, ...aggregateAnalytics(analytics, 30) })
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
}

function getContentType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
}

async function fileExists(filePath) {
  try { await access(filePath); return true } catch { return false }
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

function sendText(res, statusCode, textValue) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end(textValue)
}

async function serveStatic(res, requestPath) {
  let filePath = path.join(distDir, requestPath)
  if (requestPath === '/') {
    filePath = path.join(distDir, 'index.html')
  } else if (await fileExists(filePath)) {
    const fileStats = await stat(filePath)
    if (fileStats.isDirectory()) filePath = path.join(filePath, 'index.html')
  } else if (!path.extname(filePath)) {
    filePath = path.join(distDir, 'index.html')
  } else {
    sendText(res, 404, 'Not found')
    return
  }
  if (!(await fileExists(filePath))) filePath = path.join(distDir, 'index.html')
  res.writeHead(200, { 'Content-Type': getContentType(filePath), 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN' })
  createReadStream(filePath).pipe(res)
}

async function handleFeaturedPosts(req, res) {
  const posts = await getFeaturedPosts()
  sendJson(res, 200, { success: true, posts })
}

async function addFeaturedPost(req, res) {
  if (!isSameOrigin(req) || !requireAdmin(req, res)) return
  try {
    const post = await readRequestJson(req)
    if (!post || !post.id) throw new Error('Invalid post')
    const posts = await getFeaturedPosts()
    if (!posts.some((item) => item.id === post.id)) posts.unshift(post)
    const updatedPosts = posts.slice(0, 3)
    await saveFeaturedPosts(updatedPosts)
    sendJson(res, 200, { success: true, posts: updatedPosts })
  } catch {
    sendJson(res, 400, { success: false, error: 'Invalid data' })
  }
}

async function removeFeaturedPost(req, res, url) {
  if (!isSameOrigin(req) || !requireAdmin(req, res)) return
  const postId = url.searchParams.get('id')
  if (!postId) { sendJson(res, 400, { success: false, error: 'Post id is required' }); return }
  const posts = await getFeaturedPosts()
  const updatedPosts = posts.filter((post) => post.id !== postId)
  await saveFeaturedPosts(updatedPosts)
  sendJson(res, 200, { success: true, posts: updatedPosts })
}

async function handleFacebookStatus(req, res) {
  if (!requireAdmin(req, res)) return
  try {
    const data = await loadFacebookData()
    sendJson(res, 200, { success: true, connected: Boolean(data.connected && data.pageAccessToken), pageId: data.pageId || '', pageName: data.pageName || '', connectedAt: data.connectedAt || '', expiresAt: data.expiresAt || '' })
  } catch (error) {
    sendJson(res, 500, { success: false, connected: false, pageId: '', pageName: '', connectedAt: '', expiresAt: '', error: String(error) })
  }
}

async function handleFacebookPosts(req, res, url) {
  const limitParam = url.searchParams.get('limit')
  const limit = limitParam ? Number.parseInt(limitParam, 10) : 4
  try {
    const posts = await fetchFacebookPosts({ limit })
    sendJson(res, 200, { source: 'facebook', count: posts.length, posts, fetchedAt: new Date().toISOString() })
  } catch (error) {
    const status = typeof error?.status === 'number' ? error.status : 503
    sendJson(res, status, { success: false, source: 'facebook', posts: [], error: error?.message || 'Unable to fetch Facebook posts.' })
  }
}

async function handleFacebookReel(req, res, url) {
  const value = url.searchParams.get('id') || url.searchParams.get('url') || ''
  try {
    const post = await fetchFacebookPostById(value)
    sendJson(res, 200, { success: true, source: 'facebook', post })
  } catch (error) {
    const status = typeof error?.status === 'number' ? error.status : 503
    sendJson(res, status, { success: false, source: 'facebook', post: null, error: error?.message || 'Unable to fetch Facebook Reel.' })
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    const method = (req.method || 'GET').toUpperCase()

    if (method === 'POST' && url.pathname === '/api/auth/login') { await handleAdminLogin(req, res); return }
    if (method === 'GET' && url.pathname === '/api/auth/session') { handleAdminSession(req, res); return }
    if (method === 'POST' && url.pathname === '/api/auth/logout') { handleAdminLogout(req, res); return }

    if (method === 'POST' && url.pathname === '/api/analytics/event') { await trackAnalyticsEvent(req, res); return }
    if (method === 'GET' && url.pathname === '/api/admin/analytics') { await handleAnalytics(req, res); return }

    if (method === 'GET' && url.pathname === '/api/settings') { sendJson(res, 200, await getSettings()); return }
    if (method === 'POST' && url.pathname === '/api/settings') { await updateSettings(req, res); return }

    if (method === 'GET' && url.pathname === '/auth/facebook') {
      if (!requireAdmin(req, res)) return
      await facebookLogin(req, res)
      return
    }
    if (method === 'GET' && url.pathname === '/auth/facebook/callback') {
      req.url = url
      await facebookCallback(req, res)
      return
    }

    if (method === 'GET' && url.pathname === '/api/admin/featured-posts') { await handleFeaturedPosts(req, res); return }
    if (method === 'POST' && url.pathname === '/api/admin/featured-posts') { await addFeaturedPost(req, res); return }
    if (method === 'DELETE' && url.pathname === '/api/admin/featured-posts') { await removeFeaturedPost(req, res, url); return }

    if (method === 'GET' && url.pathname === '/api/facebook/status') { await handleFacebookStatus(req, res); return }
    if (method === 'GET' && url.pathname === '/api/facebook/reel') { await handleFacebookReel(req, res, url); return }
    if (method === 'GET' && url.pathname === '/api/facebook/posts') { await handleFacebookPosts(req, res, url); return }

    if (method === 'GET') { await serveStatic(res, url.pathname); return }
    sendText(res, 405, 'Method Not Allowed')
  } catch (error) {
    console.error('Server request error:', error)
    if (!res.headersSent) sendJson(res, 500, { success: false, error: 'Internal server error' })
  }
})

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
