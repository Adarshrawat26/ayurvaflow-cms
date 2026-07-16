/**
 * VitalsEntry — Structured numeric vitals for Consultation Assessment tab
 * Inspired by OHC Care care_fe/src/components/Patient/Vitals/
 *
 * Captures 4 quantitative biomarkers per consultation:
 * - Pulse Rate (bpm)
 * - Blood Pressure (systolic / diastolic)
 * - Weight (kg)
 *
 * These sit ABOVE the qualitative Ashtavidha Pariksha fields (Nadi, Jihva, etc.)
 * because they're different: numeric biomarkers vs Ayurvedic qualitative findings.
 */

interface Vitals {
  pulse_rate: string
  bp_systolic: string
  bp_diastolic: string
  weight_kg: string
}

interface Props {
  vitals: Vitals
  onChange: (v: Partial<Vitals>) => void
}

interface FieldDef {
  key: keyof Vitals
  label: string
  unit: string
  placeholder: string
  min: number
  max: number
  colSpan?: boolean
}

const VITAL_FIELDS: FieldDef[] = [
  { key: 'pulse_rate',   label: 'Pulse Rate',    unit: 'bpm',  placeholder: '72',  min: 30,  max: 220 },
  { key: 'weight_kg',   label: 'Weight',         unit: 'kg',   placeholder: '65',  min: 10,  max: 300 },
  { key: 'bp_systolic', label: 'BP Systolic',    unit: 'mmHg', placeholder: '120', min: 60,  max: 250 },
  { key: 'bp_diastolic',label: 'BP Diastolic',   unit: 'mmHg', placeholder: '80',  min: 40,  max: 160 },
]

function getStatusColor(key: keyof Vitals, value: string): string {
  const n = Number(value)
  if (!value || isNaN(n)) return ''
  if (key === 'pulse_rate') {
    if (n < 60 || n > 100) return 'text-amber-600'
    return 'text-emerald-600'
  }
  if (key === 'bp_systolic') {
    if (n >= 140) return 'text-red-600'
    if (n >= 120) return 'text-amber-600'
    return 'text-emerald-600'
  }
  if (key === 'bp_diastolic') {
    if (n >= 90) return 'text-red-600'
    if (n >= 80) return 'text-amber-600'
    return 'text-emerald-600'
  }
  return ''
}

export default function VitalsEntry({ vitals, onChange }: Props) {
  return (
    <div className="rounded-xl border border-[#1B4332]/15 bg-[#1B4332]/[0.02] p-3 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#52B788]" />
        <span className="text-[11px] font-semibold text-[#1B4332] uppercase tracking-wide">
          Clinical Vitals
        </span>
        <span className="text-[10px] text-gray-400 ml-auto">Optional — numeric measurements</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {VITAL_FIELDS.map(field => {
          const statusColor = getStatusColor(field.key, vitals[field.key])
          return (
            <div key={field.key} className="relative">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                {field.label}
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  placeholder={field.placeholder}
                  value={vitals[field.key]}
                  onChange={e => onChange({ [field.key]: e.target.value })}
                  className={`input-field pr-12 text-sm font-semibold ${statusColor}`}
                />
                <span className="absolute right-3 text-[10px] text-gray-400 font-medium pointer-events-none">
                  {field.unit}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export type { Vitals }
