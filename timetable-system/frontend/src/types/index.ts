// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'dispatcher' | 'teacher' | 'student'
  is_active: boolean
  created_at: string
}

export interface AuthToken {
  access_token: string
  token_type: string
  user: User
}

// ─── Teacher ─────────────────────────────────────────────────────────────────
export interface Availability {
  id: number
  teacher_id: number
  day_of_week: number
  start_time: string
  end_time: string
}

export interface Teacher {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  department?: string
  user_id?: number
  created_at: string
  availabilities?: Availability[]
}

// ─── Subject ─────────────────────────────────────────────────────────────────
export type SubjectType = 'lecture' | 'lab' | 'seminar' | 'computer_lab'

export interface Subject {
  id: number
  name: string
  code: string
  subject_type: SubjectType
  weekly_hours: number
  description?: string
  created_at: string
}

// ─── Group ───────────────────────────────────────────────────────────────────
export interface StudentGroup {
  id: number
  name: string
  faculty?: string
  semester: number
  student_count: number
  academic_year?: string
  created_at: string
}

// ─── Room ────────────────────────────────────────────────────────────────────
export type RoomType   = 'lecture' | 'lab' | 'seminar' | 'computer_lab'
export type RoomStatus = 'active' | 'maintenance' | 'critical'

export interface Equipment {
  id: number
  name: string
  description?: string
  created_at: string
}

export interface RoomEquipment {
  id: number
  equipment_id: number
  quantity: number
  equipment: Equipment
}

export interface Room {
  id: number
  name: string
  building?: string
  floor?: number
  capacity: number
  room_type: RoomType
  status: RoomStatus
  created_at: string
  equipments?: RoomEquipment[]
}

// ─── Slot ────────────────────────────────────────────────────────────────────
export type WeekType  = 'all' | 'odd' | 'even'
export type SlotStatus = 'active' | 'cancelled' | 'requires_action'

export interface Slot {
  id: number
  subject_id: number
  teacher_id: number
  group_id: number
  room_id: number
  day_of_week: number
  start_time: string
  end_time: string
  week_type: WeekType
  status: SlotStatus
  created_at: string
  updated_at?: string
  subject: Subject
  teacher: Teacher
  group: StudentGroup
  room: Room
}

export interface ConflictError {
  conflict_type: string
  message: string
  suggested_rooms?: Room[]
}

export interface SlotResponse {
  success: boolean
  slot?: Slot
  errors?: ConflictError[]
}

// ─── Notification ────────────────────────────────────────────────────────────
export interface Notification {
  id: number
  title: string
  message: string
  notification_type: string
  related_slot_id?: number
  is_read: boolean
  created_at: string
}

// ─── Audit Log ───────────────────────────────────────────────────────────────
export interface AuditLog {
  id: number
  user_id?: number
  action: string
  entity_type: string
  entity_id?: number
  old_values?: string
  new_values?: string
  description?: string
  created_at: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  teachers: number
  subjects: number
  groups: number
  rooms: number
  total_slots: number
  active_slots: number
  requires_action_slots: number
  critical_rooms: number
  unread_notifications: number
}
