import { useEffect, useState } from 'react'

type FacebookStatus = {
  connected: boolean
  pageId: string
  pageName: string
  connectedAt: string
  expiresAt: string
}

const defaultStatus: FacebookStatus = {
  connected: false,
  pageId: '',
  pageName: '',
  connectedAt: '',
  expiresAt: '',
}

function formatDate(value: string) {
  if (!value) return '—'

  try {
    return new Intl.DateTimeFormat('ar-DZ', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export default function FacebookPage() {
  const [status, setStatus] = useState<FacebookStatus>(defaultStatus)
  const [testing, setTesting] = useState(false)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [message, setMessage] = useState('')

  async function loadStatus() {
    try {
      const response = await fetch('/api/facebook/status', { cache: 'no-store' })
      if (!response.ok) throw new Error('تعذر تحميل حالة Facebook')
      setStatus(await response.json())
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const result = params.get('facebook')

    if (result === 'connected') {
      setMessage('✅ تم ربط Facebook بنجاح')
      window.history.replaceState({}, '', window.location.pathname)
    } else if (result === 'error') {
      setMessage(`❌ ${params.get('message') || 'فشل ربط Facebook'}`)
      window.history.replaceState({}, '', window.location.pathname)
    }

    loadStatus()
  }, [])

  async function testConnection() {
    setTesting(true)
    setMessage('')

    try {
      const response = await fetch('/api/facebook/test', { cache: 'no-store' })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'فشل اختبار الاتصال')
      }

      setMessage(`✅ الاتصال يعمل — ${data.pageName || status.pageName}`)
      await loadStatus()
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : 'فشل اختبار الاتصال'}`)
    } finally {
      setTesting(false)
    }
  }

  async function fetchPosts() {
    setLoadingPosts(true)
    setMessage('')

    try {
      const response = await fetch('/api/facebook/posts?limit=4', { cache: 'no-store' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'تعذر جلب المنشورات')
      }

      setMessage(`✅ تم جلب ${data.count || data.posts?.length || 0} منشورات بنجاح`)
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : 'تعذر جلب المنشورات'}`)
    } finally {
      setLoadingPosts(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold">📘 Facebook</h1>

        <div className="rounded-3xl bg-white p-8 shadow">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="font-semibold">الحالة</span>
              <span
                className={`rounded-full px-4 py-1 ${
                  status.connected
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {status.connected ? 'متصل' : 'غير متصل'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b py-4">
              <span className="font-semibold">الصفحة</span>
              <span className="text-slate-500">{status.pageName || '—'}</span>
            </div>

            <div className="flex items-center justify-between border-b py-4">
              <span className="font-semibold">آخر مزامنة</span>
              <span className="text-slate-500">{formatDate(status.connectedAt)}</span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="font-semibold">انتهاء الصلاحية</span>
              <span className="text-slate-500">{formatDate(status.expiresAt)}</span>
            </div>
          </div>

          {message ? (
            <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => {
                window.location.href = '/auth/facebook'
              }}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              🔗 {status.connected ? 'إعادة ربط Facebook' : 'ربط Facebook'}
            </button>

            <button
              type="button"
              onClick={testConnection}
              disabled={testing || !status.connected}
              className="rounded-xl bg-slate-800 px-6 py-3 font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testing ? '⏳ جارٍ الاختبار...' : '🔄 اختبار الاتصال'}
            </button>

            <button
              type="button"
              onClick={fetchPosts}
              disabled={loadingPosts || !status.connected}
              className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingPosts ? '⏳ جارٍ الجلب...' : '📥 جلب المنشورات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
