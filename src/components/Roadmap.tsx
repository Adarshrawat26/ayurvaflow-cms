import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const sf = (f: string) => ({ fontFamily: f })

const phases = [
  {
    phase: 'Phase 1 — MVP',
    duration: 'Months 1–4',
    cost: '₹18–24 L',
    team: '2 FE + 2 BE + 1 Designer + 1 PM',
    color: '#1B4332',
    goal: 'Launch with a single pilot clinic. Core patient journey digitized end-to-end.',
    features: [
      'Multi-tenant provisioning & subdomain routing',
      'User auth with JWT + RBAC (all 6 roles)',
      'Patient registration (full form with all fields)',
      'Medical history capture',
      'Digital consent with e-signature + audit trail',
      'Doctor consultation + Ayurvedic assessment',
      'Treatment plan creation',
      'Basic appointment booking (receptionist only)',
      'Treatment session scheduling & tracking',
      'Basic billing: invoice generation + cash payment',
      'PDF invoice & receipt generation',
      'Document upload to AWS S3',
      'Admin dashboard with core KPIs',
      'Email notifications (appointment confirmation)',
      'Doctor & Reception dashboards',
    ],
    deliverables: ['Deployed staging environment', '1 pilot clinic onboarded', 'User acceptance testing complete'],
  },
  {
    phase: 'Phase 2 — Growth',
    duration: 'Months 5–8',
    cost: '₹14–18 L',
    team: '2 FE + 2 BE + 1 QA',
    color: '#0369A1',
    goal: 'Full-featured product ready for commercial launch. 5–10 clinics onboarded.',
    features: [
      'Online appointment booking (patient self-service portal)',
      'Calendar view (daily/weekly/monthly)',
      'Doctor availability management & slot blocking',
      'Razorpay payment integration (Card, UPI, Net Banking)',
      'SMS notifications via Twilio',
      'WhatsApp notifications via WABA',
      'Follow-up management & progress tracking',
      'Therapist dashboard & mobile-optimized view',
      'Patient portal (full self-service)',
      'Advanced analytics — revenue, patient, doctor reports',
      'Referral source analytics',
      'Therapist utilization reports',
      'Appointment rescheduling & cancellation',
      'Waitlist management',
      'Multi-center admin (Super Admin) dashboard',
    ],
    deliverables: ['Public launch', 'App Store PWA submission', '10 clinics onboarded'],
  },
  {
    phase: 'Phase 3 — Scale',
    duration: 'Months 9–14',
    cost: '₹20–28 L',
    team: '3 FE + 3 BE + 1 DevOps + 1 Data Eng',
    color: '#D97706',
    goal: 'Enterprise features, mobile apps, international expansion readiness.',
    features: [
      'Native mobile apps (React Native — iOS + Android)',
      'Offline mode for therapists (session logging offline)',
      'Multi-language support (Hindi, Malayalam, Tamil, English)',
      'Advanced inventory: herbal medicines & consumables stock',
      'Panchakarma protocol library (reusable treatment templates)',
      'Insurance & corporate billing integration',
      'ABDM (Ayushman Bharat Digital Mission) integration',
      'Telemedicine / video consultation',
      'Patient loyalty program & referral tracking',
      'AI-assisted Dosha assessment (questionnaire-based)',
      'Automated follow-up sequences (drip reminders)',
      'White-labeling for large clinic chains',
      'Multi-currency & multi-timezone for global clinics',
      'Advanced BI — Metabase embedded dashboards',
      'API marketplace for 3rd party integrations',
    ],
    deliverables: ['50+ clinics', 'Mobile apps live', 'Enterprise contract signed'],
  },
  {
    phase: 'Phase 4 — Platform',
    duration: 'Months 15–24',
    cost: '₹35–50 L',
    team: '5 FE + 5 BE + 2 ML + 1 Data + 2 DevOps',
    color: '#7C3AED',
    goal: 'Platform play — marketplace, AI, international SaaS with 100+ clinics.',
    features: [
      'Ayurveda practitioner marketplace (find a clinic)',
      'AI treatment outcome prediction (based on anonymized data)',
      'Smart scheduling optimization (AI-based slot suggestion)',
      'Automated billing reconciliation',
      'Patient health score / wellness index tracking',
      'Genomic Prakriti assessment integration',
      'Insurance API integrations (Mediclaim)',
      'EHR interoperability (FHIR R4)',
      'Research module (anonymized outcomes data export)',
      'Franchise management for large chains',
      'Customizable workflow builder (no-code)',
      'Patient community / wellness content platform',
      'Revenue sharing model for referral network',
      'Geographic expansion: UAE, UK, USA market entry',
    ],
    deliverables: ['100+ clinics', '$1M ARR target', 'Series A readiness'],
  },
]

