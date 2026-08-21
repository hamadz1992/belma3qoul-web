import { useEffect, useMemo, useState } from 'react'

type AnalyticsDay = { date: string; visits: number; visitors: number; events: Record<string, number> }
type AnalyticsData = { days: AnalyticsDay[]; totals: { visits: number; visitors: number; events: Record<string, number> } }

const labels: Record<string, string> = {
  whatsapp_click: 'WhatsApp',
  messenger_click: 'Messenger',
  facebook_click: 'Facebook',
  instagram_click: 'Instagram',
  tiktok_click: 'TikTok',
  telegram_click: 'Telegram',
  youtube_click: 'YouTube',
  location_click: 'موقعنا',
  post_click: 'المنشورات',
  featured_click: 'المنشورات المميزة',
}

function formatDay(value: string) {
  try { return new Intl.DateTimeFormat('ar-DZ', { day: '2-digit', month: '2-digit' }).format(new Date(`${value}T12:00:00`)) } catch { return value }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/analytics', { credentials: 'same-origin', cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.error || 'تعذر تحميل الإحصائيات')
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تحميل الإحصائيات')
    } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  const chartDays = useMemo(() => (data?.days || []).slice(-14), [data])
  const maxVisits = Math.max(1, ...chartDays.map((day) => day.visits))
  const rankedEvents = useMemo(() => Object.entries(data?.totals.events || {}).sort((a, b) => b[1] - a[1]), [data])

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">📊 الإحصائيات</h1>
            <p className="mt-2 text-slate-500">قياس ما يجذب الزوار ويساعد على توجيههم نحو المحل.</p>
          </div>
          <button onClick={() => void load()} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-rose-300 hover:text-rose-600">↻ تحديث</button>
        </div>

        {loading ? <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">جارٍ تحميل الإحصائيات...</div> : error ? <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">{error}</div> : data ? <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon="👁️" label="زيارات آخر 30 يومًا" value={data.totals.visits} />
            <StatCard icon="👤" label="زوار آخر 30 يومًا" value={data.totals.visitors} />
            <StatCard icon="📍" label="فتح موقع المحل" value={data.totals.events.location_click || 0} />
            <StatCard icon="💬" label="تواصل اجتماعي" value={['whatsapp_click','messenger_click','facebook_click','instagram_click','tiktok_click','telegram_click','youtube_click'].reduce((sum, key) => sum + (data.totals.events[key] || 0), 0)} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-900">📈 الزيارات</h2><p className="mt-1 text-xs text-slate-400">آخر 14 يومًا</p></div></div>
              <div className="flex h-64 items-end gap-2 overflow-x-auto border-b border-slate-100 pb-1">
                {chartDays.map((day) => <div key={day.date} className="flex h-full min-w-[34px] flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-bold text-slate-500">{day.visits || ''}</span>
                  <div className="w-full rounded-t-xl bg-gradient-to-t from-rose-500 to-rose-300 transition-all" style={{ height: `${Math.max(5, (day.visits / maxVisits) * 78)}%` }} title={`${day.date}: ${day.visits} زيارة`} />
                  <span className="text-[9px] text-slate-400">{formatDay(day.date)}</span>
                </div>)}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-slate-900">🎯 أهم التفاعلات</h2>
              <p className="mt-1 text-xs text-slate-400">ما الذي يدفع الزائر للتفاعل؟</p>
              <div className="mt-5 space-y-3">
                {rankedEvents.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">لم تُسجل تفاعلات بعد.</p> : rankedEvents.slice(0, 8).map(([key, count]) => <div key={key} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"><span className="font-semibold text-slate-700">{labels[key] || key}</span><span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-600">{count}</span></div>)}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">📅 ملخص الأيام</h2>
            <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[520px] text-right text-sm"><thead><tr className="border-b border-slate-200 text-slate-400"><th className="px-3 py-3">اليوم</th><th className="px-3 py-3">الزيارات</th><th className="px-3 py-3">الزوار</th><th className="px-3 py-3">التفاعلات</th></tr></thead><tbody>{data.days.slice(-7).reverse().map((day) => <tr key={day.date} className="border-b border-slate-100"><td className="px-3 py-3 font-semibold text-slate-700">{formatDay(day.date)}</td><td className="px-3 py-3">{day.visits}</td><td className="px-3 py-3">{day.visitors}</td><td className="px-3 py-3">{Object.values(day.events).reduce((sum, value) => sum + value, 0)}</td></tr>)}</tbody></table></div>
          </section>
        </> : null}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return <div className="rounded-3xl bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-xl">{icon}</span><div><p className="text-xs font-semibold text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value.toLocaleString('ar-DZ')}</p></div></div></div>
}
