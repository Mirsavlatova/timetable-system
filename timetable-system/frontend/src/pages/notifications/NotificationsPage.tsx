import { useEffect, useState } from 'react'
import { Bell, CheckCheck, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { notificationsApi } from '../../api/services'
import type { Notification } from '../../types'
import { PageHeader, PageSpinner, Empty } from '../../components/ui'
import { formatDistanceToNow } from 'date-fns'

const typeIcons: Record<string, any> = {
  info:    { icon: Info,          cls: 'text-blue-500 bg-blue-50' },
  warning: { icon: AlertTriangle, cls: 'text-amber-500 bg-amber-50' },
  error:   { icon: AlertCircle,   cls: 'text-red-500 bg-red-50' },
  success: { icon: Bell,          cls: 'text-emerald-500 bg-emerald-50' },
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { const r = await notificationsApi.list(); setNotifs(r.data) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const markAllRead = async () => {
    const unread = notifs.filter(n => !n.is_read).map(n => n.id)
    if (!unread.length) { toast("Barcha bildirishnomalar o'qilgan"); return }
    await notificationsApi.markRead(unread)
    toast.success("Barchasi o'qildi deb belgilandi")
    load()
  }

  const unreadCount = notifs.filter(n => !n.is_read).length

  return (
    <div>
      <PageHeader
        title="Bildirishnomalar"
        subtitle={unreadCount > 0 ? `${unreadCount} ta o'qilmagan` : 'Barchasi o\'qilgan'}
        action={
          <button className="btn-secondary" onClick={markAllRead}>
            <CheckCheck size={15}/>Barchasini o'qildi deb belgilash
          </button>
        }
      />

      {loading ? <PageSpinner /> : notifs.length === 0 ? (
        <div className="card p-16"><Empty message="Bildirishnoma yo'q" /></div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => {
            const t = typeIcons[n.notification_type] || typeIcons.info
            const Icon = t.icon
            return (
              <div key={n.id} className={`card p-4 flex items-start gap-4 transition-all ${n.is_read ? 'opacity-60' : ''}`}>
                <div className={`w-10 h-10 rounded-xl ${t.cls} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-800">{n.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500"/>}
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  {n.related_slot_id && (
                    <p className="text-xs text-slate-400 mt-1">Slot #{n.related_slot_id}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
