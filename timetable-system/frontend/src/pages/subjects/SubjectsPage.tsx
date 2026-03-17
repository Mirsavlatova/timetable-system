import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { subjectsApi } from '../../api/services'
import type { Subject, SubjectType } from '../../types'
import { PageHeader, SearchInput, PageSpinner, Empty, Modal, ConfirmDialog, Field, Spinner } from '../../components/ui'

const TYPES: { value: SubjectType; label: string }[] = [
  { value: 'lecture',      label: 'Ma\'ruza' },
  { value: 'lab',          label: 'Laboratoriya' },
  { value: 'seminar',      label: 'Seminar' },
  { value: 'computer_lab', label: 'Kompyuter lab' },
]

const typeColors: Record<SubjectType, string> = {
  lecture:      'badge-blue',
  lab:          'badge-green',
  seminar:      'badge-purple',
  computer_lab: 'badge-yellow',
}

const empty = { name:'', code:'', subject_type:'lecture' as SubjectType, weekly_hours:2, description:'' }

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<Subject | null>(null)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [form, setForm]           = useState(empty)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)

  const load = async (q?: string) => {
    setLoading(true)
    try { const r = await subjectsApi.list(q); setSubjects(r.data) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const t = setTimeout(() => load(search || undefined), 300)
    return () => clearTimeout(t)
  }, [search])

  const openCreate = () => { setForm(empty); setEditItem(null); setModalOpen(true) }
  const openEdit   = (s: Subject) => { setForm({ name:s.name, code:s.code, subject_type:s.subject_type, weekly_hours:s.weekly_hours, description:s.description||'' }); setEditItem(s); setModalOpen(true) }

  const handleSave = async () => {
    if (!form.name || !form.code) { toast.error("Majburiy maydonlarni to'ldiring"); return }
    setSaving(true)
    try {
      if (editItem) { await subjectsApi.update(editItem.id, form); toast.success('Yangilandi') }
      else { await subjectsApi.create(form); toast.success("Qo'shildi") }
      setModalOpen(false); load()
    } catch (e: any) { toast.error(e.response?.data?.detail || 'Xato') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try { await subjectsApi.delete(deleteId); toast.success("O'chirildi"); setDeleteId(null); load() }
    catch (e: any) { toast.error(e.response?.data?.detail || 'Xato') }
    finally { setDeleting(false) }
  }

  return (
    <div>
      <PageHeader
        title="Fanlar"
        subtitle={`Jami: ${subjects.length} ta`}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={16}/>Qo'shish</button>}
      />
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SearchInput value={search} onChange={setSearch} placeholder="Fan nomi, kod bo'yicha..." />
        </div>
        {loading ? <PageSpinner /> : subjects.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['#','Nomi','Kodi','Turi','Haftalik soat','Amallar'].map(h=><th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subjects.map((s, i) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="table-cell text-slate-400">{i+1}</td>
                    <td className="table-cell font-semibold">{s.name}</td>
                    <td className="table-cell"><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{s.code}</span></td>
                    <td className="table-cell"><span className={typeColors[s.subject_type]}>{TYPES.find(t=>t.value===s.subject_type)?.label}</span></td>
                    <td className="table-cell text-center">{s.weekly_hours}h</td>
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

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editItem ? 'Tahrirlash' : "Fan qo'shish"}>
        <div className="space-y-4">
          <Field label="Fan nomi" required><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Matematika"/></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Kod" required><input className="input" value={form.code} onChange={e=>setForm(p=>({...p,code:e.target.value}))} placeholder="MATH101"/></Field>
            <Field label="Haftalik soat">
              <input className="input" type="number" min={1} max={10} value={form.weekly_hours} onChange={e=>setForm(p=>({...p,weekly_hours:+e.target.value}))}/>
            </Field>
          </div>
          <Field label="Fan turi">
            <select className="input" value={form.subject_type} onChange={e=>setForm(p=>({...p,subject_type:e.target.value as SubjectType}))}>
              {TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Tavsif"><textarea className="input h-20 resize-none" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Qisqacha tavsif..."/></Field>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary" onClick={()=>setModalOpen(false)}>Bekor</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?<Spinner size="sm"/>:'Saqlash'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId!==null} onClose={()=>setDeleteId(null)} onConfirm={handleDelete}
        message="Bu fanni o'chirmoqchimisiz?" loading={deleting}/>
    </div>
  )
}
