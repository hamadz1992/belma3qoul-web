import { useEffect, useState } from 'react'

type AdType = 'post' | 'image' | 'banner' | 'slider' | 'video'
type AdSettings = {
  enabled?: boolean
  type?: AdType
  title?: string
  text?: string
  imageUrl?: string
  videoUrl?: string
  linkUrl?: string
  slides?: string[]
  autoplayMs?: number
}

const defaults: Required<AdSettings> = {
  enabled: true,
  type: 'banner',
  title: 'عروض خاصة لك',
  text: '',
  imageUrl: '',
  videoUrl: '',
  linkUrl: '',
  slides: [],
  autoplayMs: 4000,
}

export default function AdBoard() {
  const [ads, setAds] = useState<Required<AdSettings>>(defaults)
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    let mounted = true
    fetch('/api/settings', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (mounted) setAds({ ...defaults, ...(data?.ads || {}) })
      })
      .catch((error) => console.error('Failed to load ads:', error))
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (ads.type !== 'slider' || ads.slides.length < 2) return
    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % ads.slides.length)
    }, Math.max(1500, ads.autoplayMs))
    return () => window.clearInterval(timer)
  }, [ads.type, ads.slides.length, ads.autoplayMs])

  if (!ads.enabled) return null

  const content = ads.type === 'video' && ads.videoUrl ? (
    <video src={ads.videoUrl} controls playsInline muted className="h-full w-full bg-black object-cover" />
  ) : ads.type === 'slider' && ads.slides.length ? (
    <img src={ads.slides[slideIndex % ads.slides.length]} alt={ads.title || 'إعلان'} className="h-full w-full object-cover transition-opacity duration-500" />
  ) : ads.imageUrl ? (
    <img src={ads.imageUrl} alt={ads.title || 'إعلان'} className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full min-h-[250px] items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-100 p-6 text-center">
      <div><div className="text-sm font-semibold text-rose-500">📢 لوحة إعلانية</div><h3 className="mt-2 text-2xl font-extrabold text-slate-950">{ads.title || 'إعلانك هنا'}</h3>{ads.text && <p className="mt-2 text-sm leading-6 text-slate-600">{ads.text}</p>}</div>
    </div>
  )

  const board = (
    <div className="overflow-hidden rounded-[1.6rem] border border-rose-100 bg-white shadow-sm">
      <div className="relative h-[330px] bg-slate-50 sm:h-[360px]">
        {content}
        {ads.type !== 'video' && ads.type !== 'slider' && (ads.title || ads.text) && ads.imageUrl && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-12 text-right text-white">
            {ads.title && <h3 className="text-lg font-extrabold">{ads.title}</h3>}
            {ads.text && <p className="mt-1 text-sm leading-6 text-white/90">{ads.text}</p>}
          </div>
        )}
        {ads.type === 'slider' && ads.slides.length > 1 && <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 px-2 py-1">{ads.slides.map((_, index) => <span key={index} className={`h-1.5 w-1.5 rounded-full ${index === slideIndex ? 'bg-white' : 'bg-white/40'}`} />)}</div>}
      </div>
    </div>
  )

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {ads.linkUrl ? <a href={ads.linkUrl} target="_blank" rel="noreferrer" className="block">{board}</a> : board}
      {ads.type === 'post' && !ads.imageUrl && ads.text && <p className="px-2 pt-3 text-right text-sm leading-6 text-slate-600">{ads.text}</p>}
    </article>
  )
}
