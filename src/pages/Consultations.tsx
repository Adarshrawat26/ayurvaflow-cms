import { useMemo, useState } from 'react'
import { ArrowLeft, RefreshCw, Save, Sparkles, Wand2 } from 'lucide-react'
import type { Page } from '../App'
import type { Appointment } from '../types/entities'
import { THERAPIES, PRAKRITI_TYPES, CONDITIONS } from '../data/mockData'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectConsultationQueue, selectConsultations, selectPatients } from '../store/selectors'
import { saveConsultationApi } from '../store/thunks/apiThunks'
import {
  ASSESSMENT_SUGGESTIONS,
  formatDietAdvice,
  getConditionPlan,
  getPrakritiSuggestions,
  mergeChipValue,
} from '../data/consultationSuggestions'
import SuggestionChips from '../components/SuggestionChips'
import VitalsEntry from '../features/consultations/components/VitalsEntry'
import { useSOAPDraft, clearDraft } from '../features/consultations/hooks/useSOAPDraft'

const EMPTY_FORM = {
  // S — Subjective
  complaints: '', duration: '', history: '', allergies: '',
  // O — Objective Ashtavidha
  pulse: '', tongue: '', eyes: '', skin: '',
  // O — Structured Vitals
  pulse_rate: '', bp_systolic: '', bp_diastolic: '', weight_kg: '',
  // A — Assessment
  prakriti: 'Vata', vikruti: '', condition: 'General Wellness',
  // P — Plan
  therapy: 'Abhyangam', sessions: '14',
  medicines: '', diet: '', lifestyle: '', followUp: '4 weeks',
}

function splitValues(value: string) {
  return value.split(/, |\n/).map(s => s.trim()).filter(Boolean)
}

