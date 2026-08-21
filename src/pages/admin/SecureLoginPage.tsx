import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function SecureLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store' })
      .then((response) => response.ok ? response.json() : { authenticated: false })
      .then((data) => {
        if (data?.authenticated) navigate('/admin/dashboard', { replace: true })
      })
      .catch(() => undefined)
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.authenticated) {
        setError(data?.error || 'اسم المستخدم أو كلمة المرور غير صحيحة')
        return
      }
      const target = (location.state as { from?: string } | null)?.from || '/admin/dashboard'
      navigate(target, { replace: true })
    } catch {
      setError('تعذر الاتصال بالخادم. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-slate-900">كل شيء بالمعقول</h1>
        <p className="mb-8 text-center text-slate-500">تسجيل الدخول إلى لوحة التحكم</p>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="admin-username" className="mb-2 block text-sm font-medium text-slate-700">اسم المستخدم</label>
            <input id="admin-username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-500" />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-slate-700">كلمة المرور</label>
            <input id="admin-password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-rose-500" />
          </div>
          {error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <button disabled={loading} type="submit" className="w-full rounded-xl bg-rose-600 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}</button>
        </form>
      </div>
    </div>
  )
}
