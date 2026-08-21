import { useEffect, useState } from 'react'

type SocialLinks = {
  facebook: string
  instagram: string
  tiktok: string
  telegram: string
  youtube: string
  whatsapp: string
  messenger: string
}

const defaultSocialLinks: SocialLinks = {
  facebook: '',
  instagram: '',
  tiktok: '',
  telegram: '',
  youtube: '',
  whatsapp: '',
  messenger: '',
}

const fields: Array<{
  key: keyof SocialLinks
  label: string
  placeholder: string
  icon: string
}> = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...', icon: '📘' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...', icon: '📸' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...', icon: '🎵' },
  { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/...', icon: '✈️' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...', icon: '▶️' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/213...', icon: '🟢' },
  { key: 'messenger', label: 'Messenger', placeholder: 'https://m.me/...', icon: '💬' },
]

export default function ContactLinksPage() {
  const [social, setSocial] = useState<SocialLinks>(defaultSocialLinks)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/settings', { cache: 'no-store', credentials: 'same-origin' })
        if (!response.ok) throw new Error(`Failed to load settings: ${response.status}`)
        const data = await response.json()
        setSocial({ ...defaultSocialLinks, ...(data?.social || {}) })
      } catch (error) {
        console.error(error)
        alert('❌ تعذر تحميل روابط التواصل')
      }
    }
    void load()
  }, [])

  function updateLink(key: keyof SocialLinks, value: string) {
    setSocial((current) => ({ ...current, [key]: value }))
  }

  async function saveLinks() {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ social }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || `Failed to save social links: ${response.status}`)
      setSocial({ ...defaultSocialLinks, ...(data?.settings?.social || social) })
      alert('✅ تم حفظ روابط التواصل')
    } catch (error) {
      console.error(error)
      const message = error instanceof Error ? error.message : 'تعذر حفظ روابط التواصل'
      alert(`❌ ${message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-950">📱 روابط التواصل</h1>
          <p className="mt-2 text-slate-500">رتّب وعدّل روابط التواصل بالترتيب المستخدم في الموقع.</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
          <div className="space-y-5">
            {fields.map((field) => (
              <div key={field.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 flex items-center gap-2 font-bold text-slate-900"><span>{field.icon}</span>{field.label}</label>
                <input type="url" value={social[field.key]} onChange={(e) => updateLink(field.key, e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100" dir="ltr" placeholder={field.placeholder} />
              </div>
            ))}
          </div>
          <button type="button" onClick={saveLinks} disabled={saving} className="mt-7 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? '⏳ جارٍ الحفظ...' : '💾 حفظ روابط التواصل'}</button>
        </div>
      </div>
    </div>
  )
}