export default function Consultations(_props: { onNavigate: (p: Page) => void; user?: unknown }) {
  const dispatch = useAppDispatch()
  const todayAppts = useAppSelector(selectConsultationQueue)
  const patients = useAppSelector(selectPatients)
  const allConsultations = useAppSelector(selectConsultations)
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [tab, setTab] = useState<'S' | 'O' | 'A' | 'P'>('S')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  // F2: SOAP draft auto-save
  const { hasDraft, draftSavedAt, recoverDraft, discardDraft } = useSOAPDraft(
    selected?.id ?? null,
    form,
    setForm,
  )

  const prakritiSuggestions = useMemo(() => getPrakritiSuggestions(form.prakriti), [form.prakriti])
  const conditionPlan = useMemo(() => getConditionPlan(form.condition), [form.condition])

  const smartInsight = useMemo(() => {
    const parts: string[] = []
    if (form.prakriti) parts.push(`${form.prakriti} constitution`)
    if (form.condition) parts.push(conditionPlan.therapy + ' protocol')
    if (form.vikruti) parts.push(`${form.vikruti} imbalance noted`)
    return parts.length
      ? `Recommended: ${conditionPlan.therapy} (${conditionPlan.sessions} sessions) tailored for ${parts.join(' · ')}`
      : `Recommended: ${conditionPlan.therapy} (${conditionPlan.sessions} sessions) for ${form.condition}`
  }, [form.prakriti, form.condition, form.vikruti, conditionPlan])

  const openConsultation = (appt: Appointment) => {
    const patient = patients.find(p => p.id === appt.patientId)
    const existing = allConsultations.find(c => c.appointmentId === appt.id)
    const condition = existing?.condition
      || (patient?.purpose && CONDITIONS.includes(patient.purpose) ? patient.purpose : 'General Wellness')
    const plan = getConditionPlan(condition)
    setSelected(appt)
    setTab('S')
    setSaved(false)
    if (existing) {
      setForm({
        complaints: existing.complaints,
        duration: existing.duration,
        history: existing.history,
        allergies: existing.allergies,
        pulse: existing.pulse,
        tongue: existing.tongue,
        eyes: existing.eyes,
        skin: existing.skin,
        pulse_rate: existing.pulse_rate ?? '',
        bp_systolic: existing.bp_systolic ?? '',
        bp_diastolic: existing.bp_diastolic ?? '',
        weight_kg: existing.weight_kg ?? '',
        prakriti: existing.prakriti || patient?.prakriti || 'Vata',
        vikruti: existing.vikruti,
        therapy: existing.therapy || plan.therapy,
        sessions: existing.sessions || plan.sessions,
        condition: existing.condition || condition,
        medicines: existing.medicines,
        diet: existing.diet,
        lifestyle: existing.lifestyle,
        followUp: existing.followUp || plan.followUp,
      })
    } else {
      setForm({
        ...EMPTY_FORM,
        prakriti: patient?.prakriti ?? 'Vata',
        condition,
        therapy: plan.therapy,
        sessions: plan.sessions,
        followUp: plan.followUp,
      })
    }
  }

  const applyPrakritiDiet = () => {
    const { pathya, apathya } = prakritiSuggestions
    setForm(f => ({ ...f, diet: formatDietAdvice(pathya, apathya) }))
  }

  const applyPrakritiLifestyle = () => {
    setForm(f => ({ ...f, lifestyle: prakritiSuggestions.lifestyle.join(', ') }))
  }

  const applyConditionPlan = () => {
    const plan = getConditionPlan(form.condition)
    setForm(f => ({
      ...f,
      therapy: plan.therapy,
      sessions: plan.sessions,
      medicines: plan.medicines.join(', '),
      diet: formatDietAdvice(plan.pathya, plan.apathya),
      lifestyle: plan.lifestyle.join(', '),
      followUp: plan.followUp,
    }))
  }

  const handleSave = () => {
    if (!selected) return
    const existing = allConsultations.find(c => c.appointmentId === selected.id)
    dispatch(saveConsultationApi({
      id: existing?.id ?? `C${Date.now()}`,
      appointmentId: selected.id,
      patientId: selected.patientId,
      patient: selected.patient,
      doctor: selected.doctor,
      ...form,
      createdAt: new Date().toISOString(),
    }))
    clearDraft(selected.id)  // F2: clear draft on successful save
    setSaved(true)
  }

  if (selected) {
    const patient = patients.find(p => p.id === selected.patientId)
    return (
      <div className="p-4 lg:p-6 w-full">
        <button onClick={() => { setSelected(null); setSaved(false) }} className="flex items-center gap-2 text-sm text-gray-500 mb-4 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to queue
        </button>

        {saved ? (
          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Save size={20} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Consultation Saved</h3>
            <p className="text-sm text-gray-500 mb-4">{selected.patient} · {new Date().toLocaleDateString('en-IN')}</p>
            <div className="text-left card p-4 bg-gray-50 text-sm space-y-2 mb-4">
              <div><span className="text-gray-500">Prakriti: </span><span className="font-medium">{form.prakriti}</span></div>
              {form.vikruti && <div><span className="text-gray-500">Vikruti: </span><span className="font-medium">{form.vikruti}</span></div>}
              <div><span className="text-gray-500">Condition: </span><span className="font-medium">{form.condition}</span></div>
              <div><span className="text-gray-500">Prescribed therapy: </span><span className="font-medium">{form.therapy} · {form.sessions} sessions</span></div>
              {form.medicines && <div><span className="text-gray-500">Medicines: </span><span className="font-medium">{form.medicines}</span></div>}
              <div><span className="text-gray-500">Follow-up in: </span><span className="font-medium">{form.followUp}</span></div>
            </div>
            <button onClick={() => { setSelected(null); setSaved(false) }} className="btn-primary w-full">Back to Queue</button>
          </div>
        ) : (
          <div className="card p-5">
            {/* Patient header */}
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{selected.patient}</h2>
                <p className="text-xs text-gray-500">{selected.type} · {selected.time} (45 min) · {selected.doctor}</p>
                {patient && (
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-[10px] bg-[#1B4332]/10 text-[#1B4332] px-2 py-0.5 rounded-full">{patient.prakriti}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{patient.purpose}</span>
                  </div>
                )}
              </div>
              <div className="text-right text-xs text-gray-400">
                <div>{patient?.age}y · {patient?.gender === 'M' ? 'Male' : 'Female'}</div>
                <div>{patient?.nationality}</div>
              </div>
            </div>

            {/* F2: Draft recovery banner */}
            {hasDraft && (
              <div className="flex items-center gap-3 px-3 py-2.5 mb-4 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-800">
                <RefreshCw size={13} className="shrink-0" />
                <span className="flex-1">
                  Unsaved draft found{draftSavedAt ? ` · saved ${new Date(draftSavedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}.
                </span>
                <button type="button" onClick={recoverDraft} className="font-semibold underline underline-offset-2 hover:text-amber-900">Recover</button>
                <button type="button" onClick={discardDraft} className="text-amber-500 hover:text-amber-700 ml-1">Discard</button>
              </div>
            )}

            {/* Smart insight */}
            <div className="flex items-start gap-2.5 text-xs bg-[#1B4332]/[0.04] border border-[#1B4332]/15 rounded-lg px-3 py-2.5 mb-4">
              <Sparkles size={14} className="text-[#52B788] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1B4332]">Clinical suggestion</p>
                <p className="text-gray-600 mt-0.5 leading-relaxed">{smartInsight}</p>
              </div>
              {tab === 'P' && (
                <button
                  type="button"
                  onClick={applyConditionPlan}
                  className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-white bg-[#1B4332] px-2.5 py-1.5 rounded-lg hover:bg-[#163828] transition-colors"
                >
                  <Wand2 size={11} /> Apply all
                </button>
              )}
            </div>

            {/* Tabs — SOAP format */}
            <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg mb-4">
              {([
                { id: 'S', label: 'Subjective', hint: 'Chief complaints & history' },
                { id: 'O', label: 'Objective', hint: 'Examination & vitals' },
                { id: 'A', label: 'Assessment', hint: 'Prakriti & diagnosis' },
                { id: 'P', label: 'Plan', hint: 'Therapy & prescriptions' },
              ] as const).map(t => (
                <button
                  key={t.id}
                  title={t.hint}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {t.id}
                  <span className="hidden sm:inline font-normal"> — {t.label}</span>
                </button>
              ))}
            </div>

            {tab === 'S' && (
              <div className="space-y-3">
                <div>
                  <label className="label">Chief Complaints</label>
                  <textarea className="input-field resize-none" rows={3} placeholder="Describe the patient's primary symptoms and complaints in detail" value={form.complaints} onChange={e => setForm({...form, complaints: e.target.value})} />
                  <SuggestionChips
                    label="Common presentations"
                    suggestions={[
                      'Chronic lower back pain',
                      'Insomnia & restlessness',
                      'Digestive discomfort',
                      'Skin rash & itching',
                      'Joint stiffness',
                      'Stress & burnout',
                    ]}
                    activeValues={[form.complaints]}
                    onSelect={v => setForm(f => ({ ...f, complaints: mergeChipValue(f.complaints, v, '; ') }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Duration of Complaints</label>
                    <input className="input-field" placeholder="e.g. 3 months, 2 years" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} />
                    <SuggestionChips
                      suggestions={['2 weeks', '1 month', '3 months', '6 months', '1+ year']}
                      activeValues={[form.duration]}
                      onSelect={v => setForm(f => ({ ...f, duration: v }))}
                    />
                  </div>
                  <div>
                    <label className="label">Known Allergies</label>
                    <input className="input-field" placeholder="Medicines, food, herbs" value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} />
                    <SuggestionChips
                      suggestions={['None known', 'Penicillin', 'Peanuts', 'Dust / pollen', 'Latex']}
                      activeValues={[form.allergies]}
                      onSelect={v => setForm(f => ({ ...f, allergies: v }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Past Medical History</label>
                  <textarea className="input-field resize-none" rows={2} placeholder="Previous illnesses, surgeries, ongoing medications" value={form.history} onChange={e => setForm({...form, history: e.target.value})} />
                  <SuggestionChips
                    suggestions={['No significant history', 'Hypertension', 'Diabetes Type 2', 'Thyroid disorder', 'Prior Panchakarma']}
                    activeValues={splitValues(form.history)}
                    onSelect={v => setForm(f => ({ ...f, history: mergeChipValue(f.history, v) }))}
                  />
                </div>
              </div>
            )}

            {tab === 'O' && (
              <div className="space-y-3">
                {/* Structured numeric vitals first */}
                <VitalsEntry
                  vitals={{ pulse_rate: form.pulse_rate, bp_systolic: form.bp_systolic, bp_diastolic: form.bp_diastolic, weight_kg: form.weight_kg }}
                  onChange={v => setForm(f => ({ ...f, ...v }))}
                />
                <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  Ashtavidha Pariksha — 8-fold Ayurvedic examination to determine root cause
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Nadi (Pulse)</label>
                    <input className="input-field" placeholder="e.g. Vata-dominant, irregular" value={form.pulse} onChange={e => setForm({...form, pulse: e.target.value})} />
                    <SuggestionChips
                      suggestions={[...ASSESSMENT_SUGGESTIONS.pulse]}
                      activeValues={[form.pulse]}
                      onSelect={v => setForm(f => ({ ...f, pulse: v }))}
                    />
                  </div>
                  <div>
                    <label className="label">Jihva (Tongue)</label>
                    <input className="input-field" placeholder="e.g. Coated, dry, pale" value={form.tongue} onChange={e => setForm({...form, tongue: e.target.value})} />
                    <SuggestionChips
                      suggestions={[...ASSESSMENT_SUGGESTIONS.tongue]}
                      activeValues={[form.tongue]}
                      onSelect={v => setForm(f => ({ ...f, tongue: v }))}
                    />
                  </div>
                  <div>
                    <label className="label">Netra (Eyes)</label>
                    <input className="input-field" placeholder="e.g. Clear, reddish, dull" value={form.eyes} onChange={e => setForm({...form, eyes: e.target.value})} />
                    <SuggestionChips
                      suggestions={[...ASSESSMENT_SUGGESTIONS.eyes]}
                      activeValues={[form.eyes]}
                      onSelect={v => setForm(f => ({ ...f, eyes: v }))}
                    />
                  </div>
                  <div>
                    <label className="label">Tvak (Skin)</label>
                    <input className="input-field" placeholder="e.g. Dry, oily, combination" value={form.skin} onChange={e => setForm({...form, skin: e.target.value})} />
                    <SuggestionChips
                      suggestions={[...ASSESSMENT_SUGGESTIONS.skin]}
                      activeValues={[form.skin]}
                      onSelect={v => setForm(f => ({ ...f, skin: v }))}
                    />
                  </div>
                </div>
              </div>
            )}
            {tab === 'A' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  Dosha Assessment — determine root imbalance based on Prakriti and current presentation
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Prakriti (Constitution)</label>
                    <select className="input-field" value={form.prakriti} onChange={e => setForm({...form, prakriti: e.target.value})}>
                      {PRAKRITI_TYPES.map(p => <option key={p}>{p}</option>)}
                    </select>
                    {patient && form.prakriti !== patient.prakriti && (
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, prakriti: patient.prakriti }))}
                        className="mt-1.5 text-[10px] text-[#1B4332] font-medium hover:underline"
                      >
                        Use recorded prakriti: {patient.prakriti}
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="label">Vikruti (Current Imbalance)</label>
                    <select className="input-field" value={form.vikruti} onChange={e => setForm({...form, vikruti: e.target.value})}>
                      <option value="">Select dosha imbalance</option>
                      {PRAKRITI_TYPES.map(p => <option key={p}>{p}</option>)}
                    </select>
                    <SuggestionChips
                      label="Likely imbalance"
                      hint="based on prakriti"
                      suggestions={form.prakriti.includes('Vata') ? ['Vata', 'Vata-Pitta'] : form.prakriti.includes('Pitta') ? ['Pitta', 'Pitta-Kapha'] : form.prakriti.includes('Kapha') ? ['Kapha', 'Vata-Kapha'] : ['Tridosha']}
                      activeValues={[form.vikruti]}
                      onSelect={v => setForm(f => ({ ...f, vikruti: v }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {tab === 'P' && (
              <div className="space-y-3">
                <div>
                  <label className="label">Condition Being Treated</label>
                  <select
                    className="input-field"
                    value={form.condition}
                    onChange={e => {
                      const condition = e.target.value
                      const plan = getConditionPlan(condition)
                      setForm(f => ({
                        ...f,
                        condition,
                        therapy: plan.therapy,
                        sessions: plan.sessions,
                        followUp: plan.followUp,
                      }))
                    }}
                  >
                    {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {patient && patient.purpose !== form.condition && (
                    <button
                      type="button"
                      onClick={() => {
                        const plan = getConditionPlan(patient.purpose)
                        setForm(f => ({
                          ...f,
                          condition: patient.purpose,
                          therapy: plan.therapy,
                          sessions: plan.sessions,
                          followUp: plan.followUp,
                        }))
                      }}
                      className="mt-1.5 text-[10px] text-[#1B4332] font-medium hover:underline"
                    >
                      Use visit purpose: {patient.purpose}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Prescribed Therapy</label>
                    <select className="input-field" value={form.therapy} onChange={e => setForm({...form, therapy: e.target.value})}>
                      {THERAPIES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <SuggestionChips
                      suggestions={[conditionPlan.therapy, ...THERAPIES.filter(t => t !== conditionPlan.therapy).slice(0, 3)]}
                      activeValues={[form.therapy]}
                      onSelect={v => setForm(f => ({ ...f, therapy: v }))}
                    />
                  </div>
                  <div>
                    <label className="label">Number of Sessions</label>
                    <input className="input-field" type="number" value={form.sessions} onChange={e => setForm({...form, sessions: e.target.value})} />
                    <SuggestionChips
                      suggestions={['7', '14', '21', '28']}
                      activeValues={[form.sessions]}
                      onSelect={v => setForm(f => ({ ...f, sessions: v }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Herbal Medicines / Formulations</label>
                  <input className="input-field" placeholder="e.g. Triphala, Ashwagandha, Brahmi Ghrita" value={form.medicines} onChange={e => setForm({...form, medicines: e.target.value})} />
                  <SuggestionChips
                    suggestions={conditionPlan.medicines}
                    activeValues={splitValues(form.medicines)}
                    onSelect={v => setForm(f => ({ ...f, medicines: mergeChipValue(f.medicines, v) }))}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="label mb-0">Ayurvedic Dietary Advice (Pathya)</label>
                    <button type="button" onClick={applyPrakritiDiet} className="text-[10px] font-semibold text-[#1B4332] hover:underline shrink-0">
                      Apply {form.prakriti} diet
                    </button>
                  </div>
                  <textarea className="input-field resize-none mt-1" rows={3} placeholder="Foods to include / avoid based on Prakriti and Vikruti" value={form.diet} onChange={e => setForm({...form, diet: e.target.value})} />
                  <SuggestionChips
                    label="Pathya"
                    suggestions={prakritiSuggestions.pathya}
                    activeValues={splitValues(form.diet)}
                    onSelect={v => setForm(f => ({ ...f, diet: mergeChipValue(f.diet, v) }))}
                  />
                  <SuggestionChips
                    label="Apathya"
                    suggestions={prakritiSuggestions.apathya}
                    activeValues={splitValues(form.diet)}
                    onSelect={v => setForm(f => ({ ...f, diet: mergeChipValue(f.diet, `Avoid: ${v}`, '; ') }))}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="label mb-0">Lifestyle Recommendations (Vihara)</label>
                    <button type="button" onClick={applyPrakritiLifestyle} className="text-[10px] font-semibold text-[#1B4332] hover:underline shrink-0">
                      Apply {form.prakriti} routine
                    </button>
                  </div>
                  <textarea className="input-field resize-none mt-1" rows={2} placeholder="Sleep, exercise, yoga, daily routine (Dinacharya)" value={form.lifestyle} onChange={e => setForm({...form, lifestyle: e.target.value})} />
                  <SuggestionChips
                    suggestions={prakritiSuggestions.lifestyle}
                    activeValues={splitValues(form.lifestyle)}
                    onSelect={v => setForm(f => ({ ...f, lifestyle: mergeChipValue(f.lifestyle, v) }))}
                  />
                </div>
                <div>
                  <label className="label">Follow-up Schedule</label>
                  <select className="input-field" value={form.followUp} onChange={e => setForm({...form, followUp: e.target.value})}>
                    {['1 week', '2 weeks', '4 weeks', '6 weeks', '3 months'].map(f => <option key={f}>{f}</option>)}
                  </select>
                  <SuggestionChips
                    suggestions={[conditionPlan.followUp]}
                    activeValues={[form.followUp]}
                    onSelect={v => setForm(f => ({ ...f, followUp: v }))}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-5">
              {tab !== 'S' && (
                <button className="btn-outline flex-1" onClick={() => {
                  const order = ['S', 'O', 'A', 'P'] as const
                  const idx = order.indexOf(tab)
                  setTab(order[Math.max(0, idx - 1)])
                }}>Back</button>
              )}
              {tab !== 'P'
                ? <button className="btn-primary flex-1" onClick={() => {
                    const order = ['S', 'O', 'A', 'P'] as const
                    const idx = order.indexOf(tab)
                    setTab(order[Math.min(3, idx + 1)])
                  }}>Next</button>
                : <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={handleSave}><Save size={15} /> Save Consultation</button>
              }
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 w-full">
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-0.5">Today's Consultation Queue</div>
        <div className="text-xs text-gray-400">{todayAppts.length} patients · 45-min consultations · Prakriti-based assessment</div>
      </div>
      <div className="space-y-2">
        {todayAppts.map(a => {
          const patient = patients.find(p => p.id === a.patientId)
          const plan = patient ? getConditionPlan(patient.purpose) : null
          return (
            <button key={a.id} onClick={() => openConsultation(a)} className="card w-full p-4 text-left hover:border-[#1B4332]/30 transition-colors flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1B4332]/10 flex items-center justify-center text-[#1B4332] text-xs font-semibold shrink-0">
                {a.patient.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{a.patient}</div>
                <div className="text-xs text-gray-400">{a.time} · {a.type} · {a.doctor}</div>
                {patient && (
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {patient.purpose} · {patient.prakriti}
                    {plan && <span className="text-[#52B788]"> · Suggested: {plan.therapy}</span>}
                  </div>
                )}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                a.status === 'arrived' ? 'bg-amber-100 text-amber-700'
                : a.status === 'in_progress' ? 'bg-[#1B4332]/10 text-[#1B4332]'
                : 'bg-blue-100 text-blue-700'
              }`}>{a.status.replace('_', ' ')}</span>
            </button>
          )
        })}
        {todayAppts.length === 0 && (
          <div className="text-center text-gray-400 py-12 text-sm">No consultations scheduled today</div>
        )}
      </div>
    </div>
  )
}
