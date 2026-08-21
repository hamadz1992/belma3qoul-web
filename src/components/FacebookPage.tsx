import { useEffect, useState } from 'react'

interface FacebookStatus {
  success: boolean
  connected: boolean
  pageId: string
  pageName: string
  connectedAt: string
  expiresAt: string
  error?: string
}

interface FacebookPost {
  id: string
  message?: string
  createdTime?: string
  permalinkUrl?: string
  imageUrl?: string
}

interface FacebookPostsResponse {
  success?: boolean
  source: string
  count: number
  posts: FacebookPost[]
  fetchedAt: string
  error?: string
}

export default function FacebookPage() {
  const [status, setStatus] = useState<FacebookStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [error, setError] = useState('')

  const loadStatus = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/facebook/status', {
        cache: 'no-store',
      })
      const data = (await response.json()) as FacebookStatus

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'تعذر تحميل حالة Facebook')
      }

      setStatus(data)
    } catch (err) {
      setStatus(null)
      setError(err instanceof Error ? err.message : 'تعذر تحميل حالة Facebook')
    } finally {
      setLoading(false)
    }
  }

  const loadPosts = async () => {
    try {
      setPostsLoading(true)
      setError('')

      const response = await fetch('/api/facebook/posts?limit=4', {
        cache: 'no-store',
      })
      const data = (await response.json()) as FacebookPostsResponse

      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'تعذر تحميل المنشورات')
      }

      setPosts(data.posts || [])
    } catch (err) {
      setPosts([])
      setError(err instanceof Error ? err.message : 'تعذر تحميل المنشورات')
    } finally {
      setPostsLoading(false)
    }
  }

  useEffect(() => {
    void loadStatus()
    void loadPosts()
  }, [])

  const testConnection = async () => {
    try {
      setTesting(true)
      await loadStatus()
    } finally {
      setTesting(false)
    }
  }

  const formatDate = (value: string) => {
    if (!value) return '—'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return new Intl.DateTimeFormat('ar-DZ', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  const connected = Boolean(status?.connected)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Facebook</h1>
        <p className="mt-1 text-sm text-gray-500">
          إدارة اتصال صفحة Facebook وجلب منشوراتها.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">حالة الاتصال</h2>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  connected ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <span className="text-sm">
                {loading ? 'جاري التحقق...' : connected ? 'متصل' : 'غير متصل'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                window.location.href = '/auth/facebook'
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {connected ? 'إعادة ربط Facebook' : 'ربط Facebook'}
            </button>

            <button
              type="button"
              onClick={() => void testConnection()}
              disabled={testing || loading}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testing ? 'جاري الاختبار...' : 'اختبار الاتصال'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="text-xs text-gray-500">الصفحة</div>
            <div className="mt-1 font-medium">
              {loading ? 'جاري التحميل...' : status?.pageName || '—'}
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <div className="text-xs text-gray-500">معرف الصفحة</div>
            <div className="mt-1 font-medium">
              {loading ? 'جاري التحميل...' : status?.pageId || '—'}
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <div className="text-xs text-gray-500">آخر مزامنة / اتصال</div>
            <div className="mt-1 font-medium">
              {loading ? 'جاري التحميل...' : formatDate(status?.connectedAt || '')}
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <div className="text-xs text-gray-500">انتهاء الصلاحية</div>
            <div className="mt-1 font-medium">
              {loading
                ? 'جاري التحميل...'
                : status?.expiresAt
                  ? formatDate(status.expiresAt)
                  : 'غير محدد'}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">آخر المنشورات</h2>
            <p className="mt-1 text-sm text-gray-500">
              آخر المنشورات التي تم جلبها من صفحة Facebook.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadPosts()}
            disabled={postsLoading}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {postsLoading ? 'جاري التحميل...' : 'تحديث'}
          </button>
        </div>

        {postsLoading ? (
          <div className="mt-6 text-center text-sm text-gray-500">
            جاري تحميل المنشورات...
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
            لا توجد منشورات متاحة حاليًا.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-xl border">
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {post.message || 'منشور بدون نص'}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500">
                    <span>{formatDate(post.createdTime || '')}</span>
                    {post.permalinkUrl && (
                      <a
                        href={post.permalinkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        فتح المنشور
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
