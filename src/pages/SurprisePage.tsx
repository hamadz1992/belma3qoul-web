import { useMemo, useState } from 'react'
import { siteConfig } from '../constants/site'

const surpriseUrl = `${siteConfig.siteUrl}/surprise`

export default function SurprisePage() {
  const [sent, setSent] = useState(false)
  const qrUrl = useMemo(() => `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(surpriseUrl)}`, [])

  function participate() {
    setSent(true)
  }

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 px-4 py-8 text-slate-800 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <section className="w-full overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
          <div className="bg-gradient-to-br from-rose-600 via-pink-600 to-amber-500 px-6 py-8 text-center text-white">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-white/15 text-4xl backdrop-blur">🎁</div>
            <p className="text-xs font-bold tracking-[0.2em] text-white/80">بزار كل شيء بالمعقول</p>
            <h1 className="mt-2 text-3xl font-black">مفاجأة بزار</h1>
            <p className="mt-2 text-sm leading-6 text-white/90">امسح الكود… وقد تكون من الفائزين!</p>
          </div>

          <div className="space-y-5 p-6 text-center">
            <div className="mx-auto w-fit rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
              <img src={qrUrl} alt="رمز QR لمفاجأة بزار" className="h-44 w-44" />
            </div>

            {!sent ? (
              <>
                <div>
                  <h2 className="text-lg font-black text-slate-900">✨ شارك في المفاجأة</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">هذه الصفحة هي الوجهة الثابتة للـQR. يمكننا لاحقًا تحويل المفاجأة إلى مسابقة أو هدية أو خصم دون تغيير الكود.</p>
                </div>
                <button type="button" onClick={participate} className="w-full rounded-2xl bg-rose-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 active:scale-[0.99]">أشارك الآن 🎉</button>
              </>
            ) : (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="text-3xl">✅</div>
                <h2 className="mt-2 text-lg font-black text-emerald-800">تم تسجيل اهتمامك!</h2>
                <p className="mt-1 text-sm leading-6 text-emerald-700">المفاجأة قابلة للتغيير لاحقًا، وعند إطلاق السحب أو الهدية سنستخدم هذه الصفحة نفسها.</p>
              </div>
            )}

            <a href={siteConfig.siteUrl} className="inline-flex text-xs font-bold text-slate-400 transition hover:text-rose-600">العودة إلى الموقع الرئيسي ↩</a>
          </div>
        </section>
      </div>
    </main>
  )
}
