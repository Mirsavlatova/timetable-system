import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../store/authStore'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
