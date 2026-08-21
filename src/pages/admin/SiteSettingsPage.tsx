import { useEffect, useState } from 'react'
import NewsTickerControls from './NewsTickerControls'

type NavigationItem = {
  id: string
  icon: string
  label: string
  href: string
  enabled: boolean
}

type Settings = {
  site: {
    name: string
    description: string
    phone: string
    whatsapp: string
    address: string
    hours: string
    googleMaps: string
  }
  social: {
    facebook: string
    instagram: string
    tiktok: string
    telegram: string
    youtube: string
  }
  navigation: NavigationItem[]
}

const defaultNavigation: NavigationItem[] = [
  { id: 'offers', icon: '🔥', label: 'عروضنا الحالية', href: '#offers', enabled: true },
  { id: 'latest', icon: '📰', label: 'آخر المنشورات', href: '#latest', enabled: true },
  { id: 'featured', icon: '⭐', label: 'المنشورات المميزة', href: '#featured', enabled: true },
  { id: 'location', icon: '📍', label: 'موقعنا', href: '#location', enabled: true },
]

const defaultSettings: Settings = {
  site: {
    name: '',
    description: '',
    phone: '',
    whatsapp: '',
    address: '',
    hours: '',
    googleMaps: '',
  },
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
    telegram: '',
    youtube: '',
  },
  navigation: defaultNavigation,
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()

      setSettings({
        ...defaultSettings,
        ...data,
        site: {
          ...defaultSettings.site,
          ...(data?.site || {}),
        },
        social: {
          ...defaultSettings.social,
          ...(data?.social || {}),
        },
        navigation:
          Array.isArray(data?.navigation) && data.navigation.length > 0
            ? data.navigation
            : defaultNavigation,
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function saveSettings() {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('فشل حفظ الإعدادات')
      }

      alert('✅ تم حفظ الإعدادات')
    } catch (error) {
      console.error(error)
      alert('❌ حدث خطأ أثناء الحفظ')
    }
  }

  function updateNavigationItem(index: number, field: keyof NavigationItem, value: string) {
    setSettings((current) => ({
      ...current,
      navigation: current.navigation.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  function addNavigationItem() {
    setSettings((current) => ({
      ...current,
      navigation: [
        ...current.navigation,
        {
          id: `nav-${Date.now()}`,
          icon: '🔗',
          label: 'عنصر جديد',
          href: '#',
          enabled: true,
        },
      ],
    }))
  }

  function removeNavigationItem(index: number) {
    setSettings((current) => ({
      ...current,
      navigation: current.navigation.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  function moveNavigationItem(index: number, direction: 'up' | 'down') {
    setSettings((current) => {
      const next = [...current.navigation]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= next.length) return current
      ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
      return { ...current, navigation: next }
    })
  }

  function toggleNavigationItem(index: number) {
    setSettings((current) => ({
      ...current,
      navigation: current.navigation.map((item, itemIndex) =>
        itemIndex === index ? { ...item, enabled: !item.enabled } : item,
      ),
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-extrabold text-slate-950">🌐 إعدادات الموقع</h1>

        <div className="rounded-3xl bg-white p-5 shadow sm:p-8">
          <div className="mb-6">
            <label className="mb-2 block font-semibold">اسم المحل</label>
            <input type="text" value={settings.site.name} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, name: e.target.value } })} className="w-full rounded-xl border p-3" />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-semibold">الوصف</label>
            <textarea rows={8} value={settings.site.description} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, description: e.target.value } })} className="w-full rounded-xl border p-3" />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-semibold">رقم الهاتف</label>
            <input type="tel" value={settings.site.phone} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, phone: e.target.value } })} className="w-full rounded-xl border p-3" dir="ltr" />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-semibold">رقم واتساب</label>
            <input type="tel" value={settings.site.whatsapp} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, whatsapp: e.target.value } })} className="w-full rounded-xl border p-3" dir="ltr" placeholder="213779156397" />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-semibold">عنوان المحل</label>
            <textarea rows={3} value={settings.site.address} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, address: e.target.value } })} className="w-full rounded-xl border p-3" />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-semibold">ساعات العمل</label>
            <textarea rows={6} value={settings.site.hours} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, hours: e.target.value } })} className="w-full rounded-xl border p-3" />
          </div>

          <div className="mb-8">
            <label className="mb-2 block font-semibold">رابط Google Maps</label>
            <input type="url" value={settings.site.googleMaps} onChange={(e) => setSettings({ ...settings, site: { ...settings.site, googleMaps: e.target.value } })} className="w-full rounded-xl border p-3" dir="ltr" placeholder="https://maps.google.com/" />
          </div>

          <NewsTickerControls />

          <div className="mb-8 border-t border-slate-200 pt-8">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950">🔗 إعدادات العنصر المتبدّل</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">تحكم في العناصر التي تظهر داخل العنصر المتبدّل: الاسم، الأيقونة، الرابط، الترتيب، وإظهار العنصر أو إخفاؤه.</p>
              </div>
              <button type="button" onClick={addNavigationItem} className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-700">➕ إضافة عنصر</button>
            </div>

            <div className="space-y-4">
              {settings.navigation.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">لا توجد عناصر. اضغط «إضافة عنصر».</div>
              ) : settings.navigation.map((item, index) => (
                <div key={item.id} className={`rounded-2xl border p-4 transition ${item.enabled ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-slate-100 opacity-60'}`}>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm">{item.icon}</span>
                      <div>
                        <div className="font-bold text-slate-950">عنصر {index + 1}</div>
                        <div className="text-xs text-slate-500">{item.enabled ? 'ظاهر في الموقع' : 'مخفي من الموقع'}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => moveNavigationItem(index, 'up')} disabled={index === 0} className="rounded-lg border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">↑</button>
                      <button type="button" onClick={() => moveNavigationItem(index, 'down')} disabled={index === settings.navigation.length - 1} className="rounded-lg border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">↓</button>
                      <button type="button" onClick={() => toggleNavigationItem(index)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${item.enabled ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>{item.enabled ? '👁️ إخفاء' : '👁️ إظهار'}</button>
                      <button type="button" onClick={() => removeNavigationItem(index)} className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200">🗑️ حذف</button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">الأيقونة</label>
                      <input type="text" value={item.icon} onChange={(e) => updateNavigationItem(index, 'icon', e.target.value)} className="w-full rounded-xl border bg-white p-3 text-center text-lg" maxLength={4} />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">اسم العنصر</label>
                      <input type="text" value={item.label} onChange={(e) => updateNavigationItem(index, 'label', e.target.value)} className="w-full rounded-xl border bg-white p-3" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">الرابط</label>
                      <input type="text" value={item.href} onChange={(e) => updateNavigationItem(index, 'href', e.target.value)} className="w-full rounded-xl border bg-white p-3" dir="ltr" placeholder="#offers أو https://..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={saveSettings} className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700">💾 حفظ إعدادات الموقع</button>
        </div>
      </div>
    </div>
  )
}
