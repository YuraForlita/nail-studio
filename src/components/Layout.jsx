import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, Users, Sparkles, Receipt, ChartNoAxesColumn, LogOut, WifiOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'

const NAV = [
  { to: '/', label: 'Записи', icon: CalendarDays, end: true },
  { to: '/clients', label: 'Клієнтки', icon: Users },
  { to: '/services', label: 'Послуги', icon: Sparkles },
  { to: '/expenses', label: 'Витрати', icon: Receipt },
  { to: '/reports', label: 'Звіти', icon: ChartNoAxesColumn },
]

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

export default function Layout() {
  const { logout } = useAuth()
  const online = useOnline()

  return (
    <div className="min-h-screen md:flex">
      {/* Сайдбар — десктоп */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:shrink-0 border-r border-line bg-card">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-wine" />
            <span className="w-2.5 h-2.5 rounded-full bg-caramel" />
            <span className="w-2.5 h-2.5 rounded-full bg-sage" />
          </div>
          <h1 className="font-display text-xl mt-3 leading-tight">Студія</h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-wine text-shell' : 'text-inkSoft hover:bg-shell'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-5">
          {!online && (
            <div className="flex items-center gap-2 px-3 py-2 mb-2 text-xs text-inkSoft bg-shell rounded-md">
              <WifiOff size={14} /> Офлайн — зміни синхронізуються пізніше
            </div>
          )}
          <button onClick={logout} className="btn-ghost w-full justify-start">
            <LogOut size={16} /> Вийти
          </button>
        </div>
      </aside>

      {/* Контент */}
      <div className="flex-1 min-w-0">
        {!online && (
          <div className="md:hidden flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-shell bg-wine">
            <WifiOff size={13} /> Офлайн-режим
          </div>
        )}
        <main className="max-w-5xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Нижнє меню — мобільний */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-line flex items-stretch z-30 pb-[env(safe-area-inset-bottom)]">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium ${
                isActive ? 'text-wine' : 'text-inkSoft'
              }`
            }
          >
            <Icon size={19} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
