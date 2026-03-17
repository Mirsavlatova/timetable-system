// import { useState, FormEvent } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { GraduationCap, Eye, EyeOff } from 'lucide-react'
// import toast from 'react-hot-toast'
// import { authApi } from '../../api/services'
// import { useAuth } from '../../store/authStore'
// import { Spinner } from '../../components/ui'

// export default function LoginPage() {
//   const [username, setUsername]   = useState('')
//   const [password, setPassword]   = useState('')
//   const [showPass, setShowPass]   = useState(false)
//   const [loading, setLoading]     = useState(false)
//   const { login } = useAuth()
//   const navigate  = useNavigate()

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault()
//     if (!username || !password) { toast.error("Username va parolni kiriting"); return }
//     setLoading(true)
//     try {
//       const { data } = await authApi.login(username, password)
//       login(data.access_token, data.user)
//       toast.success(`Xush kelibsiz, ${data.user.username}!`)
//       navigate('/')
//     } catch (err: any) {
//       toast.error(err.response?.data?.detail || 'Login muvaffaqiyatsiz')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
//       {/* Background pattern */}
//       <div className="absolute inset-0 opacity-10"
//         style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}
//       />

//       <div className="relative w-full max-w-md">
//         {/* Card */}
//         <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-white">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
//                 <GraduationCap size={26} />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold">Dars Jadvali Tizimi</h1>
//                 <p className="text-indigo-200 text-sm">Universitetning jadval boshqaruvi</p>
//               </div>
//             </div>
//             <p className="text-indigo-100 text-sm">Tizimga kirish uchun ma'lumotlaringizni kiriting</p>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
//             <div>
//               <label className="label">Foydalanuvchi nomi</label>
//               <input
//                 className="input"
//                 placeholder="admin"
//                 value={username}
//                 onChange={e => setUsername(e.target.value)}
//                 autoComplete="username"
//                 autoFocus
//               />
//             </div>
//             <div>
//               <label className="label">Parol</label>
//               <div className="relative">
//                 <input
//                   className="input pr-10"
//                   type={showPass ? 'text' : 'password'}
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={e => setPassword(e.target.value)}
//                   autoComplete="current-password"
//                 />
//                 <button type="button" onClick={() => setShowPass(!showPass)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
//                   {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
//               </div>
//             </div>

//             <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
//               {loading ? <Spinner size="sm" /> : 'Kirish'}
//             </button>

//             {/* Demo credentials */}
//             <div className="bg-slate-50 rounded-xl p-4 space-y-2">
//               <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Demo hisoblar</p>
//               {[
//                 ['admin', 'admin123', 'Admin'],
//                 ['dispatcher', 'disp123', 'Dispatcher'],
//                 ['teacher1', 'teach123', 'Teacher'],
//               ].map(([u, p, role]) => (
//                 <button
//                   key={u} type="button"
//                   onClick={() => { setUsername(u); setPassword(p) }}
//                   className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
//                 >
//                   <span className="font-mono font-medium text-slate-700">{u}</span>
//                   <span className="badge badge-blue">{role}</span>
//                 </button>
//               ))}
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/services'
import { useAuth } from '../../store/authStore'
import { Spinner } from '../../components/ui'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      toast.error("Username va parolni kiriting")
      return
    }

    setLoading(true)

    try {
      const { data } = await authApi.login(username, password)

      // 🔥 ENG MUHIM FIX (TOKENNI SAQLAYDI)
      localStorage.setItem("token", data.access_token)

      // store ga ham beramiz
      login(data.access_token, data.user)

      toast.success(`Xush kelibsiz, ${data.user.username}!`)

      // dashboardga o'tadi
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login muvaffaqiyatsiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <GraduationCap size={26} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dars Jadvali Tizimi</h1>
                <p className="text-indigo-200 text-sm">Universitet tizimi</p>
              </div>
            </div>
            <p className="text-indigo-100 text-sm">Tizimga kirish</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">

            <div>
              <label className="label">Username</label>
              <input
                className="input"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Parol</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Kirish'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}