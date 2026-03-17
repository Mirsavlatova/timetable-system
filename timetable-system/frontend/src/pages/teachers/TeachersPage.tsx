import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { teachersApi } from '../../api/services'
import type { Teacher } from '../../types'
import {
  PageHeader, SearchInput, PageSpinner, Empty,
  Modal, ConfirmDialog, Field, Spinner
} from '../../components/ui'

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']

const empty = { first_name:'', last_name:'', email:'', phone:'', department:'' }

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<Teacher | null>(null)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [availId, setAvailId]     = useState<number | null>(null)
  const [form, setForm]           = useState(empty)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)

  const [availForm, setAvailForm] = useState<{day_of_week:number;start_time:string;end_time:string}[]>([])

  const load = async (q?: string) => {
    setLoading(true)
    try { const r = await teachersApi.list(q); setTeachers(r.data) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const t = setTimeout(() => load(search || undefined), 300)
    return () => clearTimeout(t)
  }, [search])

  const openCreate = () => { setForm(empty); setEditItem(null); setModalOpen(true) }
  const openEdit   = (t: Teacher) => { setForm({ first_name:t.first_name, last_name:t.last_name, email:t.email, phone:t.phone||'', department:t.department||'' }); setEditItem(t); setModalOpen(true) }

  const openAvail = async (id: number) => {
    setAvailId(id)
    const r = await teachersApi.getAvailability(id)
    setAvailForm(r.data.map(a => ({ day_of_week: a.day_of_week, start_time: a.start_time, end_time: a.end_time })))
  }

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.email) { toast.error("Majburiy maydonlarni to'ldiring"); return }
    setSaving(true)
    try {
      if (editItem) { await teachersApi.update(editItem.id, form); toast.success('Yangilandi') }
      else { await teachersApi.create(form); toast.success("Qo'shildi") }
      setModalOpen(false); load()
    } catch (e: any) { toast.error(e.response?.data?.detail || 'Xato') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try { await teachersApi.delete(deleteId); toast.success("O'chirildi"); setDeleteId(null); load() }
    catch (e: any) { toast.error(e.response?.data?.detail || 'Xato') }
    finally { setDeleting(false) }
  }

  const handleSaveAvail = async () => {
    if (!availId) return
    try { await teachersApi.setAvailability(availId, availForm); toast.success('Availability saqlandi'); setAvailId(null) }
    catch { toast.error('Xato') }
  }

  const addAvailRow = () => setAvailForm(p => [...p, { day_of_week:0, start_time:'08:00', end_time:'17:00' }])
  const removeAvailRow = (i: number) => setAvailForm(p => p.filter((_,idx) => idx !== i))

  return (
    <div>
      <PageHeader
        title="O'qituvchilar"
        subtitle={`Jami: ${teachers.length} ta`}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={16}/>Qo'shish</button>}
      />

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Ism, bo'lim bo'yicha qidirish..." />
        </div>

        {loading ? <PageSpinner /> : teachers.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['#','Ism Familiya','Email','Telefon',"Bo'lim",'Amallar'].map(h=>(
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {teachers.map((t, i) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell text-slate-400 w-10">{i+1}</td>
                    <td className="table-cell font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                          {t.first_name[0]}{t.last_name[0]}
                        </div>
                        {t.first_name} {t.last_name}
                      </div>
                    </td>
                    <td className="table-cell text-slate-500">{t.email}</td>
                    <td className="table-cell text-slate-500">{t.phone || '—'}</td>
                    <td className="table-cell">
                      {t.department ? <span className="badge-blue">{t.department}</span> : '—'}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={()=>openAvail(t.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors" title="Availability"><Clock size={15}/></button>
                        <button onClick={()=>openEdit(t)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Pencil size={15}/></button>
                        <button onClick={()=>setDeleteId(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editItem ? 'Tahrirlash' : "O'qituvchi qo'shish"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ism" required><input className="input" value={form.first_name} onChange={e=>setForm(p=>({...p,first_name:e.target.value}))} placeholder="Akbar"/></Field>
            <Field label="Familiya" required><input className="input" value={form.last_name} onChange={e=>setForm(p=>({...p,last_name:e.target.value}))} placeholder="Toshmatov"/></Field>
          </div>
          <Field label="Email" required><input className="input" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="a.toshmatov@univ.uz"/></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefon"><input className="input" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+998901234567"/></Field>
            <Field label="Bo'lim"><input className="input" value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))} placeholder="Informatika"/></Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary" onClick={()=>setModalOpen(false)}>Bekor</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?<Spinner size="sm"/>:'Saqlash'}</button>
          </div>
        </div>
      </Modal>

      {/* Availability Modal */}
      <Modal open={availId!==null} onClose={()=>setAvailId(null)} title="Vaqt jadvali (Availability)" size="lg">
        <div className="space-y-3">
          {availForm.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <select className="input w-36" value={a.day_of_week} onChange={e=>setAvailForm(p=>p.map((x,idx)=>idx===i?{...x,day_of_week:+e.target.value}:x))}>
                {DAYS.map((d,di)=><option key={di} value={di}>{d}</option>)}
              </select>
              <input type="time" className="input w-32" value={a.start_time} onChange={e=>setAvailForm(p=>p.map((x,idx)=>idx===i?{...x,start_time:e.target.value}:x))}/>
              <span className="text-slate-400">—</span>
              <input type="time" className="input w-32" value={a.end_time} onChange={e=>setAvailForm(p=>p.map((x,idx)=>idx===i?{...x,end_time:e.target.value}:x))}/>
              <button onClick={()=>removeAvailRow(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={15}/></button>
            </div>
          ))}
          <button className="btn-secondary w-full" onClick={addAvailRow}><Plus size={14}/>Qator qo'shish</button>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary" onClick={()=>setAvailId(null)}>Bekor</button>
            <button className="btn-primary" onClick={handleSaveAvail}>Saqlash</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId!==null} onClose={()=>setDeleteId(null)} onConfirm={handleDelete}
        message="Bu o'qituvchini o'chirmoqchimisiz? Bu amal qaytarilmaydi." loading={deleting}/>
    </div>
  )
}
