import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './store/authStore'
import Layout from './components/layout/Layout'
import LoginPage        from './pages/auth/LoginPage'
import DashboardPage    from './pages/DashboardPage'
import TeachersPage     from './pages/teachers/TeachersPage'
import SubjectsPage     from './pages/subjects/SubjectsPage'
import GroupsPage       from './pages/groups/GroupsPage'
import RoomsPage        from './pages/rooms/RoomsPage'
import EquipmentPage    from './pages/equipment/EquipmentPage'
import SlotsPage        from './pages/slots/SlotsPage'
import TimetablePage    from './pages/timetable/TimetablePage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import AuditLogsPage    from './pages/audit/AuditLogsPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/"              element={<DashboardPage />} />
          <Route path="/teachers"      element={<TeachersPage />} />
          <Route path="/subjects"      element={<SubjectsPage />} />
          <Route path="/groups"        element={<GroupsPage />} />
          <Route path="/rooms"         element={<RoomsPage />} />
          <Route path="/equipment"     element={<EquipmentPage />} />
          <Route path="/slots"         element={<SlotsPage />} />
          <Route path="/timetable"     element={<TimetablePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/audit-logs"    element={<AuditLogsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
