import { navLinks, siteConfig } from '../../constants/site'
import BrandMark from './BrandMark'
import { useEffect, useState } from 'react'

type SocialSettings = {
  facebook: string
  instagram: string
  tiktok: string
  telegram: string
  youtube: string
}

type MobileMenuProps = {
  open: boolean
  onClose: () => void
}

function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [social, setSocial] = useState<SocialSettings>({
    facebook: '',
    instagram: '',
    tiktok: '',
    telegram: '',
    youtube: '',
  })

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (data?.social) setSocial((current) => ({ ...current, ...data.social }))
      })
      .catch((error) => console.error('Failed to load social links:', error))
  }, [])

  const socialLinks = [
    ['facebook', 'Facebook'],
    ['instagram', 'Instagram'],
    ['tiktok', 'TikTok'],
    ['telegram', 'Telegram'],
    ['youtube', 'YouTube'],
  ] as const
  return (
    <div
      className={`fixed inset-0 z-50 xl:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-slate-950/40 transition ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-label="إغلاق القائمة"
      />

      <aside
        className={`absolute right-0 top-0 h-full w-[88%] max-w-sm border-l border-slate-200 bg-white p-5 shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <BrandMark compact />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
          >
            إغلاق
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
          <p className="text-sm font-semibold tracking-[0.2em] text-rose-300 uppercase">روابط سريعة</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">{siteConfig.hours}</p>

          <div className="mt-4 grid gap-2">
            {socialLinks
              .filter(([key]) => Boolean(social[key].trim()))
              .map(([key, label]) => (
                <a
                  key={key}
                  href={social[key]}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/15 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10"
                >
                  {label}
                </a>
              ))}
          </div>
        </div>
      </aside>
    </div>
  )
}

export default MobileMenu
