import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  DndContext, DragEndEvent, DragStartEvent, DragOverlay,
  PointerSensor, useSensor, useSensors, useDroppable, useDraggable
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { timetableApi, slotsApi, groupsApi, teachersApi, roomsApi } from '../../api/services'
import type { Slot, StudentGroup, Teacher, Room } from '../../types'
import { PageSpinner } from '../../components/ui'
import { RefreshCw, Zap } from 'lucide-react'

const DAYS = ['Dushanba','Seshanba','Chorshanba','Payshanba','Juma']
const TIME_SLOTS = [
  { start:'08:00', end:'09:30' },
  { start:'09:45', end:'11:15' },
  { start:'11:30', end:'13:00' },
  { start:'13:30', end:'15:00' },
  { start:'15:15', end:'16:45' },
  { start:'17:00', end:'18:30' },
]

const SUBJECT_COLORS = [
  'bg-indigo-100 border-indigo-300 text-indigo-800',
  'bg-emerald-100 border-emerald-300 text-emerald-800',
  'bg-amber-100 border-amber-300 text-amber-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-cyan-100 border-cyan-300 text-cyan-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-teal-100 border-teal-300 text-teal-800',
]

function getColor(subjectId: number) {
  return SUBJECT_COLORS[subjectId % SUBJECT_COLORS.length]
}

// ─── Draggable slot card ──────────────────────────────────────────────────────
function SlotCard({ slot, compact = false }: { slot: Slot; compact?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: slot.id })
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }
  const color = getColor(slot.subject_id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${color} border rounded-lg p-2 cursor-grab active:cursor-grabbing select-none shadow-sm hover:shadow-md transition-shadow`}
      title={`${slot.subject.name} | ${slot.teacher.first_name} ${slot.teacher.last_name} | ${slot.room.name}`}
    >
      <p className="font-bold text-xs leading-tight truncate">{slot.subject.name}</p>
      {!compact && (
        <>
          <p className="text-[10px] truncate opacity-75 mt-0.5">{slot.teacher.first_name} {slot.teacher.last_name}</p>
          <p className="text-[10px] opacity-60">{slot.room.name}</p>
        </>
      )}
    </div>
  )
}

// ─── Droppable cell ───────────────────────────────────────────────────────────
function TimeCell({ day, timeSlot, slots }: { day: number; timeSlot: typeof TIME_SLOTS[0]; slots: Slot[] }) {
  const id = `${day}_${timeSlot.start}`
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[80px] p-1.5 border border-slate-100 rounded-xl transition-colors ${
        isOver ? 'bg-indigo-50 border-indigo-300 border-dashed' : 'bg-white hover:bg-slate-50'
      }`}
    >
      {slots.map(s => <SlotCard key={s.id} slot={s} />)}
    </div>
  )
}

// ─── Main Timetable Page ──────────────────────────────────────────────────────
type ViewMode = 'group' | 'teacher' | 'room'

