import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Search, Pencil, UserCheck, UserX, ChevronDown,
  Shield, Building2, Users, Phone, Mail, Briefcase, Calendar
} from 'lucide-react'
import type { User } from '../App'
import type { StaffMember, StaffRole } from '../types/entities'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectClinicSettings, selectStaff } from '../store/selectors'
import { changePasswordApi, saveClinicSettingsApi, saveStaffApi } from '../store/thunks/apiThunks'
import type { ClinicSettings } from '../types/clinic'

type Tab = 'team' | 'clinic' | 'account'

const ROLE_LABELS: Record<StaffRole, string> = {
  admin: 'Admin',
  doctor: 'Doctor',
  receptionist: 'Receptionist',
  therapist: 'Therapist',
}

const ROLE_COLORS: Record<StaffRole, string> = {
  admin: 'bg-purple-50 text-purple-700 border border-purple-200',
  doctor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  receptionist: 'bg-blue-50 text-blue-700 border border-blue-200',
  therapist: 'bg-amber-50 text-amber-700 border border-amber-200',
}

const SPECIALIZATIONS: Record<StaffRole, string[]> = {
  admin: ['Administration', 'Operations', 'Finance'],
  doctor: [
    'Panchakarma & Detox', 'Skin Disorders & Rasayana',
    'Neurological & Pain Management', 'General Ayurveda',
    'Infertility & Women\'s Health', 'Paediatric Ayurveda',
    'Geriatric Care', 'Yoga & Lifestyle'
  ],
  receptionist: ['Front Desk', 'Patient Relations', 'Billing Support'],
  therapist: [
    'Abhyangam & Shirodhara', 'Pizhichil & Navarakizhi',
    'Elakizhi & Kadikizhi', 'Udhwarthanam', 'Nasyam & Basti',
    'All Therapies'
  ],
}

const emptyForm = (): Omit<StaffMember, 'id'> => ({
  name: '', role: 'doctor', specialization: '', experience: 0,
  phone: '', email: '', status: 'active', joinDate: new Date().toISOString().split('T')[0]
})

interface Props {
  onNavigate: (p: import('../App').Page) => void
  user: User
}

