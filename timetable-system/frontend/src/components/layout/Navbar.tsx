import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { notificationsApi } from '../../api/services'

const titles: Record<string, string> = {
  '/':              'Dashboard',
  '/timetable':     'Dars Jadvali',
  '/slots':         'Slotlar',
  '/teachers':      "O'qituvchilar",
  '/subjects':      'Fanlar',
  '/groups':        'Guruhlar',
  '/rooms':         'Xonalar',
  '/equipment':     'Jihozlar',
  '/notifications': 'Bildirishnomalar',
  '/audit-logs':    'Audit Jurnali',
}

export default function Navbar() {
  const { pathname } = useLocation()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    notificationsApi.list().then(r => {
      setUnread(r.data.filter(n => !n.is_read).length)
    }).catch(() => {})
  }, [pathname])

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-lg font-bold text-slate-800">
        {titles[pathname] || 'Sahifa'}
      </h1>
      <div className="flex items-center gap-3">
        <a href="/notifications" className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <Bell size={20} className="text-slate-500" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </a>
      </div>
    </header>
  )
}
