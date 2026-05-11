import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { equipmentApi } from '../../api/services'
import type { Equipment } from '../../types'
import { PageHeader, PageSpinner, Empty, Modal, ConfirmDialog, Field, Spinner } from '../../components/ui'

const empty = { name: '', description: '' }

export default function EquipmentPage() {
  const [items, setItems]       = useState<Equipment[]>([])
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<Equipment | null>(null)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [form, setForm]           = useState(empty)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)

  const load = async () => {
    setLoading(true)
    try { const r = await equipmentApi.list(); setItems(r.data) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(empty); setEditItem(null); setModalOpen(true) }
  const openEdit   = (e: Equipment) => { setForm({ name: e.name, description: e.description||'' }); setEditItem(e); setModalOpen(true) }

  const handleSave = async () => {
    if (!form.name) { toast.error("Jihoz nomini kiriting"); return }
    setSaving(true)
    try {
      if (editItem) { await equipmentApi.update(editItem.id, form); toast.success('Yangilandi') }
      else { await equipmentApi.create(form); toast.success("Qo'shildi") }
      setModalOpen(false); load()
    } catch (e: any) { toast.error(e.response?.data?.detail || 'Xato') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try { await equipmentApi.delete(deleteId); toast.success("O'chirildi"); setDeleteId(null); load() }
    catch (e: any) { toast.error(e.response?.data?.detail || 'Xato') }
    finally { setDeleting(false) }
  }

  return (
    <div>
      <PageHeader
        title="Jihozlar"
        subtitle={`Jami: ${items.length} ta`}
        action={<button className="btn-primary" onClick={openCreate}><Plus size={16}/>Qo'shish</button>}
      />
      <div className="card overflow-hidden">
        {loading ? <PageSpinner /> : items.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{['#','Nomi','Tavsif','Amallar'].map(h=><th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((eq, i) => (
                  <tr key={eq.id} className="hover:bg-slate-50">
                    <td className="table-cell text-slate-400 w-10">{i+1}</td>
                    <td className="table-cell font-semibold">{eq.name}</td>
                    <td className="table-cell text-slate-500">{eq.description || '—'}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={()=>openEdit(eq)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600"><Pencil size={15}/></button>
                        <button onClick={()=>setDeleteId(eq.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editItem?"Tahrirlash":"Jihoz qo'shish"} size="sm">
        <div className="space-y-4">
          <Field label="Nomi" required><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Proyektor"/></Field>
          <Field label="Tavsif"><textarea className="input h-20 resize-none" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Qisqacha tavsif..."/></Field>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary" onClick={()=>setModalOpen(false)}>Bekor</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?<Spinner size="sm"/>:'Saqlash'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId!==null} onClose={()=>setDeleteId(null)} onConfirm={handleDelete}
        message="Bu jihozni o'chirmoqchimisiz?" loading={deleting}/>
    </div>
  )
}