export default function Settings({ user }: Props) {
  const dispatch = useAppDispatch()
  const staff = useAppSelector(selectStaff)
  const clinicSettings = useAppSelector(selectClinicSettings)
  const [tab, setTab] = useState<Tab>('team')
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<StaffMember['role'] | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [clinicDraft, setClinicDraft] = useState<ClinicSettings | null>(null)
  const clinicForm = clinicDraft ?? clinicSettings
  const patchClinic = (patch: Partial<ClinicSettings>) =>
    setClinicDraft(prev => ({ ...(prev ?? clinicSettings), ...patch }))
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' })
  const [pwdError, setPwdError] = useState('')

  const isAdmin = user.role === 'admin'

  const filtered = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.specialization.toLowerCase().includes(search.toLowerCase())
    const matchesRole = filterRole === 'all' || s.role === filterRole
    return matchesSearch && matchesRole
  })

  function openAdd() {
    setEditId(null)
    setForm(emptyForm())
    setErrors({})
    setShowModal(true)
  }

  function openEdit(s: StaffMember) {
    setEditId(s.id)
    setForm({ name: s.name, role: s.role, specialization: s.specialization, experience: s.experience, phone: s.phone, email: s.email, status: s.status, joinDate: s.joinDate })
    setErrors({})
    setShowModal(true)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.specialization) e.specialization = 'Specialization is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    return e
  }

  function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    dispatch(saveStaffApi({ editId, data: form }))
    setShowModal(false)
  }

  function toggleStatus(id: string) {
    const member = staff.find(s => s.id === id)
    if (!member) return
    dispatch(saveStaffApi({
      editId: id,
      data: { ...member, status: member.status === 'active' ? 'inactive' : 'active' },
    }))
  }

  const counts = {
    all: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    doctor: staff.filter(s => s.role === 'doctor').length,
    receptionist: staff.filter(s => s.role === 'receptionist').length,
    therapist: staff.filter(s => s.role === 'therapist').length,
    admin: staff.filter(s => s.role === 'admin').length,
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 w-full">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage team, clinic profile, and account preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-1">
        {([
          { id: 'team' as Tab, label: 'Team & Staff', Icon: Users },
          { id: 'clinic' as Tab, label: 'Clinic Profile', Icon: Building2 },
          { id: 'account' as Tab, label: 'My Account', Icon: Shield },
        ] as { id: Tab; label: string; Icon: React.ElementType }[]).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === id
                ? 'border-[#1B4332] text-[#1B4332]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── TEAM TAB ── */}
      {tab === 'team' && (
        <div className="space-y-4">
          {/* Summary chips */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'doctor', 'receptionist', 'therapist', 'admin'] as const).map(r => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterRole === r
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r === 'all' ? 'All' : ROLE_LABELS[r as StaffMember['role']]}
                <span className="ml-1 opacity-70">{counts[r]}</span>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-field pl-8"
                placeholder="Search by name, email, or specialization…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {isAdmin && (
              <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 shrink-0">
                <Plus size={15} /> Add Staff
              </button>
            )}
          </div>

          {/* Staff list */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400 text-sm">No staff found</div>
            )}
            {filtered.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.28 }}
                whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.07)' }}
                className={`card p-4 flex gap-3 relative ${s.status === 'inactive' ? 'opacity-60' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                  s.role === 'doctor' ? 'bg-emerald-100 text-emerald-700' :
                  s.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  s.role === 'receptionist' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div className="font-medium text-sm text-gray-900 truncate">{s.name}</div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${ROLE_COLORS[s.role]}`}>
                      {ROLE_LABELS[s.role]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">{s.specialization}</div>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><Briefcase size={10} />{s.experience}y exp</span>
                    <span className="flex items-center gap-1"><Phone size={10} />{s.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-400 truncate">
                    <Mail size={10} className="shrink-0" />{s.email}
                  </div>

                  {isAdmin && (
                    <div className="flex gap-1.5 mt-3">
                      <button
                        onClick={() => openEdit(s)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(s.id)}
                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                          s.status === 'active'
                            ? 'text-red-500 bg-red-50 hover:bg-red-100'
                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {s.status === 'active' ? <><UserX size={11} /> Deactivate</> : <><UserCheck size={11} /> Activate</>}
                      </button>
                    </div>
                  )}
                </div>
            </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── CLINIC TAB ── */}
      {tab === 'clinic' && (
        <div className="max-w-2xl space-y-5">
          {!isAdmin && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
              Only admins can edit clinic details. Contact your administrator.
            </div>
          )}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Building2 size={15} className="text-[#1B4332]" /> Clinic Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="label">Clinic Name</label>
                <input
                  className="input-field"
                  value={clinicForm.name}
                  onChange={e => patchClinic({ name: e.target.value })}
                  disabled={!isAdmin}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address</label>
                <textarea
                  className="input-field resize-none"
                  rows={2}
                  value={clinicForm.address}
                  onChange={e => patchClinic({ address: e.target.value })}
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input-field" value={clinicForm.phone}
                  onChange={e => patchClinic({ phone: e.target.value })}
                  disabled={!isAdmin} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input-field" value={clinicForm.email}
                  onChange={e => patchClinic({ email: e.target.value })}
                  disabled={!isAdmin} />
              </div>
              <div>
                <label className="label">GST Number</label>
                <input className="input-field" value={clinicForm.gst}
                  onChange={e => patchClinic({ gst: e.target.value })}
                  disabled={!isAdmin} />
              </div>
              <div>
                <label className="label">Website</label>
                <input className="input-field" value={clinicForm.website}
                  onChange={e => patchClinic({ website: e.target.value })}
                  disabled={!isAdmin} />
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={15} className="text-[#1B4332]" /> Working Hours
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Opens At</label>
                <input type="time" className="input-field" value={clinicForm.openTime}
                  onChange={e => patchClinic({ openTime: e.target.value })}
                  disabled={!isAdmin} />
              </div>
              <div>
                <label className="label">Closes At</label>
                <input type="time" className="input-field" value={clinicForm.closeTime}
                  onChange={e => patchClinic({ closeTime: e.target.value })}
                  disabled={!isAdmin} />
              </div>
            </div>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                dispatch(saveClinicSettingsApi(clinicForm))
                setClinicDraft(null)
              }}
            >
              Save Changes
            </button>
          )}
        </div>
      )}

      {/* ── ACCOUNT TAB ── */}
      {tab === 'account' && (
        <div className="max-w-lg space-y-4">
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-[#1B4332]/10 flex items-center justify-center text-[#1B4332] font-semibold">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-400 capitalize">{user.role} · {user.clinic}</div>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-800">Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" defaultValue={user.name} />
              </div>
              <div>
                <label className="label">Role</label>
                <input className="input-field capitalize" value={user.role} readOnly />
              </div>
              <div>
                <label className="label">Clinic</label>
                <input className="input-field" value={user.clinic} readOnly />
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">Change Password</h3>
            <div>
              <label className="label">Current Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={pwdForm.current}
                onChange={e => setPwdForm(p => ({ ...p, current: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={pwdForm.next}
                onChange={e => setPwdForm(p => ({ ...p, next: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={pwdForm.confirm}
                onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))}
              />
            </div>
            {pwdError && <p className="text-xs text-red-500">{pwdError}</p>}
            <button
              type="button"
              className="btn-primary text-sm"
              onClick={() => {
                if (pwdForm.next.length < 8) {
                  setPwdError('New password must be at least 8 characters')
                  return
                }
                if (pwdForm.next !== pwdForm.confirm) {
                  setPwdError('Passwords do not match')
                  return
                }
                setPwdError('')
                dispatch(changePasswordApi({ currentPassword: pwdForm.current, newPassword: pwdForm.next }))
                  .unwrap()
                  .then(() => setPwdForm({ current: '', next: '', confirm: '' }))
                  .catch(() => {})
              }}
            >
              Update Password
            </button>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Role Permissions</h3>
            <div className="space-y-2 text-sm">
              {([
                { role: 'admin', perms: 'Full access — all modules, team management, clinic settings' },
                { role: 'doctor', perms: 'Appointments, Consultations, Patients (own), Treatments (own)' },
                { role: 'receptionist', perms: 'Appointments, Patients, Billing — no settings access' },
                { role: 'therapist', perms: 'Appointments view, Treatments (assigned only)' },
              ] as { role: string; perms: string }[]).map(({ role, perms }) => (
                <div key={role} className={`flex gap-2 p-2.5 rounded-lg ${user.role === role ? 'bg-[#1B4332]/5 border border-[#1B4332]/20' : 'bg-gray-50'}`}>
                  <span className={`capitalize text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${ROLE_COLORS[role as StaffMember['role']]}`}>{role}</span>
                  <span className="text-xs text-gray-500">{perms}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD/EDIT MODAL ── */}
      <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <motion.div
            className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900">{editId ? 'Edit Staff Member' : 'Add New Staff'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                  placeholder="e.g. Dr. Ramesh Kumar"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Role *</label>
                  <div className="relative">
                    <select
                      className="input-field appearance-none pr-7"
                      value={form.role}
                      onChange={e => setForm(p => ({ ...p, role: e.target.value as StaffMember['role'], specialization: '' }))}
                    >
                      <option value="doctor">Doctor</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="therapist">Therapist</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="label">Experience (years)</label>
                  <input
                    type="number"
                    className="input-field"
                    min={0}
                    value={form.experience}
                    onChange={e => setForm(p => ({ ...p, experience: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <label className="label">Specialization *</label>
                <div className="relative">
                  <select
                    className={`input-field appearance-none pr-7 ${errors.specialization ? 'border-red-400' : ''}`}
                    value={form.specialization}
                    onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))}
                  >
                    <option value="">Select specialization…</option>
                    {SPECIALIZATIONS[form.role].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.specialization && <p className="text-xs text-red-500 mt-1">{errors.specialization}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Phone *</label>
                  <input
                    className={`input-field ${errors.phone ? 'border-red-400' : ''}`}
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="label">Join Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.joinDate}
                    onChange={e => setForm(p => ({ ...p, joinDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="label">Email *</label>
                <input
                  className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="name@kairali.com"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {editId && (
                <div>
                  <label className="label">Status</label>
                  <div className="flex gap-2">
                    {(['active', 'inactive'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setForm(p => ({ ...p, status: s }))}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                          form.status === s
                            ? s === 'active'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                              : 'bg-red-50 border-red-300 text-red-700 font-medium'
                            : 'bg-white border-gray-200 text-gray-500'
                        }`}
                      >
                        {s === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-2 sticky bottom-0 bg-white">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} className="btn-primary flex-1">
                {editId ? 'Save Changes' : 'Add Staff Member'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}
