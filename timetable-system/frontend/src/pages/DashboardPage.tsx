// import { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import { Users, BookOpen, UsersRound, Building2, CalendarDays, AlertCircle, Bell, Zap } from 'lucide-react'
// import { dashboardApi } from '../../api/services'
// import { PageSpinner } from '../../components/ui'
// import type { DashboardStats } from '../../types'

// const statCards = (s: DashboardStats) => [
//   { label: "O'qituvchilar",  value: s.teachers,        icon: Users,       color: 'bg-blue-500',   to: '/teachers' },
//   { label: 'Fanlar',         value: s.subjects,         icon: BookOpen,    color: 'bg-purple-500', to: '/subjects' },
//   { label: 'Guruhlar',       value: s.groups,           icon: UsersRound,  color: 'bg-emerald-500',to: '/groups' },
//   { label: 'Xonalar',        value: s.rooms,            icon: Building2,   color: 'bg-amber-500',  to: '/rooms' },
//   { label: 'Aktiv slotlar',  value: s.active_slots,     icon: CalendarDays,color: 'bg-indigo-500', to: '/slots' },
//   { label: 'Muammo slotlar', value: s.requires_action_slots, icon: AlertCircle, color: 'bg-red-500', to: '/slots' },
//   { label: 'Critical xonalar', value: s.critical_rooms, icon: Building2,  color: 'bg-orange-500', to: '/rooms' },
//   { label: "O'qilmagan",    value: s.unread_notifications, icon: Bell,     color: 'bg-pink-500',   to: '/notifications' },
// ]

// export default function DashboardPage() {
//   const [stats, setStats]   = useState<DashboardStats | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     dashboardApi.stats()
//       .then(r => setStats(r.data))
//       .finally(() => setLoading(false))
//   }, [])

//   if (loading) return <PageSpinner />

//   const cards = stats ? statCards(stats) : []

//   return (
//     <div className="space-y-8">
//       {/* Welcome */}
//       <div className="card p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-2xl font-bold mb-1">Xush kelibsiz! 👋</h2>
//             <p className="text-indigo-100 text-sm">Dars jadvali tizimining umumiy holati</p>
//           </div>
//           <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
//             <Zap size={32} className="text-white" />
//           </div>
//         </div>
//       </div>

//       {/* Stat cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {cards.map(({ label, value, icon: Icon, color, to }) => (
//           <Link key={label} to={to}
//             className="card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
//             <div className="flex items-center gap-4">
//               <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg`}>
//                 <Icon size={22} className="text-white" />
//               </div>
//               <div>
//                 <p className="text-2xl font-extrabold text-slate-800">{value}</p>
//                 <p className="text-xs text-slate-500 font-medium">{label}</p>
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>

//       {/* Quick actions */}
//       <div className="card p-6">
//         <h3 className="text-base font-bold text-slate-700 mb-4">Tezkor harakatlar</h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           {[
//             { label: 'Jadval ko\'rish', to: '/timetable', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
//             { label: 'Slot qo\'shish', to: '/slots',     color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
//             { label: 'O\'qituvchi qo\'shish', to: '/teachers', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
//             { label: 'Bildirishnomalar', to: '/notifications', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
//           ].map(({ label, to, color }) => (
//             <Link key={label} to={to}
//               className={`${color} rounded-xl px-4 py-3 text-sm font-semibold text-center transition-colors`}>
//               {label}
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// import { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import { Users, BookOpen, UsersRound, Building2, CalendarDays, AlertCircle, Bell, Zap } from 'lucide-react'

// // 🔧 SHU JOY TUZATILDI
// import { dashboardApi } from '../api/services'

// import { PageSpinner } from '../../components/ui'
// import type { DashboardStats } from '../../types'

// const statCards = (s: DashboardStats) => [
//   { label: "O'qituvchilar",  value: s.teachers,        icon: Users,       color: 'bg-blue-500',   to: '/teachers' },
//   { label: 'Fanlar',         value: s.subjects,         icon: BookOpen,    color: 'bg-purple-500', to: '/subjects' },
//   { label: 'Guruhlar',       value: s.groups,           icon: UsersRound,  color: 'bg-emerald-500',to: '/groups' },
//   { label: 'Xonalar',        value: s.rooms,            icon: Building2,   color: 'bg-amber-500',  to: '/rooms' },
//   { label: 'Aktiv slotlar',  value: s.active_slots,     icon: CalendarDays,color: 'bg-indigo-500', to: '/slots' },
//   { label: 'Muammo slotlar', value: s.requires_action_slots, icon: AlertCircle, color: 'bg-red-500', to: '/slots' },
//   { label: 'Critical xonalar', value: s.critical_rooms, icon: Building2,  color: 'bg-orange-500', to: '/rooms' },
//   { label: "O'qilmagan",    value: s.unread_notifications, icon: Bell,     color: 'bg-pink-500',   to: '/notifications' },
// ]

