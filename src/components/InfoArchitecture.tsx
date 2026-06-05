import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const roles = [
  { role: 'Super Admin', color: '#7C3AED', desc: 'Platform owner. Manages all tenants, billing, system config.', perms: ['All tenants', 'Platform config', 'Billing', 'Analytics across tenants'] },
  { role: 'Admin', color: '#1B4332', desc: 'Clinic owner/manager. Manages one tenant (clinic).', perms: ['Staff management', 'Settings', 'Reports', 'Billing config'] },
  { role: 'Receptionist', color: '#0369A1', desc: 'Front desk. Handles appointments, registrations, billing.', perms: ['Patient registration', 'Appointments', 'Billing', 'Notifications'] },
  { role: 'Doctor', color: '#065F46', desc: 'Physician. Consultations, diagnoses, treatment plans.', perms: ['Patient records', 'Consultations', 'Prescriptions', 'Treatment plans'] },
  { role: 'Therapist', color: '#92400E', desc: 'Treatment delivery. View schedule, mark sessions.', perms: ['My schedule', 'Session tracking', 'Patient notes (limited)'] },
  { role: 'Patient', color: '#9F1239', desc: 'Self-service portal. View records, book, pay.', perms: ['Own profile', 'Book appointments', 'View prescriptions', 'Pay bills'] },
]

const modules = [
  {
    name: 'Patient Management',
    icon: '👤',
    sub: ['Registration & Onboarding', 'Personal & Contact Info', 'Emergency Contacts', 'Referral Tracking', 'Purpose of Visit', 'Patient Timeline'],
  },
  {
    name: 'Medical History',
    icon: '🏥',
    sub: ['Lifestyle Diseases', 'Allergies & Medications', 'Surgical History', 'Family History', 'Previous Ayurveda Tx', 'Document Upload'],
  },
  {
    name: 'Consent Management',
    icon: '✍️',
    sub: ['Digital Consent Forms', 'e-Signature Capture', 'Timestamp & IP Logging', 'Audit Trail', 'Versioned Consent Docs', 'GDPR Compliance'],
  },
  {
    name: 'Doctor Consultation',
    icon: '🩺',
    sub: ['Chief Complaints', 'Clinical Diagnosis', 'Prakriti / Vikriti', 'Dosha Assessment', 'Treatment Plans', 'Medicines & Diet'],
  },
  {
    name: 'Treatment Management',
    icon: '🌿',
    sub: ['Treatment Packages', 'Session Scheduling', 'Therapist Assignment', 'Room Allocation', 'Session Tracking', 'Treatment Types'],
  },
  {
    name: 'Appointments',
    icon: '📅',
    sub: ['Calendar View', 'Doctor Availability', 'Book / Reschedule', 'Walk-in Management', 'Waitlist', 'Reminders'],
  },
  {
    name: 'Billing & Payments',
    icon: '💳',
    sub: ['Invoice Generation', 'Payment Collection', 'Tax & Discounts', 'Multi-mode Payments', 'Refunds', 'PDF Receipts'],
  },
  {
    name: 'Document Management',
    icon: '📁',
    sub: ['KYC Documents', 'Lab Reports', 'Prescriptions', 'Medical History Docs', 'AWS S3 Storage', 'Access Control'],
  },
  {
    name: 'Follow-Up',
    icon: '🔄',
    sub: ['Follow-Up Scheduling', 'Progress Tracking', 'Symptom Improvement', 'Doctor Notes', 'Outcome Measurement'],
  },
  {
    name: 'Analytics & Reports',
    icon: '📊',
    sub: ['Executive Dashboard', 'Revenue Reports', 'Patient Reports', 'Doctor Reports', 'Treatment Reports', 'Referral Source Reports'],
  },
  {
    name: 'Notifications',
    icon: '🔔',
    sub: ['SMS (Twilio)', 'WhatsApp (WABA)', 'Email (SES)', 'In-App', 'Push (FCM)', 'Template Management'],
  },
  {
    name: 'Multi-Tenancy',
    icon: '🏢',
    sub: ['Tenant Provisioning', 'Subdomain Routing', 'Tenant Config', 'Data Isolation', 'Plan Management', 'Usage Metering'],
  },
]

