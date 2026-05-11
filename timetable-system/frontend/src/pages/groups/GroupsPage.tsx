import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { groupsApi } from '../../api/services'
import type { StudentGroup } from '../../types'
import { PageHeader, SearchInput, PageSpinner, Empty, Modal, ConfirmDialog, Field, Spinner } from '../../components/ui'

const empty = { name:'', faculty:'', semester:1, student_count:25, academic_year:'2024-2025' }

export default function GroupsPage() {
  const [groups, setGroups]     = useState<StudentGroup[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<StudentGroup | null>(null)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [form, setForm]           = useState(empty)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)

  const load = async (q?: string) => {
    setLoading(true)
    try { const r = await groupsApi.list(q); setGroups(r.data) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const t = setTimeout(() => load(search || undefined), 300)
    return () => clearTimeout(t)
  }, [search])

  const openCreate = () => { setForm(empty); setEditItem(null); setModalOpen(true) }
  const openEdit   = (g: StudentGroup) => {
    setForm({ name:g.name, faculty:g.faculty||'', semester:g.semester, student_count:g.student_count, academic_year:g.academic_year||'' })
    setEditItem(g); setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) { toast.error("Guruh nomini kiriting"); return }
    setSaving(true)
    try {
      if (editItem) { await groupsApi.update(editItem.id, form); toast.success('Yangilandi') }
      else { await groupsApi.create(form); toast.success("Qo'shildi") }
      setModalOpen(false); load()
    } catch (e: any) { toast.error(e.response?.data?.detail || 'Xato') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try { await groupsApi.delete(deleteId); toast.success("O'chirildi"); setDeleteId(null); load() }
    catch (e: any) { toast.error(e.response?.data?.detail || 'Xato') }
    finally { setDeleting(false) }
  }

  return (
    <div>
      <PageHeader
        title="Guruhlar"
        subtitle={`Jami: ${groups.length} ta`}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={16}/>Qo'shish</button>}
      />
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <SearchInput value={search} onChange={setSearch} placeholder="Guruh nomi, fakultet..." />
        </div>
        {loading ? <PageSpinner /> : groups.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['#','Guruh','Fakultet','Semester','Talabalar','O\'quv yili','Amallar'].map(h=><th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {groups.map((g, i) => (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="table-cell text-slate-400">{i+1}</td>
                    <td className="table-cell font-bold text-indigo-700">{g.name}</td>
                    <td className="table-cell">{g.faculty || '—'}</td>
                    <td className="table-cell"><span className="badge-purple">{g.semester}-semester</span></td>
                    <td className="table-cell">{g.student_count} ta</td>
                    <td className="table-cell text-slate-500">{g.academic_year || '—'}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={()=>openEdit(g)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600"><Pencil size={15}/></button>
                        <button onClick={()=>setDeleteId(g.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editItem ? 'Tahrirlash' : "Guruh qo'shish"}>
        <div className="space-y-4">
          <Field label="Guruh nomi" required><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="CS-101"/></Field>
          <Field label="Fakultet"><input className="input" value={form.faculty} onChange={e=>setForm(p=>({...p,faculty:e.target.value}))} placeholder="Informatika"/></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Semester"><input className="input" type="number" min={1} max={10} value={form.semester} onChange={e=>setForm(p=>({...p,semester:+e.target.value}))}/></Field>
            <Field label="Talabalar soni"><input className="input" type="number" min={1} value={form.student_count} onChange={e=>setForm(p=>({...p,student_count:+e.target.value}))}/></Field>
          </div>
          <Field label="O'quv yili"><input className="input" value={form.academic_year} onChange={e=>setForm(p=>({...p,academic_year:e.target.value}))} placeholder="2024-2025"/></Field>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary" onClick={()=>setModalOpen(false)}>Bekor</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?<Spinner size="sm"/>:'Saqlash'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId!==null} onClose={()=>setDeleteId(null)} onConfirm={handleDelete}
        message="Bu guruhni o'chirmoqchimisiz?" loading={deleting}/>
    </div>
  )
}
