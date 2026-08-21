import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-slate-900">
          كل شيء بالمعقول
        </h1>

        <p className="mb-8 text-center text-slate-500">
          لوحة التحكم
        </p>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            navigate('/admin/dashboard')
          }}
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              اسم المستخدم
            </label>

            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              كلمة المرور
            </label>

            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-rose-600 py-3 font-semibold text-white transition hover:bg-rose-700"
          >
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  )
}