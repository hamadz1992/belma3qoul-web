import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function AdminGuard() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    let active = true

    fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store' })
      .then((response) => response.ok ? response.json() : { authenticated: false })
      .then((data) => {
        if (!active) return
        setAuthenticated(Boolean(data?.authenticated))
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setAuthenticated(false)
        setLoading(false)
      })

    return () => { active = false }
  }, [])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">جارٍ التحقق من الجلسة...</div>
  }

  if (!authenticated) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
