import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { slotsApi, teachersApi, subjectsApi, groupsApi, roomsApi } from '../../api/services'
import type { Slot, Teacher, Subject, StudentGroup, Room, WeekType } from '../../types'
import { PageHeader, PageSpinner, Empty, Modal, ConfirmDialog, Field, Spinner } from '../../components/ui'

const DAYS = ['Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba','Yakshanba']
const WEEK_TYPES: {value:WeekType;label:string}[] = [
  {value:'all',label:'Har hafta'},
  {value:'odd',label:'Toq hafta'},
  {value:'even',label:'Juft hafta'},
]
const statusCls: Record<string,string> = {
  active:'badge-green', cancelled:'badge-gray', requires_action:'badge-red'
}

const emptyForm = {
  subject_id:0, teacher_id:0, group_id:0, room_id:0,
  day_of_week:0, start_time:'08:00', end_time:'09:30', week_type:'all' as WeekType
}

export default function SlotsPage() {
  const [slots, setSlots]     = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [groups, setGroups]     = useState<StudentGroup[]>([])
  const [rooms, setRooms]       = useState<Room[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<Slot | null>(null)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [conflicts, setConflicts] = useState<{conflict_type:string;message:string}[]>([])

  const load = async () => {
    setLoading(true)
    try { const r = await slotsApi.list(); setSlots(r.data) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    teachersApi.list().then(r=>setTeachers(r.data))
    subjectsApi.list().then(r=>setSubjects(r.data))
    groupsApi.list().then(r=>setGroups(r.data))
    roomsApi.list().then(r=>setRooms(r.data))
  }, [])

  const openCreate = () => { setForm(emptyForm); setEditItem(null); setConflicts([]); setModalOpen(true) }
  const openEdit   = (s: Slot) => {
    setForm({
      subject_id:s.subject_id, teacher_id:s.teacher_id, group_id:s.group_id, room_id:s.room_id,
      day_of_week:s.day_of_week, start_time:s.start_time, end_time:s.end_time, week_type:s.week_type
    })
    setConflicts([])
    setEditItem(s); setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.subject_id||!form.teacher_id||!form.group_id||!form.room_id) {
      toast.error("Barcha maydonlarni to'ldiring"); return
    }
    setSaving(true)
    setConflicts([])
    try {
      const r = editItem
        ? await slotsApi.update(editItem.id, form)
        : await slotsApi.create(form)
      if (r.data.success) {
        toast.success(editItem ? 'Yangilandi' : "Qo'shildi")
        setModalOpen(false); load()
      } else {
        setConflicts(r.data.errors || [])
        toast.error('Konflikt aniqlandi!')
      }
    } catch (e: any) { toast.error(e.response?.data?.detail || 'Xato') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try { await slotsApi.delete(deleteId); toast.success("O'chirildi"); setDeleteId(null); load() }
    catch (e: any) { toast.error(e.response?.data?.detail || 'Xato') }
    finally { setDeleting(false) }
  }

  return (
    <div>
      <PageHeader
        title="Slotlar"
        subtitle={`Jami: ${slots.length} ta`}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={16}/>Qo'shish</button>}
      />
      <div className="card overflow-hidden">
        {loading ? <PageSpinner /> : slots.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['#','Fan','O\'qituvchi','Guruh','Xona','Kun','Vaqt','Holat','Amallar'].map(h=><th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {slots.map((s, i) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="table-cell text-slate-400">{i+1}</td>
                    <td className="table-cell">
                      <div className="font-semibold text-slate-800">{s.subject.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{s.subject.code}</div>
                    </td>
                    <td className="table-cell">{s.teacher.first_name} {s.teacher.last_name}</td>
                    <td className="table-cell"><span className="badge-purple">{s.group.name}</span></td>
                    <td className="table-cell">{s.room.name}</td>
                    <td className="table-cell">{DAYS[s.day_of_week]}</td>
                    <td className="table-cell text-xs font-mono">{s.start_time.slice(0,5)}–{s.end_time.slice(0,5)}</td>
                    <td className="table-cell"><span className={statusCls[s.status]}>{s.status}</span></td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={()=>openEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600"><Pencil size={15}/></button>
                        <button onClick={()=>setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editItem?'Slotni tahrirlash':"Slot qo'shish"} size="lg">
        <div className="space-y-4">
          {conflicts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
              {conflicts.map((c,i)=>(
                <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0"/>
                  <span><strong>{c.conflict_type}:</strong> {c.message}</span>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fan" required>
              <select className="input" value={form.subject_id} onChange={e=>setForm(p=>({...p,subject_id:+e.target.value}))}>
                <option value={0}>Fan tanlang...</option>
                {subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="O'qituvchi" required>
              <select className="input" value={form.teacher_id} onChange={e=>setForm(p=>({...p,teacher_id:+e.target.value}))}>
                <option value={0}>O'qituvchi tanlang...</option>
                {teachers.map(t=><option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Guruh" required>
              <select className="input" value={form.group_id} onChange={e=>setForm(p=>({...p,group_id:+e.target.value}))}>
                <option value={0}>Guruh tanlang...</option>
                {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
            <Field label="Xona" required>
              <select className="input" value={form.room_id} onChange={e=>setForm(p=>({...p,room_id:+e.target.value}))}>
                <option value={0}>Xona tanlang...</option>
                {rooms.map(r=><option key={r.id} value={r.id}>{r.name} ({r.capacity} kishi)</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Kun">
              <select className="input" value={form.day_of_week} onChange={e=>setForm(p=>({...p,day_of_week:+e.target.value}))}>
                {DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}
              </select>
            </Field>
            <Field label="Boshlanish"><input className="input" type="time" value={form.start_time} onChange={e=>setForm(p=>({...p,start_time:e.target.value}))}/></Field>
            <Field label="Tugash"><input className="input" type="time" value={form.end_time} onChange={e=>setForm(p=>({...p,end_time:e.target.value}))}/></Field>
          </div>
          <Field label="Hafta turi">
            <select className="input" value={form.week_type} onChange={e=>setForm(p=>({...p,week_type:e.target.value as WeekType}))}>
              {WEEK_TYPES.map(w=><option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary" onClick={()=>setModalOpen(false)}>Bekor</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?<Spinner size="sm"/>:'Tekshir va Saqlash'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId!==null} onClose={()=>setDeleteId(null)} onConfirm={handleDelete}
        message="Bu slotni o'chirmoqchimisiz?" loading={deleting}/>
    </div>
  )
}
