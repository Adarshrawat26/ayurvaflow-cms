/**
 * PatientTimeline — Visual chronological consultation history
 * Inspired by OpenMRS openmrs-esm-patient-chart timeline widget
 *
 * Renders each past consultation as a timeline entry with:
 * - Date pill + vertical connector line
 * - Prakriti / Vikruti / Condition chips
 * - Therapy + sessions prescribed
 * - Structured vitals (if captured)
 * - Follow-up schedule
 * - Allergies and complaints expandable
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Leaf,
  Clock,
  FlaskConical,
  AlertCircle,
} from 'lucide-react'
import type { Consultation } from '../../../types/entities'

interface Props {
  consultations: Consultation[]
  patientName?: string
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function Chip({ text, color = 'gray' }: { text: string; color?: 'green' | 'orange' | 'blue' | 'gray' | 'red' }) {
  const styles = {
    green:  'bg-[#1B4332]/10 text-[#1B4332]',
    orange: 'bg-amber-50 text-amber-800',
    blue:   'bg-blue-50 text-blue-800',
    gray:   'bg-gray-100 text-gray-600',
    red:    'bg-red-50 text-red-700',
  }
  return (
    <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full ${styles[color]}`}>
      {text}
    </span>
  )
}

function TimelineEntry({
  consultation,
  index,
  isFirst,
  isLast,
}: {
  consultation: Consultation
  index: number
  isFirst: boolean
  isLast: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const c = consultation

  const hasVitals = c.pulse_rate || c.bp_systolic || c.weight_kg

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex gap-3"
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-2.5 h-2.5 rounded-full border-2 mt-1 shrink-0 ${
            isFirst
              ? 'border-[#1B4332] bg-[#52B788]'
              : 'border-gray-300 bg-white'
          }`}
        />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-100 mt-1" />}
      </div>

      {/* Card */}
      <div className="flex-1 pb-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isFirst ? 'bg-[#1B4332] text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {formatDate(c.createdAt)}
            </span>
            {isFirst && (
              <span className="ml-2 text-[10px] text-[#52B788] font-semibold">Latest</span>
            )}
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Main summary */}
        <div className="card p-3 space-y-2.5 border-gray-100">
          {/* Dosha row */}
          <div className="flex flex-wrap gap-1.5">
            {c.prakriti && <Chip text={`Prakriti: ${c.prakriti}`} color="green" />}
            {c.vikruti && <Chip text={`Vikruti: ${c.vikruti}`} color="orange" />}
            {c.condition && <Chip text={c.condition} color="blue" />}
          </div>

          {/* Therapy */}
          {c.therapy && (
            <div className="flex items-center gap-2 text-xs">
              <Leaf size={12} className="text-[#52B788] shrink-0" />
              <span className="text-gray-700 font-medium">{c.therapy}</span>
              {c.sessions && (
                <span className="text-gray-400">· {c.sessions} sessions prescribed</span>
              )}
            </div>
          )}

          {/* Structured vitals */}
          {hasVitals && (
            <div className="flex flex-wrap gap-3 text-[11px] text-gray-600 border-t border-gray-50 pt-2">
              {c.pulse_rate && (
                <span>❤️ <b>{c.pulse_rate}</b> bpm</span>
              )}
              {c.bp_systolic && c.bp_diastolic && (
                <span>🩺 <b>{c.bp_systolic}/{c.bp_diastolic}</b> mmHg</span>
              )}
              {c.weight_kg && (
                <span>⚖️ <b>{c.weight_kg}</b> kg</span>
              )}
            </div>
          )}

          {/* Follow-up */}
          {c.followUp && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Clock size={11} className="text-amber-500" />
              Follow-up in {c.followUp}
              {c.doctor && <span className="ml-auto text-gray-400">— {c.doctor}</span>}
            </div>
          )}
        </div>

        {/* Expanded detail */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 space-y-2"
          >
            {c.complaints && (
              <div className="card p-3 border-gray-100 bg-gray-50">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Stethoscope size={11} className="text-gray-400" />
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">Chief Complaints</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{c.complaints}</p>
                {c.duration && (
                  <p className="text-[10px] text-gray-400 mt-1">Duration: {c.duration}</p>
                )}
              </div>
            )}

            {c.medicines && (
              <div className="card p-3 border-gray-100 bg-gray-50">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FlaskConical size={11} className="text-[#52B788]" />
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">Medicines Prescribed</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{c.medicines}</p>
              </div>
            )}

            {c.allergies && (
              <div className="card p-3 border-red-100 bg-red-50">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertCircle size={11} className="text-red-500" />
                  <span className="text-[10px] font-semibold text-red-600 uppercase">Known Allergies</span>
                </div>
                <p className="text-xs text-red-700">{c.allergies}</p>
              </div>
            )}

            {c.diet && (
              <div className="card p-3 border-amber-100 bg-amber-50">
                <div className="text-[10px] font-semibold text-amber-700 uppercase mb-1">Dietary Advice</div>
                <p className="text-xs text-amber-800 leading-relaxed">{c.diet}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default function PatientTimeline({ consultations, patientName }: Props) {
  const sorted = [...consultations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        <Stethoscope size={24} className="mx-auto mb-3 opacity-30" />
        No consultations recorded yet
        {patientName && <p className="text-xs mt-1">for {patientName}</p>}
      </div>
    )
  }

  return (
    <div className="px-1 pt-2">
      <div className="text-xs text-gray-400 mb-4">
        {sorted.length} consultation{sorted.length > 1 ? 's' : ''} · most recent first
      </div>
      <div>
        {sorted.map((c, i) => (
          <TimelineEntry
            key={c.id}
            consultation={c}
            index={i}
            isFirst={i === 0}
            isLast={i === sorted.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
