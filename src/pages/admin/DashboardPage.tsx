import { useNavigate } from 'react-router-dom'

const LANDING_PAGE_URL = 'https://hamadz1992.github.io/belma3qoul/landing/'

export default function DashboardPage() {
  const navigate = useNavigate()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => undefined)
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">لوحة التحكم</h1>
            <p className="mt-2 text-slate-500">مرحباً بك في لوحة إدارة كل شيء بالمعقول</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={LANDING_PAGE_URL} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-800">🌐 فتح الصفحة التعريفية</a>
            <button onClick={() => void logout()} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-rose-300 hover:text-rose-600">تسجيل الخروج</button>
          </div>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <a href={LANDING_PAGE_URL} target="_blank" rel="noreferrer" className="cursor-pointer rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"><h2 className="text-xl font-bold">🌐 الصفحة التعريفية</h2><p className="mt-3 text-slate-500">فتح صفحة بزار الأصلية المنشورة على GitHub Pages.</p><span className="mt-4 inline-block font-semibold text-emerald-700">فتح الصفحة ↗</span></a>
          <div onClick={() => navigate('/admin/analytics')} className="cursor-pointer rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"><h2 className="text-xl font-bold">📊 الإحصائيات</h2><p className="mt-3 text-slate-500">الزيارات، الزوار، التفاعل، وأكثر ما يجذب جمهور المحل.</p></div>
          <div onClick={() => navigate('/admin/facebook')} className="cursor-pointer rounded-3xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"><h2 className="text-xl font-bold">📘 Facebook</h2><p className="mt-3 text-slate-500">إدارة اتصال Facebook والمنشورات.</p></div>
          <div onClick={() => navigate('/admin/featured-posts')} className="cursor-pointer rounded-3xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"><h2 className="text-xl font-bold">⭐ المنشورات المميزة</h2><p className="mt-3 text-slate-500">إدارة المنشورات المثبتة.</p></div>
          <div onClick={() => navigate('/admin/ads')} className="cursor-pointer rounded-3xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"><h2 className="text-xl font-bold">📢 لوحة الإعلانات</h2><p className="mt-3 text-slate-500">منشور، صورة، بانر ثابت أو متحرك، وفيديو.</p></div>
          <div onClick={() => navigate('/admin/contact-links')} className="cursor-pointer rounded-3xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"><h2 className="text-xl font-bold">📱 روابط التواصل</h2><p className="mt-3 text-slate-500">تعديل روابط التواصل.</p></div>
          <div onClick={() => navigate('/admin/settings')} className="cursor-pointer rounded-3xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"><h2 className="text-xl font-bold">⚙️ الإعدادات</h2><p className="mt-3 text-slate-500">ربط Facebook وإعدادات الموقع.</p></div>
        </div>
      </div>
    </div>
  )
}
