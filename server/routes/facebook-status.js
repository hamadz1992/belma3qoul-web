import { loadFacebookData } from '../facebook-storage.js'

function json(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(payload))
}

function graphVersion() {
  return (process.env.META_GRAPH_VERSION || 'v26.0').trim()
}

export async function facebookStatus(req, res) {
  const data = await loadFacebookData()
  const pageId = data.pageId || (process.env.FACEBOOK_PAGE_ID || '').trim()
  const pageAccessToken = data.pageAccessToken || (process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '').trim()

  json(res, 200, {
    connected: Boolean(pageId && pageAccessToken),
    pageId,
    pageName: data.pageName || '',
    connectedAt: data.connectedAt || '',
    expiresAt: data.expiresAt || '',
  })
}

export async function facebookTest(req, res) {
  const data = await loadFacebookData()
  const pageId = data.pageId || (process.env.FACEBOOK_PAGE_ID || '').trim()
  const pageAccessToken = data.pageAccessToken || (process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '').trim()

  if (!pageId || !pageAccessToken) {
    json(res, 400, { ok: false, error: 'Facebook غير متصل' })
    return
  }

  const url = new URL(`https://graph.facebook.com/${graphVersion()}/${pageId}`)
  url.searchParams.set('fields', 'id,name')
  url.searchParams.set('access_token', pageAccessToken)

  try {
    const response = await fetch(url)
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      json(res, response.status, {
        ok: false,
        error: payload?.error?.message || 'فشل اختبار الاتصال',
      })
      return
    }

    json(res, 200, {
      ok: true,
      pageId: payload.id || pageId,
      pageName: payload.name || data.pageName,
    })
  } catch (error) {
    json(res, 503, { ok: false, error: String(error) })
  }
}
