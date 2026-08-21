import { useEffect, useState } from 'react'

type TickerSettings = { enabled: boolean; title: string; items: string[]; speed: number; direction: 'rtl' | 'ltr'; background: string; textColor: string; titleColor: string }
const defaults: TickerSettings = { enabled: true, title: 'آخر الأخبار', items: ['جديدنا أولاً بأول', 'تابعوا أحدث منشورات المحل', 'كل شيء بالمعقول — عروض ومنتجات جديدة'], speed: 30, direction: 'rtl', background: '#fff1f2', textColor: '#334155', titleColor: '#e11d48' }

export default function NewsTicker() {
  const [settings, setSettings] = useState<TickerSettings>(defaults)
  useEffect(() => { let mounted = true; fetch('/api/settings', { cache: 'no-store' }).then((r) => r.json()).then((data) => { if (mounted && data?.newsTicker) setSettings({ ...defaults, ...data.newsTicker }) }).catch((error) => console.error('Failed to load news ticker:', error)); return () => { mounted = false } }, [])
  if (!settings.enabled || settings.items.length === 0) return null
  const items = [...settings.items, ...settings.items]
  return <div className="w-full overflow-hidden border-y border-rose-100" style={{ backgroundColor: settings.background, color: settings.textColor }} dir="rtl"><div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6 lg:px-8"><div className="shrink-0 rounded-full bg-white px-4 py-1 text-xs font-extrabold shadow-sm" style={{ color: settings.titleColor }}>{settings.title}</div><div className="min-w-0 flex-1 overflow-hidden"><div className="ticker-track flex w-max items-center gap-12 whitespace-nowrap" style={{ animationDuration: `${Math.max(8, settings.speed)}s`, animationDirection: settings.direction === 'rtl' ? 'normal' : 'reverse' }}>{items.map((item, index) => <span key={`${index}-${item}`} className="text-sm font-medium">{item}</span>)}</div></div></div><style>{`@keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(50%); } } .ticker-track { animation-name: ticker-scroll; animation-timing-function: linear; animation-iteration-count: infinite; }`}</style></div>
}