const techStack = [
  { layer: 'Frontend', items: ['Next.js 14 (App Router)', 'TypeScript 5', 'TailwindCSS', 'Shadcn/UI', 'React Query', 'Zustand'] },
  { layer: 'Backend', items: ['NestJS 10', 'TypeScript', 'Prisma ORM', 'Bull (queues)', 'Passport JWT', 'Swagger'] },
  { layer: 'Database', items: ['PostgreSQL 15', 'Redis (cache)', 'Elasticsearch (search)', 'TimescaleDB (analytics)'] },
  { layer: 'Infrastructure', items: ['AWS ECS (containers)', 'AWS RDS', 'AWS S3', 'AWS SES', 'CloudFront CDN', 'Terraform IaC'] },
  { layer: 'Integrations', items: ['Twilio (SMS)', 'WhatsApp Business API', 'Razorpay (payments)', 'FCM (push)', 'SendGrid'] },
  { layer: 'DevOps', items: ['GitHub Actions CI/CD', 'Docker', 'AWS ECR', 'Sentry (monitoring)', 'Datadog APM'] },
]

export default function InfoArchitecture() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1B4332] mb-1">Information Architecture</h2>
        <p className="text-gray-600 text-sm" style={{ fontFamily: 'sans-serif' }}>Complete system map — roles, modules, data flows, and technology choices.</p>
      </div>

      {/* Roles */}
      <section>
        <h3 className="text-lg font-bold text-[#1B4332] mb-3 border-b border-[#D4A017] pb-1">User Roles & Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(r => (
            <Card key={r.role} className="border-l-4" style={{ borderLeftColor: r.color }}>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: 'sans-serif', color: r.color }}>
                  <span className="font-bold">{r.role}</span>
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'sans-serif' }}>{r.desc}</p>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-wrap gap-1">
                  {r.perms.map(p => (
                    <span key={p} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600" style={{ fontFamily: 'sans-serif' }}>{p}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section>
        <h3 className="text-lg font-bold text-[#1B4332] mb-3 border-b border-[#D4A017] pb-1">System Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(m => (
            <Card key={m.name} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: 'sans-serif', color: '#1B4332' }}>
                  <span className="text-lg">{m.icon}</span> {m.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ul className="space-y-1">
                  {m.sub.map(s => (
                    <li key={s} className="text-xs text-gray-600 flex items-center gap-1.5" style={{ fontFamily: 'sans-serif' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section>
        <h3 className="text-lg font-bold text-[#1B4332] mb-3 border-b border-[#D4A017] pb-1">Technology Stack</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map(t => (
            <Card key={t.layer} className="bg-[#1B4332] text-white">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold text-[#D4A017]" style={{ fontFamily: 'sans-serif' }}>{t.layer}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-wrap gap-1">
                  {t.items.map(i => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-[#2D6A4F] text-[#A8D5B5]" style={{ fontFamily: 'sans-serif' }}>{i}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Multi-Tenancy Strategy */}
      <section>
        <h3 className="text-lg font-bold text-[#1B4332] mb-3 border-b border-[#D4A017] pb-1">Multi-Tenancy Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Data Isolation', body: 'Shared database, separate schemas per tenant. Every table carries tenant_id (UUID) with Row-Level Security enforced at DB layer. No cross-tenant data leakage possible.', icon: '🔒' },
            { title: 'Subdomain Routing', body: 'kairali.ayurvaflow.com, arya.ayurvaflow.com. Middleware resolves tenant from subdomain, injects tenant context into every request. Custom domains via CNAME supported.', icon: '🌐' },
            { title: 'Plan Tiers', body: 'Starter (1 doctor, 200 patients), Growth (5 doctors, 2000 patients), Enterprise (unlimited). Feature flags per plan stored in tenant config table.', icon: '📦' },
          ].map(s => (
            <Card key={s.title}>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: 'sans-serif', color: '#1B4332' }}>
                  <span>{s.icon}</span> {s.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-xs text-gray-600 leading-relaxed" style={{ fontFamily: 'sans-serif' }}>{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
