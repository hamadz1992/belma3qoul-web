import { useEffect, useState } from 'react'
import { siteConfig } from '../../constants/site'
import BrandMark from './BrandMark'

type HeaderProps = { onMenuClick: () => void }
type SocialSettings = { facebook: string; instagram: string; tiktok: string; telegram: string; youtube: string; whatsapp: string; messenger: string }

const socialPlatforms = [
  { key: 'facebook', label: 'Facebook', hint: 'صفحتنا', color: 'bg-[#1877F2]' },
  { key: 'instagram', label: 'Instagram', hint: 'صورنا', color: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]' },
  { key: 'tiktok', label: 'TikTok', hint: 'فيديوهاتنا', color: 'bg-slate-950' },
  { key: 'telegram', label: 'Telegram', hint: 'تواصل معنا', color: 'bg-[#229ED9]' },
  { key: 'youtube', label: 'YouTube', hint: 'قناتنا', color: 'bg-[#FF0000]' },
  { key: 'whatsapp', label: 'WhatsApp', hint: 'تواصل معنا', color: 'bg-[#25D366]' },
  { key: 'messenger', label: 'Messenger', hint: 'رسالة مباشرة', color: 'bg-[#006AFF]' },
] as const

function getPlatformInitial(label: string) { return (label.trim()[0] || '•').toUpperCase() }
function normalizeSocialUrl(key: string, value: string) { if (value) return value; if (key === 'whatsapp') return `https://wa.me/${siteConfig.whatsapp.replace(/\D/g, '')}`; if (key === 'messenger') return siteConfig.messengerUrl; return '' }
function track(event: string) { void fetch('/api/analytics/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event }), keepalive: true }).catch(() => undefined) }

function Header({ onMenuClick }: HeaderProps) {
  const [social, setSocial] = useState<SocialSettings>({ facebook: '', instagram: '', tiktok: '', telegram: '', youtube: '', whatsapp: '', messenger: '' })

  useEffect(() => {
    let mounted = true
    fetch('/api/settings', { cache: 'no-store' }).then((response) => response.json()).then((data) => { if (mounted && data?.social) setSocial((current) => ({ ...current, ...data.social })) }).catch((error) => console.error('Failed to load social links:', error))
    return () => { mounted = false }
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#home" aria-label="Belma3qoul" className="shrink-0"><BrandMark compact /></a>
        <div className="ml-auto flex items-center gap-2 overflow-x-auto py-1" dir="rtl">
          {socialPlatforms.map((link) => {
            const href = normalizeSocialUrl(link.key, social[link.key])
            if (!href) return null
            return <a key={link.key} href={href} target="_blank" rel="noreferrer" title={link.label} onClick={() => track(`${link.key}_click`)} className="group flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${link.color} text-xs font-black text-white shadow-sm ring-2 ring-white`}>{getPlatformInitial(link.label)}</span>
              <span className="hidden text-right sm:block"><span className="block text-[11px] font-bold leading-4 text-slate-900">{link.label}</span><span className="block text-[9px] leading-3 text-slate-400">{link.hint}</span></span>
            </a>
          })}
        </div>
        <button type="button" onClick={onMenuClick} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 xl:hidden" aria-label="فتح القائمة"><span className="space-y-1.5"><span className="block h-0.5 w-5 rounded-full bg-current" /><span className="block h-0.5 w-5 rounded-full bg-current" /><span className="block h-0.5 w-5 rounded-full bg-current" /></span></button>
      </div>
    </header>
  )
}

export default Header
