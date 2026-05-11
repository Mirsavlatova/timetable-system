import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/authStore'
import {
  LayoutDashboard, Users, BookOpen, UsersRound, Building2,
  Wrench, CalendarDays, Calendar, Bell, FileText, LogOut, GraduationCap
} from 'lucide-react'

const nav = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/timetable',     icon: Calendar,        label: 'Dars Jadvali' },
  { to: '/slots',         icon: CalendarDays,    label: 'Slotlar' },
  { to: '/teachers',      icon: Users,           label: "O'qituvchilar" },
  { to: '/subjects',      icon: BookOpen,        label: 'Fanlar' },
  { to: '/groups',        icon: UsersRound,      label: 'Guruhlar' },
  { to: '/rooms',         icon: Building2,       label: 'Xonalar' },
  { to: '/equipment',     icon: Wrench,          label: 'Jihozlar' },
  { to: '/notifications', icon: Bell,            label: 'Bildirishnomalar' },
  { to: '/audit-logs',    icon: FileText,        label: 'Audit Jurnali' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleColors: Record<string, string> = {
    admin:      'badge-purple',
    dispatcher: 'badge-blue',
    teacher:    'badge-green',
    student:    'badge-gray',
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Dars Jadvali</p>
            <p className="text-slate-400 text-xs">Tizimi v1.0</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
            <span className={`${roleColors[user?.role || 'student']} text-[10px] px-1.5 py-0.5 rounded-full`}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 text-sm font-medium transition-all"
        >
          <LogOut size={16} />
          Chiqish
        </button>
      </div>
    </aside>
  )
}
