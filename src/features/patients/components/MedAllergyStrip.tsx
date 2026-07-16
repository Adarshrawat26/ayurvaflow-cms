/**
 * MedAllergyStrip — Active medications + known allergies in patient header
 * Inspired by OpenEMR patient summary bar
 *
 * Shows a compact horizontal strip below the patient name/age row.
 * Pulls from the patient's LATEST consultation's medicines + allergies fields.
 * Hidden when both are empty.
 */

import { AlertCircle, FlaskConical } from 'lucide-react'

interface Props {
  medicines?: string
  allergies?: string
}

function parseCommaList(val: string | undefined): string[] {
  if (!val?.trim()) return []
  return val.split(/,|;|\n/).map(s => s.trim()).filter(Boolean).slice(0, 5)
}

export default function MedAllergyStrip({ medicines, allergies }: Props) {
  const meds = parseCommaList(medicines)
  const allgs = parseCommaList(allergies)

  if (meds.length === 0 && allgs.length === 0) return null

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 pt-2 border-t border-gray-100">
      {meds.length > 0 && (
        <div className="flex items-start gap-1.5">
          <FlaskConical size={11} className="text-[#52B788] shrink-0 mt-0.5" />
          <div className="flex flex-wrap gap-1">
            {meds.map(m => (
              <span
                key={m}
                className="text-[10px] font-medium bg-[#1B4332]/10 text-[#1B4332] px-1.5 py-0.5 rounded-full"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
      {allgs.length > 0 && (
        <div className="flex items-start gap-1.5">
          <AlertCircle size={11} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex flex-wrap gap-1">
            {allgs.map(a => (
              <span
                key={a}
                className="text-[10px] font-medium bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full border border-red-100"
              >
                ⚠ {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