// export default function DashboardPage() {
//   const [stats, setStats]   = useState<DashboardStats | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     dashboardApi.stats()
//       .then(r => setStats(r.data))
//       .finally(() => setLoading(false))
//   }, [])

//   if (loading) return <PageSpinner />

//   const cards = stats ? statCards(stats) : []

//   return (
//     <div className="space-y-8">
//       <div className="card p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-2xl font-bold mb-1">Xush kelibsiz! 👋</h2>
//             <p className="text-indigo-100 text-sm">Dars jadvali tizimining umumiy holati</p>
//           </div>
//           <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
//             <Zap size={32} className="text-white" />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {cards.map(({ label, value, icon: Icon, color, to }) => (
//           <Link key={label} to={to}
//             className="card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
//             <div className="flex items-center gap-4">
//               <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg`}>
//                 <Icon size={22} className="text-white" />
//               </div>
//               <div>
//                 <p className="text-2xl font-extrabold text-slate-800">{value}</p>
//                 <p className="text-xs text-slate-500 font-medium">{label}</p>
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>

//       <div className="card p-6">
//         <h3 className="text-base font-bold text-slate-700 mb-4">Tezkor harakatlar</h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           {[
//             { label: 'Jadval ko\'rish', to: '/timetable', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
//             { label: 'Slot qo\'shish', to: '/slots',     color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
//             { label: 'O\'qituvchi qo\'shish', to: '/teachers', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
//             { label: 'Bildirishnomalar', to: '/notifications', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
//           ].map(({ label, to, color }) => (
//             <Link key={label} to={to}
//               className={`${color} rounded-xl px-4 py-3 text-sm font-semibold text-center transition-colors`}>
//               {label}
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }



import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  BookOpen,
  UsersRound,
  Building2,
  CalendarDays,
  AlertCircle,
  Bell,
  Zap,
} from 'lucide-react'

// ✅ TO‘G‘RI IMPORTLAR
import { dashboardApi } from '../api/services'
import { PageSpinner } from '../components/ui'
import type { DashboardStats } from '../types'

const statCards = (s: DashboardStats) => [
  { label: "O'qituvchilar", value: s.teachers, icon: Users, color: 'bg-blue-500', to: '/teachers' },
  { label: 'Fanlar', value: s.subjects, icon: BookOpen, color: 'bg-purple-500', to: '/subjects' },
  { label: 'Guruhlar', value: s.groups, icon: UsersRound, color: 'bg-emerald-500', to: '/groups' },
  { label: 'Xonalar', value: s.rooms, icon: Building2, color: 'bg-amber-500', to: '/rooms' },
  { label: 'Aktiv slotlar', value: s.active_slots, icon: CalendarDays, color: 'bg-indigo-500', to: '/slots' },
  { label: 'Muammo slotlar', value: s.requires_action_slots, icon: AlertCircle, color: 'bg-red-500', to: '/slots' },
  { label: 'Critical xonalar', value: s.critical_rooms, icon: Building2, color: 'bg-orange-500', to: '/rooms' },
  { label: "O'qilmagan", value: s.unread_notifications, icon: Bell, color: 'bg-pink-500', to: '/notifications' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi
      .stats()
      .then((r: any) => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSpinner />

  const cards = stats ? statCards(stats) : []

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="card p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Xush kelibsiz! 👋</h2>
            <p className="text-indigo-100 text-sm">
              Dars jadvali tizimining umumiy holati
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Zap size={32} className="text-white" />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, to }) => (
          <Link
            key={label}
            to={to}
            className="card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg`}
              >
                <Icon size={22} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-800">
                  {value}
                </p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-slate-700 mb-4">
          Tezkor harakatlar
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Jadval ko'rish",
              to: '/timetable',
              color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
            },
            {
              label: "Slot qo'shish",
              to: '/slots',
              color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
            },
            {
              label: "O'qituvchi qo'shish",
              to: '/teachers',
              color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
            },
            {
              label: 'Bildirishnomalar',
              to: '/notifications',
              color: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
            },
          ].map(({ label, to, color }) => (
            <Link
              key={label}
              to={to}
              className={`${color} rounded-xl px-4 py-3 text-sm font-semibold text-center transition-colors`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}