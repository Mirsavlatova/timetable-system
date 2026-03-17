import api from './client'
import type {
  AuthToken, Teacher, Availability, Subject, StudentGroup,
  Room, Equipment, Slot, SlotResponse, Notification, AuditLog, DashboardStats
} from '../types'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    api.post<AuthToken>('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard/stats'),
}

// ─── Teachers ────────────────────────────────────────────────────────────────
export const teachersApi = {
  list:   (search?: string) => api.get<Teacher[]>('/teachers', { params: search ? { search } : {} }),
  get:    (id: number)      => api.get<Teacher>(`/teachers/${id}`),
  create: (data: Partial<Teacher>) => api.post<Teacher>('/teachers', data),
  update: (id: number, data: Partial<Teacher>) => api.put<Teacher>(`/teachers/${id}`, data),
  delete: (id: number)      => api.delete(`/teachers/${id}`),
  getAvailability:  (id: number)  => api.get<Availability[]>(`/teachers/${id}/availability`),
  setAvailability:  (id: number, data: Omit<Availability, 'id' | 'teacher_id'>[]) =>
    api.put<Availability[]>(`/teachers/${id}/availability`, data),
}

// ─── Subjects ─────────────────────────────────────────────────────────────────
export const subjectsApi = {
  list:   (search?: string) => api.get<Subject[]>('/subjects', { params: search ? { search } : {} }),
  get:    (id: number)      => api.get<Subject>(`/subjects/${id}`),
  create: (data: Partial<Subject>) => api.post<Subject>('/subjects', data),
  update: (id: number, data: Partial<Subject>) => api.put<Subject>(`/subjects/${id}`, data),
  delete: (id: number)      => api.delete(`/subjects/${id}`),
}

// ─── Groups ───────────────────────────────────────────────────────────────────
export const groupsApi = {
  list:   (search?: string) => api.get<StudentGroup[]>('/groups', { params: search ? { search } : {} }),
  get:    (id: number)      => api.get<StudentGroup>(`/groups/${id}`),
  create: (data: Partial<StudentGroup>) => api.post<StudentGroup>('/groups', data),
  update: (id: number, data: Partial<StudentGroup>) => api.put<StudentGroup>(`/groups/${id}`, data),
  delete: (id: number)      => api.delete(`/groups/${id}`),
}

// ─── Rooms ────────────────────────────────────────────────────────────────────
export const roomsApi = {
  list:   (search?: string) => api.get<Room[]>('/rooms', { params: search ? { search } : {} }),
  get:    (id: number)      => api.get<Room>(`/rooms/${id}`),
  create: (data: Partial<Room>) => api.post<Room>('/rooms', data),
  update: (id: number, data: Partial<Room>) => api.put<Room>(`/rooms/${id}`, data),
  delete: (id: number)      => api.delete(`/rooms/${id}`),
  updateStatus: (id: number, status: string) =>
    api.patch(`/rooms/${id}/status`, null, { params: { status } }),
  addEquipment: (roomId: number, equipmentId: number, quantity: number) =>
    api.post(`/rooms/${roomId}/equipment`, { equipment_id: equipmentId, quantity }),
  removeEquipment: (roomId: number, equipmentId: number) =>
    api.delete(`/rooms/${roomId}/equipment/${equipmentId}`),
}

// ─── Equipment ───────────────────────────────────────────────────────────────
export const equipmentApi = {
  list:   () => api.get<Equipment[]>('/equipment'),
  get:    (id: number) => api.get<Equipment>(`/equipment/${id}`),
  create: (data: Partial<Equipment>) => api.post<Equipment>('/equipment', data),
  update: (id: number, data: Partial<Equipment>) => api.put<Equipment>(`/equipment/${id}`, data),
  delete: (id: number) => api.delete(`/equipment/${id}`),
}

// ─── Slots ────────────────────────────────────────────────────────────────────
export const slotsApi = {
  list:     () => api.get<Slot[]>('/slots'),
  get:      (id: number) => api.get<Slot>(`/slots/${id}`),
  create:   (data: Partial<Slot>) => api.post<SlotResponse>('/slots', data),
  update:   (id: number, data: Partial<Slot>) => api.put<SlotResponse>(`/slots/${id}`, data),
  delete:   (id: number) => api.delete(`/slots/${id}`),
  dragDrop: (id: number, data: { day_of_week: number; start_time: string; end_time: string; room_id: number }) =>
    api.patch<SlotResponse>(`/slots/${id}/drag-drop`, data),
}

// ─── Timetable ────────────────────────────────────────────────────────────────
export const timetableApi = {
  byGroup:   (id: number) => api.get<Slot[]>(`/timetable/group/${id}`),
  byTeacher: (id: number) => api.get<Slot[]>(`/timetable/teacher/${id}`),
  byRoom:    (id: number) => api.get<Slot[]>(`/timetable/room/${id}`),
  generate:  ()           => api.post('/timetable/generate'),
}

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  list:     () => api.get<Notification[]>('/notifications'),
  markRead: (ids: number[]) => api.patch('/notifications/mark-read', { ids }),
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditApi = {
  list: (skip = 0, limit = 100) => api.get<AuditLog[]>('/audit-logs', { params: { skip, limit } }),
}
