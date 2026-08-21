import { Outlet, useLocation, useNavigate } from 'react-router-dom'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isDashboard = location.pathname === '/admin/dashboard'

  return (
    <div className="relative">
      {!isDashboard ? (
        <div className="sticky top-0 z-50 border-b border-slate-200 bg-slate-50/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6 lg:px-8" dir="rtl">
          <div className="mx-auto max-w-7xl">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-rose-300 hover:text-rose-600 hover:shadow"
            >
              <span aria-hidden="true">→</span>
              العودة إلى لوحة التحكم
            </button>
          </div>
        </div>
      ) : null}
      <Outlet />
    </div>
  )
}
