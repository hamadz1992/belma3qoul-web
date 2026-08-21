import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

type AdType = 'post' | 'image' | 'banner' | 'slider' | 'video'
type AdSettings = { enabled: boolean; type: AdType; title: string; text: string; imageUrl: string; videoUrl: string; linkUrl: string; slides: string[]; autoplayMs: number }
type Settings = Record<string, unknown> & { ads?: AdSettings }

const defaults: AdSettings = { enabled: true, type: 'banner', title: 'عروض خاصة لك', text: '', imageUrl: '', videoUrl: '', linkUrl: '', slides: [], autoplayMs: 4000 }

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('الملف المحدد ليس صورة.')); return }
    if (file.size > 4 * 1024 * 1024) { reject(new Error('حجم الصورة يجب أن يكون أقل من 4 MB.')); return }
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('تعذر قراءة الصورة.'))
    reader.readAsDataURL(file)
  })
}

export default function AdBoardPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [ads, setAds] = useState<AdSettings>(defaults)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { void load() }, [])

  async function load() {
    try {
      const response = await fetch('/api/settings', { cache: 'no-store' })
      const data = await response.json()
      setSettings(data || {})
      setAds({ ...defaults, ...(data?.ads || {}) })
    } catch (error) {
      console.error(error)
      setMessage('تعذر تحميل إعدادات الإعلان')
    }
  }

  async function save() {
    setSaving(true)
    setMessage('')
    try {
      const nextSettings = { ...settings, ads }
      const response = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nextSettings) })
      if (!response.ok) throw new Error('save failed')
      setSettings(nextSettings)
      setMessage('✅ تم حفظ لوحة الإعلانات')
    } catch (error) {
      console.error(error)
      setMessage('❌ تعذر حفظ لوحة الإعلانات')
    } finally { setSaving(false) }
  }

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const image = await readImage(file)
      setAds((current) => ({ ...current, imageUrl: image }))
      setMessage('✅ تمت إضافة الصورة، اضغط حفظ الإعلان.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذر إضافة الصورة.') }
  }

  async function handleSlides(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    try {
      const images = await Promise.all(files.map(readImage))
      setAds((current) => ({ ...current, slides: [...current.slides, ...images] }))
      setMessage(`✅ تمت إضافة ${images.length} صورة للبانر المتحرك، اضغط حفظ الإعلان.`)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذر إضافة الصور.') }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8" dir="rtl">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-3xl font-extrabold text-slate-950">📢 لوحة الإعلانات</h1><p className="mt-2 text-sm text-slate-500">تحكم في الإعلان الذي يظهر مكان روابط التواصل في الصفحة الرئيسية.</p></div>
          <button onClick={() => void save()} disabled={saving} className="rounded-xl bg-rose-600 px-6 py-3 font-bold text-white hover:bg-rose-700 disabled:opacity-50">{saving ? 'جاري الحفظ...' : '💾 حفظ الإعلان'}</button>
        </div>
        {message && <div className="mb-6 rounded-xl bg-white p-4 text-sm shadow">{message}</div>}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl bg-white p-6 shadow">
            <label className="mb-3 flex items-center justify-between font-bold"><span>تفعيل لوحة الإعلانات</span><input type="checkbox" checked={ads.enabled} onChange={(e) => setAds({ ...ads, enabled: e.target.checked })} className="h-5 w-5" /></label>
            <label className="mb-2 block font-semibold">نوع الإعلان</label>
            <select value={ads.type} onChange={(e) => setAds({ ...ads, type: e.target.value as AdType })} className="mb-5 w-full rounded-xl border p-3"><option value="post">📝 منشور إعلاني</option><option value="image">🖼️ صورة إعلان</option><option value="banner">🖥️ بانر ثابت</option><option value="slider">🎞️ بانر متحرك</option><option value="video">▶️ إعلان فيديو</option></select>
            {(ads.type === 'post' || ads.type === 'image' || ads.type === 'banner') && <>
              <label className="mb-2 block font-semibold">صورة الإعلان</label>
              <div className="mb-5 flex flex-wrap items-center gap-3"><label className="cursor-pointer rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">📁 اختيار صورة من الجهاز<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => void handleImage(e)} className="hidden" /></label>{ads.imageUrl && <button type="button" onClick={() => setAds({ ...ads, imageUrl: '' })} className="rounded-xl border border-red-200 px-4 py-3 text-red-600 hover:bg-red-50">حذف الصورة</button>}</div>
              {ads.imageUrl && <img src={ads.imageUrl} alt="الصورة الحالية" className="mb-5 h-48 w-full rounded-2xl object-cover" />}
            </>}
            {ads.type === 'slider' && <>
              <label className="mb-2 block font-semibold">صور البانر المتحرك</label>
              <label className="mb-4 inline-flex cursor-pointer rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">📁 اختيار عدة صور من الجهاز<input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(e) => void handleSlides(e)} className="hidden" /></label>
              {ads.slides.length > 0 && <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{ads.slides.map((url, index) => <div key={`${url.slice(0, 30)}-${index}`} className="relative overflow-hidden rounded-xl border bg-slate-50"><img src={url} alt={`الشريحة ${index + 1}`} className="h-28 w-full object-cover" /><button type="button" onClick={() => setAds((current) => ({ ...current, slides: current.slides.filter((_, i) => i !== index) }))} className="absolute right-1 top-1 rounded-lg bg-red-600 px-2 py-1 text-xs text-white">حذف</button></div>)}</div>}
              <label className="mb-2 block font-semibold">مدة الانتقال (مللي ثانية)</label><input type="number" min={1500} step={500} value={ads.autoplayMs} onChange={(e) => setAds({ ...ads, autoplayMs: Number(e.target.value) || 4000 })} className="mb-5 w-full rounded-xl border p-3" dir="ltr" />
            </>}
            {ads.type === 'video' && <><label className="mb-2 block font-semibold">رابط الفيديو</label><input value={ads.videoUrl} onChange={(e) => setAds({ ...ads, videoUrl: e.target.value })} className="mb-5 w-full rounded-xl border p-3" dir="ltr" placeholder="https://.../video.mp4" /></>}
            {(ads.type === 'post' || ads.type === 'image') && <><label className="mb-2 block font-semibold">العنوان</label><input value={ads.title} onChange={(e) => setAds({ ...ads, title: e.target.value })} className="mb-5 w-full rounded-xl border p-3" /><label className="mb-2 block font-semibold">نص الإعلان</label><textarea rows={4} value={ads.text} onChange={(e) => setAds({ ...ads, text: e.target.value })} className="mb-5 w-full rounded-xl border p-3" /></>}
            <label className="mb-2 block font-semibold">الرابط عند الضغط</label><input value={ads.linkUrl} onChange={(e) => setAds({ ...ads, linkUrl: e.target.value })} className="w-full rounded-xl border p-3" dir="ltr" placeholder="https://..." />
          </section>
          <section className="rounded-3xl bg-white p-5 shadow"><h2 className="mb-4 text-lg font-bold">معاينة</h2><div className="overflow-hidden rounded-2xl border bg-slate-50">{ads.type === 'video' && ads.videoUrl ? <video src={ads.videoUrl} controls className="h-64 w-full bg-black object-cover" /> : ads.type === 'slider' && ads.slides.length ? <img src={ads.slides[0]} alt="معاينة الإعلان" className="h-64 w-full object-cover" /> : ads.imageUrl ? <img src={ads.imageUrl} alt="معاينة الإعلان" className="h-64 w-full object-cover" /> : <div className="flex h-64 items-center justify-center p-6 text-center text-slate-400">اختر صورة من جهازك لرؤية المعاينة</div>}{(ads.type === 'post' || ads.type === 'image') && (ads.title || ads.text) && <div className="p-4 text-right"><h3 className="font-bold">{ads.title}</h3><p className="mt-2 text-sm text-slate-600">{ads.text}</p></div>}</div></section>
        </div>
      </div>
    </div>
  )
}