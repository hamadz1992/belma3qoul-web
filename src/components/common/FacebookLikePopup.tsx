type FacebookLikePopupProps = {
  open: boolean
  onClose: () => void
  facebookUrl: string
  onOpenFacebook: () => void
}

export default function FacebookLikePopup({ open, onClose, facebookUrl, onOpenFacebook }: FacebookLikePopupProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="facebook-like-title" dir="rtl">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <button type="button" onClick={onClose} aria-label="إغلاق" className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800">×</button>
        <div className="bg-gradient-to-br from-rose-50 via-white to-blue-50 px-6 pb-5 pt-8 text-center sm:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1877F2] text-3xl font-black text-white shadow-lg shadow-blue-200">f</div>
          <h2 id="facebook-like-title" className="mt-5 text-2xl font-black text-slate-900">خليك دايمًا مع كل شيء بالمعقول ❤️</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-600">تابع صفحتنا على Facebook باش توصلك جديدنا، العروض والمنشورات الجديدة أولًا بأول.</p>
        </div>
        <div className="flex flex-col gap-2.5 p-5 sm:p-6">
          <a href={facebookUrl} target="_blank" rel="noreferrer" onClick={onOpenFacebook} className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1877F2] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-[#166fe5]">👍 تابع صفحتنا على Facebook</a>
          <button type="button" onClick={onClose} className="w-full rounded-2xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700">ليس الآن</button>
        </div>
      </div>
    </div>
  )
}
