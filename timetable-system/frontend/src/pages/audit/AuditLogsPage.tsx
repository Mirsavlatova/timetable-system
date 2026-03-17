import { useEffect, useState } from 'react'
import { auditApi } from '../../api/services'
import type { AuditLog } from '../../types'
import { PageHeader, PageSpinner, Empty } from '../../components/ui'
import { formatDistanceToNow } from 'date-fns'

const actionColors: Record<string, string> = {
  create:       'badge-green',
  update:       'badge-blue',
  delete:       'badge-red',
  relocate:     'badge-yellow',
  status_change:'badge-purple',
}

export default function AuditLogsPage() {
  const [logs, setLogs]     = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    auditApi.list().then(r => setLogs(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="Audit Jurnali" subtitle={`Jami: ${logs.length} ta yozuv`} />

      <div className="card overflow-hidden">
        {loading ? <PageSpinner /> : logs.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['Vaqt','Amal','Entity','Entity ID','Tavsif','Foydalanuvchi'].map(h=>(
                  <th key={h} className="table-header">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="table-cell text-xs text-slate-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
                    </td>
                    <td className="table-cell">
                      <span className={actionColors[l.action] || 'badge-gray'}>{l.action}</span>
                    </td>
                    <td className="table-cell font-mono text-xs">{l.entity_type}</td>
                    <td className="table-cell text-slate-400">{l.entity_id ?? '—'}</td>
                    <td className="table-cell text-slate-600 max-w-xs truncate">{l.description || '—'}</td>
                    <td className="table-cell text-slate-400">{l.user_id ? `#${l.user_id}` : 'system'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
