import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_FILE = path.join(__dirname, 'facebook-data.json')

const DEFAULT_DATA = {
  connected: false,
  pageId: '',
  pageName: '',
  pageAccessToken: '',
  userAccessToken: '',
  connectedAt: '',
  expiresAt: '',
}

let pool = null
let initialized = false

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    })
  }

  return pool
}

async function ensureDatabase() {
  const database = getPool()

  if (!database) {
    return null
  }

  if (!initialized) {
    await database.query(`
      CREATE TABLE IF NOT EXISTS facebook_connection (
        id INTEGER PRIMARY KEY,
        connected BOOLEAN NOT NULL DEFAULT FALSE,
        page_id TEXT NOT NULL DEFAULT '',
        page_name TEXT NOT NULL DEFAULT '',
        page_access_token TEXT NOT NULL DEFAULT '',
        user_access_token TEXT NOT NULL DEFAULT '',
        connected_at TEXT NOT NULL DEFAULT '',
        expires_at TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    initialized = true
  }

  return database
}

async function loadFromFile() {
  try {
    const content = await readFile(DATA_FILE, 'utf8')

    return {
      ...DEFAULT_DATA,
      ...JSON.parse(content),
    }
  } catch {
    return { ...DEFAULT_DATA }
  }
}

async function loadFromDatabase() {
  const database = await ensureDatabase()

  if (!database) {
    return loadFromFile()
  }

  const result = await database.query(`
    SELECT
      connected,
      page_id AS "pageId",
      page_name AS "pageName",
      page_access_token AS "pageAccessToken",
      user_access_token AS "userAccessToken",
      connected_at AS "connectedAt",
      expires_at AS "expiresAt"
    FROM facebook_connection
    WHERE id = 1
    LIMIT 1
  `)

  if (result.rows.length === 0) {
    return { ...DEFAULT_DATA }
  }

  return {
    ...DEFAULT_DATA,
    ...result.rows[0],
  }
}

export async function loadFacebookData() {
  return loadFromDatabase()
}

async function saveToFile(data) {
  await writeFile(
    DATA_FILE,
    JSON.stringify(data, null, 2),
    'utf8'
  )
}

async function saveToDatabase(data) {
  const database = await ensureDatabase()

  if (!database) {
    await saveToFile(data)
    return
  }

  await database.query(
    `
      INSERT INTO facebook_connection (
        id,
        connected,
        page_id,
        page_name,
        page_access_token,
        user_access_token,
        connected_at,
        expires_at,
        updated_at
      )
      VALUES (1, $1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        connected = EXCLUDED.connected,
        page_id = EXCLUDED.page_id,
        page_name = EXCLUDED.page_name,
        page_access_token = EXCLUDED.page_access_token,
        user_access_token = EXCLUDED.user_access_token,
        connected_at = EXCLUDED.connected_at,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
    `,
    [
      Boolean(data.connected),
      data.pageId || '',
      data.pageName || '',
      data.pageAccessToken || '',
      data.userAccessToken || '',
      data.connectedAt || '',
      data.expiresAt || '',
    ]
  )
}

export async function saveFacebookData(data) {
  const current = await loadFacebookData()

  const updated = {
    ...current,
    ...data,
  }

  await saveToDatabase(updated)

  console.log(
    process.env.DATABASE_URL
      ? 'Facebook data saved to PostgreSQL.'
      : 'Facebook data saved to local storage.'
  )

  return updated
}