const mvpFeatures = [
  { area: 'Must Have (P0)', items: ['Patient registration', 'Medical history', 'Consent management', 'Doctor consultation', 'Treatment plan', 'Session tracking', 'Basic billing', 'PDF invoices', 'Admin dashboard', 'Email notifications'], color: '#DC2626' },
  { area: 'Should Have (P1)', items: ['Patient portal', 'Online booking', 'Razorpay payments', 'SMS reminders', 'WhatsApp notifications', 'Follow-up management', 'Therapist dashboard', 'Analytics reports'], color: '#D97706' },
  { area: 'Could Have (P2)', items: ['Mobile app', 'Telemedicine', 'Inventory management', 'Insurance billing', 'AI Dosha assessment', 'Multi-language', 'ABDM integration'], color: '#0369A1' },
  { area: 'Won\'t Have Now (P3)', items: ['Genomic assessment', 'Marketplace', 'Research module', 'FHIR integration', 'Franchise management', 'Patient community'], color: '#6B7280' },
]

const teamRoles = [
  { role: 'Full-Stack Lead', count: 1, skills: 'Next.js, NestJS, PostgreSQL, AWS', phase: 'All' },
  { role: 'Frontend Developer', count: 2, skills: 'React, TypeScript, Tailwind, shadcn/ui', phase: 'Ph 1–4' },
  { role: 'Backend Developer', count: 2, skills: 'NestJS, Prisma, Redis, Bull queues', phase: 'Ph 1–4' },
  { role: 'UI/UX Designer', count: 1, skills: 'Figma, Design Systems, Healthcare UX', phase: 'Ph 1–2' },
  { role: 'Product Manager', count: 1, skills: 'Healthcare domain, SaaS metrics, roadmapping', phase: 'All' },
  { role: 'QA Engineer', count: 1, skills: 'Playwright E2E, Jest unit, API testing', phase: 'Ph 2–4' },
  { role: 'DevOps Engineer', count: 1, skills: 'AWS, Terraform, Docker, GitHub Actions', phase: 'Ph 2–4' },
  { role: 'Data Engineer', count: 1, skills: 'PostgreSQL analytics, TimescaleDB, Metabase', phase: 'Ph 3–4' },
]

