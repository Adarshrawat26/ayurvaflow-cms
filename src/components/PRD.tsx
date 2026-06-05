import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

const sf = (f: string) => ({ fontFamily: f })

const sections = [
  {
    id: 'overview',
    title: '1. Product Overview',
    content: (
      <div className="space-y-3">
        <div className="bg-[#F7F5F0] rounded-lg p-4 border-l-4 border-[#D4A017]">
          <p className="font-bold text-[#1B4332] text-sm mb-2" style={sf('sans-serif')}>Product Vision</p>
          <p className="text-sm text-gray-700 leading-relaxed" style={sf('sans-serif')}>
            AyurvaFlow CMS is a multi-tenant, enterprise-grade Clinic Management System purpose-built for Ayurveda centers. It digitizes the complete patient journey — from first contact to discharge and follow-up — while embedding Ayurvedic clinical concepts (Prakriti, Vikriti, Dosha, Panchakarma protocols) natively into every workflow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Primary Market', val: 'Ayurveda clinics, wellness resorts, Panchakarma centers in India and globally' },
            { label: 'Business Model', val: 'B2B SaaS — monthly/annual subscription per clinic. Usage-based add-ons for SMS, WhatsApp.' },
            { label: 'Target Scale', val: '100+ clinics, 50,000+ patients, 500K+ appointments/year by Year 3' },
          ].map(i => (
            <div key={i.label} className="bg-white border rounded-lg p-3">
              <p className="text-xs font-bold text-[#1B4332] mb-1" style={sf('sans-serif')}>{i.label}</p>
              <p className="text-xs text-gray-600" style={sf('sans-serif')}>{i.val}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Core Problem', 'Ayurveda clinics rely on paper records, WhatsApp groups, and Excel for scheduling — leading to errors, revenue leakage, and poor patient experience.'],
            ['Our Solution', 'Single integrated platform replacing all point solutions, with Ayurveda-native clinical terminology and workflows.'],
            ['Key Differentiator', 'Unlike generic HMS (Practo, eHospital), AyurvaFlow understands Dosha, Prakriti, Panchakarma scheduling, and herbal medicine management.'],
            ['Success Metric', 'Reduce admin work by 60%, eliminate missed appointments by 80%, increase billing accuracy to 99.5%.'],
          ].map(([title, body]) => (
            <div key={title} className="bg-[#1B4332] text-white rounded-lg p-3">
              <p className="text-xs font-bold text-[#D4A017] mb-1" style={sf('sans-serif')}>{title}</p>
              <p className="text-xs opacity-80 leading-relaxed" style={sf('sans-serif')}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'personas',
    title: '2. User Personas',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: 'Dr. Rajesh Menon', role: 'Senior Vaidya (Doctor)', age: 52, pain: 'Spends 30% of consult time searching paper records. Wants quick access to patient history and a way to create structured treatment plans.', goal: 'See more patients, spend less time on paperwork, track treatment outcomes.', color: '#065F46' },
          { name: 'Sujatha Nair', role: 'Receptionist / Office Manager', age: 34, pain: 'Manages appointments via WhatsApp, billing via Excel. Double-bookings and missed follow-ups cost the clinic revenue and reputation.', goal: 'One screen for everything — appointments, billing, patient check-in — with automated reminders.', color: '#0369A1' },
          { name: 'Priya Sharma', role: 'Patient (Urban Professional)', age: 38, pain: 'Doesn\'t know what treatments she\'s had, can\'t track her Ayurvedic progress, has to repeat medical history at every visit.', goal: 'Self-service portal, digital records, be reminded of sessions, pay online.', color: '#9F1239' },
          { name: 'Kairali Group Admin', role: 'Multi-Center Owner', age: 47, pain: 'No consolidated view across 5 centers. Revenue leakage, inconsistent service quality, therapist utilization unknown.', goal: 'Cross-center analytics dashboard, standardized protocols, central staff management.', color: '#7C3AED' },
        ].map(p => (
          <Card key={p.name} className="border-l-4" style={{ borderLeftColor: p.color }}>
            <CardContent className="pt-4 px-4 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: p.color }}>{p.name[0]}</div>
                <div>
                  <p className="font-bold text-sm" style={{ color: p.color, ...sf('sans-serif') }}>{p.name}</p>
                  <p className="text-xs text-gray-500" style={sf('sans-serif')}>{p.role} · {p.age}y</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-red-50 rounded p-2">
                  <p className="text-xs font-semibold text-red-700 mb-0.5" style={sf('sans-serif')}>Pain Point</p>
                  <p className="text-xs text-red-600" style={sf('sans-serif')}>{p.pain}</p>
                </div>
                <div className="bg-green-50 rounded p-2">
                  <p className="text-xs font-semibold text-green-700 mb-0.5" style={sf('sans-serif')}>Goal</p>
                  <p className="text-xs text-green-600" style={sf('sans-serif')}>{p.goal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
  },
  {
    id: 'requirements',
    title: '3. Functional Requirements',
    content: (
      <div className="space-y-4">
        {[
          { module: 'Patient Management', priority: 'P0', reqs: [
            'FR-PM-01: System shall allow creation of patient profile with all personal, contact, and emergency contact fields',
            'FR-PM-02: System shall auto-calculate age from DOB',
            'FR-PM-03: System shall generate unique patient code (e.g. KAI-2024-0001)',
            'FR-PM-04: System shall track referral source with 6 categories',
            'FR-PM-05: System shall support patient search by name, phone, or patient code',
            'FR-PM-06: System shall maintain complete audit trail of all patient record changes',
          ]},
          { module: 'Medical History', priority: 'P0', reqs: [
            'FR-MH-01: System shall capture 8 lifestyle disease flags as boolean checkboxes',
            'FR-MH-02: System shall support free-text and structured allergy recording',
            'FR-MH-03: System shall store current medications with name, dose, frequency',
            'FR-MH-04: System shall record surgical history with procedure, year, hospital',
            'FR-MH-05: System shall support upload of medical documents (PDF, JPG, PNG up to 20MB) to S3',
          ]},
          { module: 'Consent Management', priority: 'P0', reqs: [
            'FR-CM-01: System shall present 6 consent sections before treatment',
            'FR-CM-02: System shall capture digital signature via canvas/signature pad',
            'FR-CM-03: System shall record timestamp, IP address, user-agent at time of signing',
            'FR-CM-04: System shall make signed consent PDFs immutable and audit-logged',
            'FR-CM-05: Mandatory consents shall block treatment initiation if not signed',
          ]},
          { module: 'Doctor Consultation', priority: 'P0', reqs: [
            'FR-DC-01: Doctor shall view complete patient history before consultation',
            'FR-DC-02: System shall support structured Prakriti/Vikriti/Dosha assessment',
            'FR-DC-03: Doctor shall create treatment plan with treatment type, duration, sessions',
            'FR-DC-04: System shall support Ayurvedic medicine prescription with Anupana',
            'FR-DC-05: Doctor shall add Pathya (recommended) and Apathya (restricted) dietary advice',
          ]},
          { module: 'Billing', priority: 'P0', reqs: [
            'FR-BI-01: System shall auto-calculate invoice from consultation + treatment + medicine charges',
            'FR-BI-02: System shall support 4 payment modes: Cash, Card, UPI, Net Banking',
            'FR-BI-03: System shall generate numbered PDF invoice and receipt',
            'FR-BI-04: System shall integrate with Razorpay for digital payments',
            'FR-BI-05: Razorpay webhook shall update payment status in real-time',
          ]},
          { module: 'Notifications', priority: 'P1', reqs: [
            'FR-NT-01: System shall send appointment reminders 24h and 2h before',
            'FR-NT-02: System shall send treatment session reminders via WhatsApp',
            'FR-NT-03: System shall send payment due reminders 3 days before due date',
            'FR-NT-04: Admin shall be able to customize notification templates per tenant',
            'FR-NT-05: System shall support SMS, WhatsApp, Email, and in-app channels',
          ]},
        ].map(section => (
          <Card key={section.module}>
            <CardHeader className="py-2 px-4 bg-gray-50">
              <CardTitle className="text-sm flex items-center gap-2" style={sf('sans-serif')}>
                <span style={{ color: '#1B4332' }}>{section.module}</span>
                <Badge className={`text-xs ${section.priority === 'P0' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`} style={sf('sans-serif')}>
                  {section.priority}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-3">
              <ul className="space-y-1">
                {section.reqs.map(req => (
                  <li key={req} className="text-xs text-gray-700 flex gap-2" style={sf('sans-serif')}>
                    <span className="text-[#1B4332] font-mono flex-shrink-0">{req.split(':')[0]}:</span>
                    <span>{req.split(':').slice(1).join(':')}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
  },
  {
    id: 'nfr',
    title: '4. Non-Functional Requirements',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { cat: 'Performance', items: ['API p95 response < 200ms for read endpoints', 'Page load < 2s on 4G mobile connection', 'Support 500 concurrent users per tenant', 'Session scheduling API < 500ms for 100 sessions', 'PDF generation < 3 seconds'] },
          { cat: 'Security', items: ['JWT with 15-min access + 7-day refresh tokens', 'Row Level Security on all database tables', 'All PII encrypted at rest (AES-256)', 'TLS 1.3 for all data in transit', 'OWASP Top 10 compliance', 'Consent records tamper-evident (hash chain)'] },
          { cat: 'Availability', items: ['99.9% SLA (43.8 min/month downtime allowed)', 'Automated failover via AWS Multi-AZ RDS', 'Zero-downtime deployments with ECS rolling update', 'Daily automated backups, 30-day retention', 'Disaster recovery RTO < 4 hours'] },
          { cat: 'Scalability', items: ['Horizontal scaling via ECS auto-scaling groups', 'Database read replicas for analytics queries', 'Redis caching for patient lists and calendar views', 'CDN (CloudFront) for static assets and PDFs', 'Multi-region support in Phase 3 (SE Asia expansion)'] },
          { cat: 'Compliance', items: ['DPDP Act 2023 (India data privacy)', 'GDPR compliance for international patients', 'Healthcare data retention: 7 years minimum', 'Consent forms with IP + timestamp for legal validity', 'Audit logs for all data mutations'] },
          { cat: 'Accessibility', items: ['WCAG 2.1 AA compliance', 'Screen reader compatible (aria-labels on all interactive elements)', 'Minimum 4.5:1 color contrast ratio', 'Keyboard navigable interfaces', 'Support for 10-point touch on mobile'] },
        ].map(c => (
          <Card key={c.cat}>
            <CardHeader className="py-2 px-4 bg-[#1B4332]">
              <CardTitle className="text-sm text-white" style={sf('sans-serif')}>{c.cat}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-3">
              <ul className="space-y-1.5">
                {c.items.map(item => (
                  <li key={item} className="text-xs text-gray-700 flex gap-2" style={sf('sans-serif')}>
                    <span className="text-[#D4A017] flex-shrink-0">→</span> {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
  },
]

export default function PRD() {
  const [active, setActive] = useState('overview')
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B4332] mb-1">Product Requirements Document</h2>
        <p className="text-gray-600 text-sm" style={sf('sans-serif')}>Complete PRD for AyurvaFlow CMS v1.0 — Deliverable 13.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-0">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-all ${active === s.id ? 'border-[#1B4332] text-[#1B4332]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            style={sf('sans-serif')}
          >
            {s.title}
          </button>
        ))}
      </div>

      {sections.filter(s => s.id === active).map(s => (
        <div key={s.id}>{s.content}</div>
      ))}
    </div>
  )
}
