import React, { ReactNode } from 'react'
import { X, AlertTriangle } from 'lucide-react'

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' }[size]
  return (
    <div className={`${s} border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`} />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-32">
      <Spinner size="lg" />
    </div>
  )
}

// ─── Empty ───────────────────────────────────────────────────────────────────
export function Empty({ message = "Ma'lumot topilmadi" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
        <span className="text-2xl">📭</span>
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
interface ConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  loading?: boolean
}

export function ConfirmDialog({ open, onClose, onConfirm, title = "O'chirish", message, loading }: ConfirmProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>Bekor qilish</button>
          <button onClick={onConfirm} className="btn-danger" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "O'chirish"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Search Input ─────────────────────────────────────────────────────────────
interface SearchProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}
export function SearchInput({ value, onChange, placeholder = 'Qidirish...' }: SearchProps) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        className="input pl-9 w-64"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

// ─── Page Header ─────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── Form Field ──────────────────────────────────────────────────────────────
interface FieldProps {
  label: string
  children: ReactNode
  required?: boolean
  error?: string
}
export function Field({ label, children, required, error }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