export default function Roadmap() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1B4332] mb-1">Development Roadmap</h2>
        <p className="text-gray-600 text-sm" style={sf('sans-serif')}>24-month phased roadmap from MVP to full SaaS platform. Deliverable 14 — includes MVP features, future features, team, and cost estimates.</p>
      </div>

      {/* Timeline bar */}
      <div className="bg-white rounded-lg border p-4 overflow-x-auto">
        <svg viewBox="0 0 900 100" className="w-full" style={{ minWidth: 600 }}>
          {[
            { x: 10, w: 210, color: '#1B4332', label: 'Phase 1 — MVP', sub: 'Months 1–4' },
            { x: 230, w: 210, color: '#0369A1', label: 'Phase 2 — Growth', sub: 'Months 5–8' },
            { x: 450, w: 220, color: '#D97706', label: 'Phase 3 — Scale', sub: 'Months 9–14' },
            { x: 680, w: 210, color: '#7C3AED', label: 'Phase 4 — Platform', sub: 'Months 15–24' },
          ].map(p => (
            <g key={p.label}>
              <rect x={p.x} y={20} width={p.w} height={50} rx="6" fill={p.color} />
              <text x={p.x + p.w/2} y={44} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{p.label}</text>
              <text x={p.x + p.w/2} y={58} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8">{p.sub}</text>
            </g>
          ))}
          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24].map(m => (
            <g key={m}>
              <text x={10 + (m-1)*36.7 + 18} y={90} textAnchor="middle" fontSize="7" fill="#9CA3AF">{m}</text>
            </g>
          ))}
          <text x="450" y="98" textAnchor="middle" fontSize="8" fill="#6B7280">Month →</text>
        </svg>
      </div>

      {/* Phase cards */}
      <div className="space-y-4">
        {phases.map(phase => (
          <Card key={phase.phase} className="overflow-hidden">
            <CardHeader className="py-3 px-4" style={{ backgroundColor: phase.color }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-white text-base" style={sf('sans-serif')}>{phase.phase}</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-white/20 text-white border-0 text-xs" style={sf('sans-serif')}>⏱ {phase.duration}</Badge>
                  <Badge className="bg-white/20 text-white border-0 text-xs" style={sf('sans-serif')}>💰 {phase.cost}</Badge>
                  <Badge className="bg-white/20 text-white border-0 text-xs" style={sf('sans-serif')}>👥 {phase.team}</Badge>
                </div>
              </div>
              <p className="text-white/80 text-xs mt-1" style={sf('sans-serif')}>{phase.goal}</p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2" style={sf('sans-serif')}>Features</p>
                  <div className="grid grid-cols-1 gap-0.5">
                    {phase.features.map(f => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600 py-0.5" style={sf('sans-serif')}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: phase.color }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2" style={sf('sans-serif')}>Exit Criteria / Deliverables</p>
                  {phase.deliverables.map(d => (
                    <div key={d} className="flex items-center gap-2 text-xs text-gray-700 py-1 border-b border-gray-50" style={sf('sans-serif')}>
                      <span className="text-green-600">✓</span> {d}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MVP vs Future */}
      <section>
        <h3 className="text-lg font-bold text-[#1B4332] mb-3 border-b border-[#D4A017] pb-1">MVP vs Future Feature Prioritization (MoSCoW)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mvpFeatures.map(f => (
            <Card key={f.area} className="border-t-4" style={{ borderTopColor: f.color }}>
              <CardHeader className="py-2 px-4">
                <CardTitle className="text-xs font-bold" style={{ color: f.color, ...sf('sans-serif') }}>{f.area}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ul className="space-y-1">
                  {f.items.map(i => (
                    <li key={i} className="text-xs text-gray-600 flex gap-1.5" style={sf('sans-serif')}>
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: f.color }} />
                      {i}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Team */}
      <section>
        <h3 className="text-lg font-bold text-[#1B4332] mb-3 border-b border-[#D4A017] pb-1">Recommended Team Composition</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse" style={sf('sans-serif')}>
            <thead>
              <tr className="bg-[#1B4332] text-white">
                {['Role', 'Count', 'Key Skills', 'Active Phases'].map(h => (
                  <th key={h} className="px-4 py-2 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamRoles.map((r, i) => (
                <tr key={r.role} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 font-semibold text-[#1B4332]">{r.role}</td>
                  <td className="px-4 py-2 font-bold text-center">{r.count}</td>
                  <td className="px-4 py-2 text-gray-600">{r.skills}</td>
                  <td className="px-4 py-2"><Badge className="bg-[#F7F5F0] text-[#1B4332] text-xs border border-[#D4A017]" style={sf('sans-serif')}>{r.phase}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cost summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { phase: 'MVP (Phase 1)', cost: '₹18–24 L', note: '4 months, 6 people', color: '#1B4332' },
          { phase: 'Growth (Phase 2)', cost: '₹14–18 L', note: '4 months, 6 people', color: '#0369A1' },
          { phase: 'Scale (Phase 3)', cost: '₹20–28 L', note: '6 months, 9 people', color: '#D97706' },
          { phase: 'Platform (Phase 4)', cost: '₹35–50 L', note: '10 months, 12 people', color: '#7C3AED' },
        ].map(c => (
          <div key={c.phase} className="rounded-lg p-4 text-white" style={{ backgroundColor: c.color }}>
            <p className="text-xs opacity-70 mb-1" style={sf('sans-serif')}>{c.phase}</p>
            <p className="text-2xl font-bold" style={sf('sans-serif')}>{c.cost}</p>
            <p className="text-xs opacity-70 mt-1" style={sf('sans-serif')}>{c.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#F7F5F0] border border-[#D4A017] rounded-lg p-4">
        <p className="font-bold text-[#1B4332] text-sm mb-2" style={sf('sans-serif')}>💡 SaaS Revenue Model</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs" style={sf('sans-serif')}>
          <div><p className="font-semibold text-[#1B4332] mb-1">Starter Plan — ₹4,999/mo</p><p className="text-gray-600">1 doctor, 200 patients/month, email support. Best for solo practitioners.</p></div>
          <div><p className="font-semibold text-[#1B4332] mb-1">Growth Plan — ₹12,999/mo</p><p className="text-gray-600">5 doctors, 2,000 patients/month, WhatsApp notifications, priority support.</p></div>
          <div><p className="font-semibold text-[#1B4332] mb-1">Enterprise — ₹29,999+/mo</p><p className="text-gray-600">Unlimited doctors, unlimited patients, white-labeling, dedicated CSM, SLA 99.9%.</p></div>
        </div>
        <p className="text-xs text-gray-500 mt-3" style={sf('sans-serif')}>
          ARR projections: 10 clinics × ₹1.2L/yr = ₹12L ARR (end Ph1) → 50 × ₹2L = ₹1Cr ARR (end Ph2) → 100+ × ₹3L avg = ₹3Cr+ ARR (end Ph3)
        </p>
      </div>
    </div>
  )
}
