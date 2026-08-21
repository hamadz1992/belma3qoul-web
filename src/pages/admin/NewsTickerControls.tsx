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

export default function NewsTickerControls() {
  const [ticker, setTicker] = useState<TickerSettings>(defaults)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store', credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((data) => {
        if (data?.newsTicker) setTicker({ ...defaults, ...data.newsTicker })
      })
      .catch((error) => console.error('Failed to load news ticker settings:', error))
  }, [])

  function update<K extends keyof TickerSettings>(key: K, value: TickerSettings[K]) {
    setTicker((current) => ({ ...current, [key]: value }))
  }

  function updateItem(index: number, value: string) {
    setTicker((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }))
  }

  function addItem() {
    setTicker((current) => ({ ...current, items: [...current.items, 'خبر جديد'] }))
  }

  function removeItem(index: number) {
    setTicker((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  async function saveTicker() {
    setSaving(true)
    try {
      const currentResponse = await fetch('/api/settings', {
        cache: 'no-store',
        credentials: 'include',
      })
      if (!currentResponse.ok) throw new Error(`تعذر قراءة الإعدادات (HTTP ${currentResponse.status})`)

      const current = await currentResponse.json()
      const response = await fetch('/api/settings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...current, newsTicker: ticker }),
      })

      if (!response.ok) {
        let message = `HTTP ${response.status}`
        try {
          const data = await response.json()
          if (data?.error) message = data.error
        } catch {
          // Keep the HTTP status when the response is not JSON.
        }
        throw new Error(message)
      }

      alert('✅ تم حفظ إعدادات شريط الأخبار')
    } catch (error) {
      console.error('Failed to save news ticker settings:', error)
      const message = error instanceof Error ? error.message : 'خطأ غير معروف'
      alert(`❌ تعذر حفظ إعدادات شريط الأخبار\n${message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mb-8 rounded-3xl border border-rose-100 bg-rose-50/40 p-5 sm:p-7">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-950">📰 التحكم في شريط الأخبار</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          هذا هو الشريط المتحرك الظاهر أسفل العنصر المتبدّل. يمكنك التحكم في النصوص والسرعة والألوان أو إخفائه بالكامل.
        </p>
      </div>

      <div className="space-y-5">
        <label className="flex items-center justify-between rounded-2xl bg-white p-4">
          <span className="font-bold">إظهار شريط الأخبار</span>
          <input
            type="checkbox"
            checked={ticker.enabled}
            onChange={(event) => update('enabled', event.target.checked)}
            className="h-5 w-5 accent-rose-600"
          />
        </label>

        <div>
          <label className="mb-2 block font-bold">عنوان الشريط</label>
          <input
            value={ticker.title}
            onChange={(event) => update('title', event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="font-bold">العبارات التي تظهر في الشريط</label>
            <button type="button" onClick={addItem} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700">
              + إضافة
            </button>
          </div>
          <div className="space-y-2">
            {ticker.items.map((item, index) => (
              <div key={`${index}-${item}`} className="flex gap-2">
                <input
                  value={item}
                  onChange={(event) => updateItem(index, event.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-3"
                />
                <button type="button" onClick={() => removeItem(index)} className="rounded-xl border border-rose-200 bg-white px-3 text-rose-600 hover:bg-rose-50">
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-bold">سرعة الحركة بالثواني</label>
            <input
              type="number"
              min="8"
              max="120"
              value={ticker.speed}
              onChange={(event) => update('speed', Number(event.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white p-3"
            />
          </div>
          <div>
            <label className="mb-2 block font-bold">اتجاه الحركة</label>
            <select
              value={ticker.direction}
              onChange={(event) => update('direction', event.target.value as TickerSettings['direction'])}
              className="w-full rounded-xl border border-slate-200 bg-white p-3"
            >
              <option value="rtl">من اليمين إلى اليسار</option>
              <option value="ltr">من اليسار إلى اليمين</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className="mb-2 block font-bold">لون الخلفية</span>
            <input type="color" value={ticker.background} onChange={(event) => update('background', event.target.value)} className="h-12 w-full rounded-xl" />
          </label>
          <label>
            <span className="mb-2 block font-bold">لون النص</span>
            <input type="color" value={ticker.textColor} onChange={(event) => update('textColor', event.target.value)} className="h-12 w-full rounded-xl" />
          </label>
          <label>
            <span className="mb-2 block font-bold">لون العنوان</span>
            <input type="color" value={ticker.titleColor} onChange={(event) => update('titleColor', event.target.value)} className="h-12 w-full rounded-xl" />
          </label>
        </div>

        <button type="button" onClick={saveTicker} disabled={saving} className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? '⏳ جارٍ الحفظ...' : '💾 حفظ شريط الأخبار'}
        </button>
      </div>
    </section>
  )
}
