import { useEffect, useState } from 'react'
import { CalendarClock, ClipboardPlus } from 'lucide-react'
import type { Role } from '@/types/entities'
import { GUIDE_FLOWS, GUIDE_QUICK_REF, GUIDE_ROLES, type GuideRole } from '@/data/registrationGuide'
import ModalShell from './ModalShell'

const defaultRole = (r?: Role): GuideRole =>
  r === 'admin' || r === 'doctor' || r === 'receptionist' ? r : r === 'therapist' ? 'therapist' : r === 'patient' ? 'patient' : 'receptionist'

export default function RegistrationGuideModal({ open, onClose, userRole }: {
  open: boolean; onClose: () => void; userRole?: Role
}) {
  const [role, setRole] = useState<GuideRole>(() => defaultRole(userRole))
  useEffect(() => { if (open) setRole(defaultRole(userRole)) }, [open, userRole])

  const { intro, flows } = GUIDE_FLOWS[role]

  return (
    <ModalShell open={open} onClose={onClose} title="Registration guide"
      subtitle="How each role accesses the one-time registration form" maxWidth="lg">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="flex gap-1.5 flex-wrap">
          {GUIDE_ROLES.map(r => (
            <button key={r.id} type="button" onClick={() => setRole(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${role === r.id ? 'bg-[#1B4332] text-white' : 'bg-gray-100 text-gray-600'}`}>
              {r.label}
            </button>
          ))}
        </div>
        {intro && <p className="text-sm text-gray-600">{intro}</p>}
        {flows.map(({ title, icon: Icon, steps, note }) => (
          <div key={title} className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#1B4332]/10 flex items-center justify-center">
                <Icon size={16} className="text-[#1B4332]" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            </div>
            <ol className="space-y-2">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-[#1B4332]/10 text-[#1B4332] text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            {note && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3">{note}</p>}
          </div>
        ))}
        <div className="card p-4 bg-gray-50 overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-gray-500 border-b border-gray-200">
              {['Role', 'Where', 'Action'].map(h => <th key={h} className="pb-2 pr-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody className="text-gray-700">
              {GUIDE_QUICK_REF.map(([a, b, c]) => (
                <tr key={a} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 pr-3">{a}</td><td className="py-2 pr-3">{b}</td><td className="py-2">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card p-4 border-[#1B4332]/15 bg-[#1B4332]/[0.03] text-xs text-gray-600">
          <div className="flex items-center gap-2 mb-2 text-[#1B4332] font-semibold">
            <CalendarClock size={14} /> Full clinic journey
          </div>
          Registration → Documents → Appointments → Consultations → Treatments → Billing → Patient portal
          <div className="flex items-start gap-2 text-[10px] text-gray-400 mt-3">
            <ClipboardPlus size={12} className="shrink-0 mt-0.5" />
            Wizard: Registration → Consent (1) → Consent (2) → Review &amp; Sign
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
