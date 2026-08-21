import { useEffect, useState } from 'react'

type TickerSettings = {
  enabled: boolean
  title: string
  items: string[]
  speed: number
  direction: 'rtl' | 'ltr'
  background: string
  textColor: string
  titleColor: string
}

const defaults: TickerSettings = {
  enabled: true,
  title: 'آخر الأخبار',
  items: ['جديدنا أولاً بأول', 'تابعوا أحدث منشورات المحل', 'كل شيء بالمعقول — عروض ومنتجات جديدة'],
  speed: 30,
  direction: 'rtl',
  background: '#fff1f2',
  textColor: '#334155',
  titleColor: '#e11d48',
}

export default function NewsTickerPage() {
  const [settings, setSettings] = useState<TickerSettings>(defaults)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/settings', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to load settings')
        const data = await response.json()
        setSettings({ ...defaults, ...(data?.newsTicker || {}) })
      } catch (error) {
        console.error(error)
      }
    }
    void load()
  }, [])

  function update<K extends keyof TickerSettings>(key: K, value: TickerSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  function updateItem(index: number, value: string) {
    setSettings((current) => ({ ...current, items: current.items.map((item, i) => i === index ? value : item) }))
  }

  function addItem() {
    setSettings((current) => ({ ...current, items: [...current.items, 'خبر جديد'] }))
  }

  function removeItem(index: number) {
    setSettings((current) => ({ ...current, items: current.items.filter((_, i) => i !== index) }))
  }

  async function save() {
    setSaving(true)
    try {
      const getResponse = await fetch('/api/settings', { cache: 'no-store' })
      if (!getResponse.ok) throw new Error('Failed to load current settings')
      const current = await getResponse.json()
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...current, newsTicker: settings }),
      })
      if (!response.ok) throw new Error('Failed to save ticker settings')
      alert('✅ تم حفظ إعدادات الشريط الإخباري')
    } catch (error) {
      console.error(error)
      alert('❌ تعذر حفظ إعدادات الشريط الإخباري')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-950">📰 الشريط الإخباري</h1>
          <p className="mt-2 text-slate-500">تحكم في الشريط المتحرك الذي يظهر في واجهة الموقع.</p>
        </div>

        <div className="space-y-6 rounded-3xl bg-white p-5 shadow sm:p-8">
          <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="font-bold text-slate-900">تفعيل الشريط</span>
            <input type="checkbox" checked={settings.enabled} onChange={(e) => update('enabled', e.target.checked)} className="h-5 w-5 accent-rose-600" />
          </label>

          <div>
            <label className="mb-2 block font-bold">عنوان الشريط</label>
            <input value={settings.title} onChange={(e) => update('title', e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-rose-400" />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between"><label className="font-bold">الأخبار / العبارات</label><button type="button" onClick={addItem} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white">+ إضافة</button></div>
            <div className="space-y-3">
              {settings.items.map((item, index) => <div key={`${index}-${item}`} className="flex gap-2"><input value={item} onChange={(e) => updateItem(index, e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 p-3 outline-none focus:border-rose-400" /><button type="button" onClick={() => removeItem(index)} className="rounded-xl border border-rose-200 px-4 text-rose-600 hover:bg-rose-50">حذف</button></div>)}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="mb-2 block font-bold">السرعة (ثانية)</label><input type="number" min="8" max="120" value={settings.speed} onChange={(e) => update('speed', Number(e.target.value))} className="w-full rounded-xl border border-slate-200 p-3" /></div>
            <div><label className="mb-2 block font-bold">الاتجاه</label><select value={settings.direction} onChange={(e) => update('direction', e.target.value as TickerSettings['direction'])} className="w-full rounded-xl border border-slate-200 p-3"><option value="rtl">من اليمين إلى اليسار</option><option value="ltr">من اليسار إلى اليمين</option></select></div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <label className="block"><span className="mb-2 block font-bold">لون الخلفية</span><input type="color" value={settings.background} onChange={(e) => update('background', e.target.value)} className="h-12 w-full rounded-xl border border-slate-200" /></label>
            <label className="block"><span className="mb-2 block font-bold">لون النص</span><input type="color" value={settings.textColor} onChange={(e) => update('textColor', e.target.value)} className="h-12 w-full rounded-xl border border-slate-200" /></label>
            <label className="block"><span className="mb-2 block font-bold">لون العنوان</span><input type="color" value={settings.titleColor} onChange={(e) => update('titleColor', e.target.value)} className="h-12 w-full rounded-xl border border-slate-200" /></label>
          </div>

          <button type="button" onClick={save} disabled={saving} className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? '⏳ جارٍ الحفظ...' : '💾 حفظ إعدادات الشريط'}</button>
        </div>
      </div>
    </div>
  )
}
