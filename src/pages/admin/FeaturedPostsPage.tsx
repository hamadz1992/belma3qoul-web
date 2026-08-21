import { useEffect, useState } from 'react'
import { getFacebookPostById, getFacebookPosts, type FacebookPost } from '../../api/facebook'

export default function FeaturedPostsPage() {
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<FacebookPost[]>([])
  const [reelUrl, setReelUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [reelLoading, setReelLoading] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')

  const loadFeaturedPosts = async () => {
    try {
      setFeaturedLoading(true)
      const response = await fetch('/api/admin/featured-posts', { cache: 'no-store' })
      if (!response.ok) throw new Error('تعذر تحميل المنشورات المميزة')
      const data = await response.json()
      setFeaturedPosts(data.posts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تحميل المنشورات المميزة')
    } finally {
      setFeaturedLoading(false)
    }
  }

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getFacebookPosts(20)
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تحميل منشورات Facebook')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPosts()
    void loadFeaturedPosts()
  }, [])

  const isFeatured = (postId: string) => featuredPosts.some((post) => post.id === postId)

  const addFeaturedPost = async (post: FacebookPost) => {
    try {
      setBusyId(post.id)
      setError('')
      const response = await fetch('/api/admin/featured-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'فشل تثبيت المنشور')
      setFeaturedPosts(result.posts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تثبيت المنشور')
    } finally {
      setBusyId('')
    }
  }

  const importReel = async () => {
    if (!reelUrl.trim()) {
      setError('أدخل رابط Facebook Reel أولًا')
      return
    }

    try {
      setReelLoading(true)
      setError('')
      const post = await getFacebookPostById(reelUrl.trim())
      setPosts((current) => [post, ...current.filter((item) => item.id !== post.id)])
      setReelUrl('')

      if (featuredPosts.length < 3 && !isFeatured(post.id)) {
        await addFeaturedPost(post)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر جلب الـReel من Facebook')
    } finally {
      setReelLoading(false)
    }
  }

  const removeFeaturedPost = async (postId: string) => {
    try {
      setBusyId(postId)
      setError('')
      const response = await fetch(`/api/admin/featured-posts?id=${encodeURIComponent(postId)}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'فشل إلغاء تثبيت المنشور')
      setFeaturedPosts(result.posts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إلغاء تثبيت المنشور')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">⭐ إدارة المنشورات المميزة</h1>
            <p className="mt-2 text-sm text-slate-500">اختر منشورات Facebook التي تريد إبرازها في الموقع.</p>
          </div>
          <button type="button" onClick={() => { void loadPosts(); void loadFeaturedPosts() }} disabled={loading || featuredLoading || reelLoading} className="rounded-xl border bg-white px-5 py-3 text-sm font-medium shadow-sm hover:bg-slate-50 disabled:opacity-50">
            {loading || featuredLoading ? 'جاري التحديث...' : 'تحديث'}
          </button>
        </div>

        <section className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="mb-3">
            <h2 className="text-xl font-bold">🎬 جلب Reel مباشرة</h2>
            <p className="mt-1 text-sm text-slate-600">إذا كان الـReel غير موجود ضمن آخر 20 منشورًا، ألصق رابطه هنا لجلبه مباشرة من Facebook.</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={reelUrl}
              onChange={(event) => setReelUrl(event.target.value)}
              placeholder="https://www.facebook.com/reel/843068614725320"
              dir="ltr"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => void importReel()}
              disabled={reelLoading || featuredPosts.length >= 3}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {reelLoading ? 'جاري الجلب...' : 'جلب وتثبيت الـReel'}
            </button>
          </div>
          {featuredPosts.length >= 3 && <p className="mt-2 text-xs text-amber-700">لديك 3 منشورات مثبتة. ألغِ تثبيت أحدها أولًا لإضافة الـReel.</p>}
        </section>

        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">📌 المنشورات المثبتة</h2>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700">{featuredPosts.length} / 3</span>
          </div>

          {featuredLoading ? (
            <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow">جارٍ تحميل المنشورات المثبتة...</div>
          ) : featuredPosts.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow">لا توجد منشورات مثبتة حاليًا.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredPosts.map((post, index) => (
                <article key={post.id} className="overflow-hidden rounded-3xl bg-white shadow">
                  {post.videoUrl ? (
                    <video src={post.videoUrl} poster={post.imageUrl || undefined} controls playsInline className="h-56 w-full bg-black object-cover" />
                  ) : post.imageUrl ? (
                    <img src={post.imageUrl} className="h-56 w-full object-cover" alt="" />
                  ) : null}
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-rose-600">#{index + 1} منشور مميز</div>
                      {post.videoUrl ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">🎬 فيديو</span> : null}
                    </div>
                    <p className="line-clamp-4 text-sm">{post.message}</p>
                    <button type="button" onClick={() => void removeFeaturedPost(post.id)} disabled={busyId === post.id} className="mt-5 w-full rounded-xl border border-red-200 py-3 text-red-600 transition hover:bg-red-50 disabled:opacity-50">
                      {busyId === post.id ? 'جاري الإزالة...' : 'إلغاء التثبيت'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">📱 منشورات Facebook</h2>
              <p className="mt-1 text-sm text-slate-500">يتم عرض آخر 20 منشورًا متاحًا للاختيار منها.</p>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">{posts.length} منشور</span>
          </div>

          {loading ? (
            <p>جارٍ تحميل المنشورات...</p>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow">لا توجد منشورات متاحة حاليًا.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-3xl bg-white shadow">
                  {post.videoUrl ? (
                    <video src={post.videoUrl} poster={post.imageUrl || undefined} controls playsInline className="h-56 w-full bg-black object-cover" />
                  ) : post.imageUrl ? (
                    <img src={post.imageUrl} className="h-56 w-full object-cover" alt="" />
                  ) : null}
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="line-clamp-4 text-sm">{post.message}</p>
                      {post.videoUrl ? <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs">🎬</span> : null}
                    </div>
                    <button type="button" onClick={() => void addFeaturedPost(post)} disabled={busyId === post.id || isFeatured(post.id) || featuredPosts.length >= 3} className="mt-5 w-full rounded-xl bg-rose-600 py-3 text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                      {busyId === post.id ? 'جاري التثبيت...' : isFeatured(post.id) ? '📌 مثبت بالفعل' : featuredPosts.length >= 3 ? 'تم الوصول إلى الحد الأقصى' : '📌 تثبيت المنشور'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
