import { useEffect, useState } from 'react'
import SectionHeading from '../../components/common/SectionHeading'
import AdBoard from '../../components/common/AdBoard'
import NewsTicker from '../../components/common/NewsTicker'
import FacebookLikePopup from '../../components/common/FacebookLikePopup'
import { siteConfig } from '../../constants/site'
import { getFacebookPosts, type FacebookPost } from '../../api/facebook'

type SiteSettings = { name: string; description: string; phone: string; whatsapp: string; address: string; hours: string; googleMaps: string }
function formatDate(value: string) { try { return new Intl.DateTimeFormat('ar-DZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) } catch { return value } }
function normalizeUrl(value: string, fallback: string) { if (!value) return fallback; const markdownMatch = value.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/); if (markdownMatch) return markdownMatch[2]; return value }
type FeaturedPost = { id: string; message?: string; createdTime?: string; permalinkUrl?: string; imageUrl?: string; videoUrl?: string }
function track(event: string) { void fetch('/api/analytics/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event }), keepalive: true }).catch(() => undefined) }

function HomePage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ name: siteConfig.name || '', description: siteConfig.description || '', phone: '', whatsapp: '', address: '', hours: '', googleMaps: siteConfig.mapsUrl || '' })
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFacebookPopup, setShowFacebookPopup] = useState(false)

  useEffect(() => { track('page_view') }, [])
  useEffect(() => {
    const storageKey = 'belma3qoul_facebook_popup_visits'
    let visits = Number.parseInt(localStorage.getItem(storageKey) || '0', 10)
    if (!Number.isFinite(visits) || visits < 0) visits = 0
    visits += 1
    localStorage.setItem(storageKey, String(visits))

    if (visits % 3 !== 0) return

    const timer = window.setTimeout(() => setShowFacebookPopup(true), 8000)
    return () => window.clearTimeout(timer)
  }, [])
  useEffect(() => { let isMounted = true; async function loadSettings() { try { const response = await fetch('/api/settings'); if (!response.ok) throw new Error('Failed to load site settings'); const data = await response.json(); if (isMounted && data?.site) setSiteSettings((current) => ({ ...current, ...data.site })) } catch (error) { console.error('Failed to load site settings:', error) } } void loadSettings(); return () => { isMounted = false } }, [])
  useEffect(() => { let isMounted = true; async function loadPosts() { try { const data = await getFacebookPosts(4); if (isMounted) { setPosts(data); setError(null) } } catch (err) { console.error(err); if (isMounted) setError('تعذر تحميل المنشورات الآن') } finally { if (isMounted) setLoading(false) } } void loadPosts(); return () => { isMounted = false } }, [])
  useEffect(() => { let isMounted = true; async function loadFeaturedPosts() { try { const response = await fetch('/api/admin/featured-posts', { cache: 'no-store' }); if (!response.ok) throw new Error('Failed to load featured posts'); const data = await response.json(); if (isMounted) setFeaturedPosts(Array.isArray(data?.posts) ? data.posts : []) } catch (error) { console.error('Failed to load featured posts:', error); if (isMounted) setFeaturedPosts([]) } finally { if (isMounted) setFeaturedLoading(false) } } void loadFeaturedPosts(); return () => { isMounted = false } }, [])
  const mapsUrl = normalizeUrl(siteSettings.googleMaps, siteConfig.mapsUrl)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f5f7fb] pb-3">
      <FacebookLikePopup open={showFacebookPopup} onClose={() => setShowFacebookPopup(false)} facebookUrl={siteConfig.facebookUrl} onOpenFacebook={() => track('facebook_follow_popup_click')} />
      <div className="relative z-10">
        <NewsTicker />
        <section id="featured" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-5">
            <article className="order-1 overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-100 bg-gradient-to-r from-rose-50 via-white to-amber-50 px-5 py-4 sm:px-6"><SectionHeading eyebrow="المنشورات المميزة" title="" description="" /></div>
              <div className="p-4 sm:p-5">
                {featuredLoading ? <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">جارٍ تحميل المنشورات المميزة...</div> : featuredPosts.length === 0 ? <div className="rounded-[1.2rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">لا توجد منشورات مميزة حاليًا.</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featuredPosts.map((post) => <article key={post.id} className="group overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-[0_10px_24px_rgba(244,63,94,0.1)]">
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    {post.videoUrl ? <video src={post.videoUrl} poster={post.imageUrl || undefined} controls playsInline preload="metadata" className="h-full w-full bg-black object-cover" /> : post.imageUrl ? <img src={post.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" loading="lazy" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-rose-100 via-white to-amber-100 text-3xl">🛍️</div>}
                    <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5"><span className="rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold text-rose-600 shadow-sm">Facebook</span><span className="rounded-full bg-rose-600 px-2.5 py-1 text-[9px] font-bold text-white shadow-sm">📌 مثبت</span></div>
                  </div>
                  <div className="p-3.5 text-right"><p className="text-[12px] font-medium leading-5 text-slate-700" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.message || 'منشور مميز من صفحتنا'}</p><div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5"><span className="text-[10px] text-slate-400">{formatDate(post.createdTime || '')}</span>{post.permalinkUrl ? <a href={post.permalinkUrl} target="_blank" rel="noreferrer" onClick={() => track('featured_click')} className="text-[11px] font-bold text-rose-600 transition hover:text-rose-700">عرض المنشور ↗</a> : null}</div></div>
                </article>)}</div>}
              </div>
            </article>

            <article className="order-2 overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-100 bg-gradient-to-r from-rose-50 via-white to-pink-50 px-5 py-4 sm:px-6"><SectionHeading eyebrow="جديدنا" title="" description="" /></div>
              <div className="p-4 sm:p-5">
                {loading ? <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">جارٍ تحميل المنشورات...</div> : error ? <div className="rounded-[1.2rem] border border-rose-200 bg-rose-50 p-5 text-center text-sm text-rose-700">{error}</div> : posts.length === 0 ? <div className="rounded-[1.2rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">لا توجد منشورات متاحة حاليًا.</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{posts.map((post) => <a key={post.id} href={post.permalinkUrl} target="_blank" rel="noreferrer" onClick={() => track('post_click')} className="group block overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-[0_8px_20px_rgba(244,63,94,0.1)]">
                  <div className="relative h-32 overflow-hidden bg-slate-100">
                    {post.videoUrl ? <video src={post.videoUrl} poster={post.imageUrl || undefined} muted playsInline preload="metadata" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" /> : post.imageUrl ? <img src={post.imageUrl} alt={post.message || 'منشور Facebook'} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" /> : <div className="h-full w-full bg-gradient-to-br from-rose-100 via-white to-fuchsia-100" />}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" /><div className="absolute right-2.5 top-2.5 flex items-center gap-1.5"><span className="rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold text-rose-600 shadow-sm">Facebook</span>{post.videoUrl ? <span className="rounded-full bg-black/60 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur">▶ فيديو</span> : null}</div><span className="absolute bottom-2.5 right-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-medium text-slate-700 shadow-sm backdrop-blur">{formatDate(post.createdTime)}</span>
                  </div>
                  <div className="p-3.5 text-right"><p className="text-[12px] font-medium leading-5 text-slate-700" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.message || 'منشور جديد من صفحتنا'}</p><div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5"><span className="text-[11px] font-semibold text-rose-600 transition group-hover:text-rose-700">عرض المنشور ↗</span><span className="text-[10px] text-slate-400">منشور جديد</span></div></div>
                </a>)}</div>}
              </div>
            </article>
          </div>
        </section>

        <section id="latest" className="bg-transparent py-8"><div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><div className="grid gap-5 xl:grid-cols-[1.15fr_1.25fr_1fr]"><AdBoard /><article id="location" className="rounded-[1.5rem] border border-white bg-white p-5 shadow-lg shadow-slate-300/20 sm:p-6"><SectionHeading eyebrow="موقعنا" title="" description="" /><div className="mt-5"><div className="overflow-hidden rounded-[1.3rem] border border-slate-200 bg-slate-50"><iframe title="خريطة الوصول إلى المحل" src={`https://www.google.com/maps?q=${encodeURIComponent(siteSettings.address)}&output=embed`} className="h-56 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><div className="p-3.5 text-right"><a href={mapsUrl} target="_blank" rel="noreferrer" onClick={() => track('location_click')} className="inline-flex rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700">فتح الاتجاهات</a></div></div></div></article><article className="rounded-[1.5rem] border border-white bg-white p-5 shadow-lg shadow-slate-300/20 sm:p-6"><SectionHeading eyebrow="نبذة عن المحل" title="" description="" /><div className="mt-5 text-right"><p className="whitespace-pre-line text-sm leading-7 text-slate-600">{siteSettings.description}</p></div></article></div></div></section>
      </div>
    </div>
  )
}

export default HomePage
