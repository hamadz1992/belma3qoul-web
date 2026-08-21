import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/layout/Header'
import MobileMenu from '../components/layout/MobileMenu'
import Navbar from '../components/layout/Navbar'

function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header onMenuClick={() => setMenuOpen(true)} />
      <Navbar />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
