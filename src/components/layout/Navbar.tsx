import { useEffect, useState } from 'react'

type NavigationItem = {
  id?: string
  icon: string
  label: string
  href: string
  enabled?: boolean
}

const defaultNavItems: NavigationItem[] = [
  { id: 'offers', icon: '🔥', label: 'عروضنا الحالية', href: '#offers', enabled: true },
  { id: 'latest', icon: '📰', label: 'آخر المنشورات', href: '#latest', enabled: true },
  { id: 'featured', icon: '⭐', label: 'المنشورات المميزة', href: '#featured', enabled: true },
  { id: 'location', icon: '📍', label: 'موقعنا', href: '#location', enabled: true },
]

function Navbar() {
  const [navItems, setNavItems] = useState<NavigationItem[]>(defaultNavItems)
  const [activeIndex, setActiveIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadNavigation() {
      try {
        const response = await fetch('/api/settings', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to load navigation settings')

        const data = await response.json()

        if (!mounted || !Array.isArray(data?.navigation)) return

        const items = data.navigation.filter(
          (item: NavigationItem) =>
            item?.enabled !== false &&
            typeof item?.icon === 'string' &&
            typeof item?.label === 'string' &&
            typeof item?.href === 'string',
        )

        setNavItems(items)
        setActiveIndex(0)
      } catch (error) {
        console.error('Failed to load navigation settings:', error)
      }
    }

    loadNavigation()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (navItems.length === 0) return

    const interval = window.setInterval(() => {
      setVisible(false)

      window.setTimeout(() => {
        setActiveIndex((current) => (current + 1) % navItems.length)
        setVisible(true)
      }, 350)
    }, 3500)

    return () => window.clearInterval(interval)
  }, [navItems.length])

  if (navItems.length === 0) return null

  const item = navItems[activeIndex % navItems.length]

  return (
    <div className="hidden border-b border-rose-100/80 bg-white/80 backdrop-blur-md md:block">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-3 sm:px-6 lg:px-8">
        <a
          href={item.href}
          className={`group flex items-center gap-3 rounded-full border border-rose-200/70 bg-white/95 px-5 py-2.5 shadow-[0_4px_18px_rgba(244,63,94,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-[0_7px_24px_rgba(244,63,94,0.14)] ${
            visible
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-1 scale-95 opacity-0'
          }`}
          aria-label={item.label}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-amber-100 text-lg shadow-inner">
            <span className="transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </span>
          </span>

          <span className="text-sm font-bold tracking-tight text-slate-900 sm:text-[15px]">
            {item.label}
          </span>
        </a>
      </div>
    </div>
  )
}

export default Navbar