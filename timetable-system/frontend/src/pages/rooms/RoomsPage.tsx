import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { roomsApi } from '../../api/services'
import type { Room, RoomType, RoomStatus } from '../../types'
import { PageHeader, SearchInput, PageSpinner, Empty, Modal, ConfirmDialog, Field, Spinner } from '../../components/ui'

const RTYPES: {value:RoomType;label:string}[] = [
  {value:'lecture',label:"Ma'ruza"},
  {value:'lab',label:'Laboratoriya'},
  {value:'seminar',label:'Seminar'},
  {value:'computer_lab',label:'Kompyuter lab'},
]
const STATUSES: {value:RoomStatus;label:string;cls:string}[] = [
  {value:'active',label:'Faol',cls:'badge-green'},
  {value:'maintenance',label:'Ta\'mirlash',cls:'badge-yellow'},
  {value:'critical',label:'Kritik',cls:'badge-red'},
]

const empty = { name:'', building:'', floor:1, capacity:30, room_type:'lecture' as RoomType, status:'active' as RoomStatus }

export default function RoomsPage() {
  const [rooms, setRooms]       = useState<Room[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<Room | null>(null)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [form, setForm]           = useState(empty)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [statusRoom, setStatusRoom] = useState<Room | null>(null)
  const [newStatus, setNewStatus]   = useState<RoomStatus>('active')

  const load = async (q?: string) => {
    setLoading(true)
    try { const r = await roomsApi.list(q); setRooms(r.data) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const t = setTimeout(() => load(search || undefined), 300)
    return () => clearTimeout(t)
  }, [search])

  const openCreate = () => { setForm(empty); setEditItem(null); setModalOpen(true) }
  const openEdit   = (r: Room) => {
    setForm({ name:r.name, building:r.building||'', floor:r.floor||1, capacity:r.capacity, room_type:r.room_type, status:r.status })
    setEditItem(r); setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) { toast.error("Xona nomini kiriting"); return }
    setSaving(true)
    try {
      if (editItem) { await roomsApi.update(editItem.id, form); toast.success('Yangilandi') }
      else { await roomsApi.create(form); toast.success("Qo'shildi") }
      setModalOpen(false); load()
    } catch (e: any) { toast.error(e.response?.data?.detail || 'Xato') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try { await roomsApi.delete(deleteId); toast.success("O'chirildi"); setDeleteId(null); load() }
    catch (e: any) { toast.error(e.response?.data?.detail || 'Xato') }
    finally { setDeleting(false) }
  }

  const handleStatusUpdate = async () => {
    if (!statusRoom) return
    try {
      const r = await roomsApi.updateStatus(statusRoom.id, newStatus)
      if (newStatus === 'critical' && r.data.relocation) {
        const { relocated, requires_action } = r.data.relocation
        toast.success(`${relocated.length} slot ko'chirildi, ${requires_action.length} ta harakatni talab qiladi`)
      } else {
        toast.success('Holat yangilandi')
      }
      setStatusRoom(null); load()
    } catch { toast.error('Xato') }
  }

  const statusInfo = (s: RoomStatus) => STATUSES.find(x=>x.value===s)!

  return (
    <div>
      <PageHeader
        title="Xonalar"
        subtitle={`Jami: ${rooms.length} ta`}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={16}/>Qo'shish</button>}
      />
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SearchInput value={search} onChange={setSearch} placeholder="Xona nomi, bino..." />
        </div>
        {loading ? <PageSpinner /> : rooms.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['#','Xona','Bino','Qavat','Sig\'im','Turi','Holati','Amallar'].map(h=><th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rooms.map((r, i) => {
                  const si = statusInfo(r.status)
                  return (
                    <tr key={r.id} className={`hover:bg-slate-50 ${r.status==='critical'?'bg-red-50/30':''}`}>
                      <td className="table-cell text-slate-400">{i+1}</td>
                      <td className="table-cell font-bold">{r.name}</td>
                      <td className="table-cell text-slate-500">{r.building||'—'}</td>
                      <td className="table-cell">{r.floor ?? '—'}</td>
                      <td className="table-cell">{r.capacity} kishi</td>
                      <td className="table-cell"><span className="badge-blue">{RTYPES.find(t=>t.value===r.room_type)?.label}</span></td>
                      <td className="table-cell">
                        <button onClick={()=>{setStatusRoom(r);setNewStatus(r.status)}} className={`${si.cls} cursor-pointer hover:opacity-80 transition-opacity`}>
                          {r.status==='critical'&&<AlertTriangle size={11} className="inline mr-1"/>}
                          {si.label}
                        </button>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          <button onClick={()=>openEdit(r)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600"><Pencil size={15}/></button>
                          <button onClick={()=>setDeleteId(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 size={15}/></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editItem?'Tahrirlash':"Xona qo'shish"}>
        <div className="space-y-4">
          <Field label="Xona nomi" required><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="101-xona"/></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bino"><input className="input" value={form.building} onChange={e=>setForm(p=>({...p,building:e.target.value}))} placeholder="A-korpus"/></Field>
            <Field label="Qavat"><input className="input" type="number" value={form.floor} onChange={e=>setForm(p=>({...p,floor:+e.target.value}))}/></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sig'im (kishi)"><input className="input" type="number" min={1} value={form.capacity} onChange={e=>setForm(p=>({...p,capacity:+e.target.value}))}/></Field>
            <Field label="Turi">
              <select className="input" value={form.room_type} onChange={e=>setForm(p=>({...p,room_type:e.target.value as RoomType}))}>
                {RTYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary" onClick={()=>setModalOpen(false)}>Bekor</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?<Spinner size="sm"/>:'Saqlash'}</button>
          </div>
        </div>
      </Modal>

      {/* Status Modal */}
      <Modal open={statusRoom!==null} onClose={()=>setStatusRoom(null)} title="Xona holatini o'zgartirish" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Xona: <strong>{statusRoom?.name}</strong></p>
          {newStatus === 'critical' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0"/>
              <span>DIQQAT! Kritik holat belgilansa, barcha slotlar boshqa xonalarga ko'chirilishga harakat qilinadi.</span>
            </div>
          )}
          <Field label="Yangi holat">
            <select className="input" value={newStatus} onChange={e=>setNewStatus(e.target.value as RoomStatus)}>
              {STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={()=>setStatusRoom(null)}>Bekor</button>
            <button className="btn-primary" onClick={handleStatusUpdate}>Saqlash</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId!==null} onClose={()=>setDeleteId(null)} onConfirm={handleDelete}
        message="Bu xonani o'chirmoqchimisiz?" loading={deleting}/>
    </div>
  )
}