export default function TimetablePage() {
  const [slots, setSlots]       = useState<Slot[]>([])
  const [loading, setLoading]   = useState(false)
  const [generating, setGen]    = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('group')
  const [selectedId, setSelectedId] = useState<number>(0)
  const [groups, setGroups]     = useState<StudentGroup[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [rooms, setRooms]       = useState<Room[]>([])
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    groupsApi.list().then(r => { setGroups(r.data); if (r.data[0]) setSelectedId(r.data[0].id) })
    teachersApi.list().then(r => setTeachers(r.data))
    roomsApi.list().then(r => setRooms(r.data))
  }, [])

  const loadSlots = useCallback(async () => {
    if (!selectedId) return
    setLoading(true)
    try {
      let r
      if (viewMode === 'group')   r = await timetableApi.byGroup(selectedId)
      else if (viewMode==='teacher') r = await timetableApi.byTeacher(selectedId)
      else                        r = await timetableApi.byRoom(selectedId)
      setSlots(r.data.filter((s: Slot) => s.status === 'active'))
    } finally { setLoading(false) }
  }, [viewMode, selectedId])

  useEffect(() => { if (selectedId) loadSlots() }, [loadSlots, selectedId])

  // Update selector list and reset selection when viewMode changes
  useEffect(() => {
    if (viewMode === 'group'   && groups[0])   setSelectedId(groups[0].id)
    if (viewMode === 'teacher' && teachers[0]) setSelectedId(teachers[0].id)
    if (viewMode === 'room'    && rooms[0])    setSelectedId(rooms[0].id)
  }, [viewMode])

  const getSlotsFor = (day: number, timeSlot: typeof TIME_SLOTS[0]) =>
    slots.filter(s =>
      s.day_of_week === day &&
      s.start_time.slice(0,5) === timeSlot.start
    )

  const handleDragStart = (e: DragStartEvent) => {
    const slot = slots.find(s => s.id === e.active.id)
    setActiveSlot(slot || null)
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveSlot(null)
    const { active, over } = e
    if (!over) return
    const slotId = active.id as number
    const [dayStr, startTime] = (over.id as string).split('_')
    const newDay = parseInt(dayStr)
    const slot = slots.find(s => s.id === slotId)
    if (!slot) return
    if (slot.day_of_week === newDay && slot.start_time.slice(0,5) === startTime) return

    const ts = TIME_SLOTS.find(t => t.start === startTime)
    if (!ts) return

    try {
      const res = await slotsApi.dragDrop(slotId, {
        day_of_week: newDay,
        start_time: ts.start + ':00',
        end_time:   ts.end + ':00',
        room_id:    slot.room_id,
      })
      if (res.data.success) {
        toast.success('Slot ko\'chirildi! ✅')
        loadSlots()
      } else {
        const msgs = res.data.errors?.map((e: any) => e.message).join('; ')
        toast.error(`Konflikt: ${msgs}`)
      }
    } catch { toast.error('Xato yuz berdi') }
  }

  const handleGenerate = async () => {
    setGen(true)
    try {
      const r = await timetableApi.generate()
      toast.success(`Jadval yaratildi: ${r.data.created} slot`)
      loadSlots()
    } catch { toast.error('Jadval yaratishda xato') }
    finally { setGen(false) }
  }

  const entityList = viewMode === 'group' ? groups : viewMode === 'teacher' ? teachers : rooms
  const getLabel = (item: any) =>
    viewMode === 'teacher' ? `${item.first_name} ${item.last_name}` : item.name

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card p-4 flex flex-wrap items-center gap-4">
        {/* View mode tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {(['group','teacher','room'] as ViewMode[]).map(m => (
            <button key={m} onClick={()=>setViewMode(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                viewMode===m ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {m==='group'?'Guruh':m==='teacher'?"O'qituvchi":'Xona'}
            </button>
          ))}
        </div>

        {/* Entity selector */}
        <select
          className="input w-56"
          value={selectedId}
          onChange={e => setSelectedId(+e.target.value)}
        >
          {entityList.map((item: any) => (
            <option key={item.id} value={item.id}>{getLabel(item)}</option>
          ))}
        </select>

        <button onClick={loadSlots} className="btn-secondary">
          <RefreshCw size={15} />Yangilash
        </button>

        <button onClick={handleGenerate} className="btn-primary ml-auto" disabled={generating}>
          {generating ? <span className="animate-spin inline-block">⚙️</span> : <Zap size={15}/>}
          {generating ? 'Yaratilmoqda...' : 'Auto Jadval'}
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="font-semibold">Ko'rsatma:</span>
        <span className="bg-indigo-50 border border-indigo-200 rounded px-2 py-0.5">Darsni sudrab boshqa vaqtga olib boring</span>
        <span className="text-slate-400">• Konflikt bo'lsa harakatga ruxsat berilmaydi</span>
      </div>

      {/* Grid */}
      {loading ? <PageSpinner /> : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Header */}
                <div className="grid bg-slate-900 text-white" style={{gridTemplateColumns:'100px repeat(5, 1fr)'}}>
                  <div className="px-3 py-3 text-xs font-semibold text-slate-400 text-center">Vaqt</div>
                  {DAYS.map(d => (
                    <div key={d} className="px-3 py-3 text-xs font-bold text-center">{d}</div>
                  ))}
                </div>

                {/* Rows */}
                {TIME_SLOTS.map(ts => (
                  <div key={ts.start} className="grid border-t border-slate-100"
                    style={{gridTemplateColumns:'100px repeat(5, 1fr)'}}>
                    {/* Time label */}
                    <div className="px-2 py-3 flex flex-col items-center justify-center bg-slate-50 border-r border-slate-100">
                      <span className="text-xs font-bold text-slate-700 font-mono">{ts.start}</span>
                      <span className="text-[10px] text-slate-400">—</span>
                      <span className="text-xs font-bold text-slate-700 font-mono">{ts.end}</span>
                    </div>
                    {/* Day cells */}
                    {DAYS.map((_, dayIdx) => (
                      <div key={dayIdx} className="p-1.5 border-r border-slate-50 last:border-0">
                        <TimeCell
                          day={dayIdx}
                          timeSlot={ts}
                          slots={getSlotsFor(dayIdx, ts)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drag overlay */}
          <DragOverlay>
            {activeSlot && (
              <div className={`${getColor(activeSlot.subject_id)} border rounded-lg p-2 shadow-2xl w-44 opacity-90`}>
                <p className="font-bold text-xs">{activeSlot.subject.name}</p>
                <p className="text-[10px]">{activeSlot.teacher.first_name} {activeSlot.teacher.last_name}</p>
                <p className="text-[10px]">{activeSlot.room.name}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
