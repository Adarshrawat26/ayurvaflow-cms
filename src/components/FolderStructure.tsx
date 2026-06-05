import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const sf = (f: string) => ({ fontFamily: f })

const frontendTree = `ayurvaflow/
├── apps/
│   ├── web/                          # Next.js 14 App Router
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── forgot-password/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx        # Role-aware shell
│   │   │   │   ├── admin/
│   │   │   │   │   ├── page.tsx      # Admin dashboard
│   │   │   │   │   ├── patients/
│   │   │   │   │   ├── staff/
│   │   │   │   │   ├── settings/
│   │   │   │   │   └── analytics/
│   │   │   │   ├── reception/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── patients/
│   │   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   │   └── [id]/page.tsx
│   │   │   │   │   ├── appointments/
│   │   │   │   │   └── billing/
│   │   │   │   ├── doctor/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── consultations/
│   │   │   │   │   │   └── [id]/page.tsx
│   │   │   │   │   └── patients/
│   │   │   │   │       └── [id]/
│   │   │   │   │           ├── page.tsx
│   │   │   │   │           ├── medical-history/
│   │   │   │   │           └── treatment-plan/
│   │   │   │   └── therapist/
│   │   │   │       ├── page.tsx
│   │   │   │       └── sessions/
│   │   │   ├── portal/               # Patient self-service
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── appointments/
│   │   │   │   ├── records/
│   │   │   │   ├── billing/
│   │   │   │   └── consent/
│   │   │   └── api/                  # Next.js API routes (thin proxies)
│   │   ├── components/
│   │   │   ├── ui/                   # Shadcn/UI components
│   │   │   ├── patients/
│   │   │   │   ├── PatientForm.tsx
│   │   │   │   ├── PatientCard.tsx
│   │   │   │   ├── MedicalHistory.tsx
│   │   │   │   └── ConsentWizard.tsx
│   │   │   ├── appointments/
│   │   │   │   ├── Calendar.tsx
│   │   │   │   ├── AppointmentSlot.tsx
│   │   │   │   └── BookingModal.tsx
│   │   │   ├── billing/
│   │   │   │   ├── InvoiceForm.tsx
│   │   │   │   └── PaymentModal.tsx
│   │   │   ├── consultation/
│   │   │   │   ├── ConsultationForm.tsx
│   │   │   │   ├── DoshaAssessment.tsx
│   │   │   │   └── TreatmentPlanForm.tsx
│   │   │   └── shared/
│   │   │       ├── SignaturePad.tsx
│   │   │       ├── FileUpload.tsx
│   │   │       ├── DataTable.tsx
│   │   │       └── RoleBadge.tsx
│   │   ├── hooks/
│   │   │   ├── usePatient.ts
│   │   │   ├── useAppointments.ts
│   │   │   ├── useBilling.ts
│   │   │   └── useNotifications.ts
│   │   ├── lib/
│   │   │   ├── api.ts                # Axios instance + interceptors
│   │   │   ├── auth.ts               # JWT helpers
│   │   │   └── utils.ts
│   │   ├── stores/
│   │   │   ├── authStore.ts          # Zustand auth state
│   │   │   └── tenantStore.ts
│   │   └── middleware.ts             # Next.js tenant routing`

const backendTree = `├── apps/
│   └── api/                          # NestJS application
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── strategies/
│       │   │   │   │   ├── jwt.strategy.ts
│       │   │   │   │   └── refresh.strategy.ts
│       │   │   │   └── guards/
│       │   │   │       ├── jwt-auth.guard.ts
│       │   │   │       └── roles.guard.ts
│       │   │   ├── tenants/
│       │   │   ├── patients/
│       │   │   │   ├── patients.module.ts
│       │   │   │   ├── patients.controller.ts
│       │   │   │   ├── patients.service.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── create-patient.dto.ts
│       │   │   │   │   └── update-patient.dto.ts
│       │   │   │   └── entities/patient.entity.ts
│       │   │   ├── medical-history/
│       │   │   ├── consents/
│       │   │   ├── appointments/
│       │   │   ├── consultations/
│       │   │   ├── treatment-plans/
│       │   │   ├── billing/
│       │   │   │   ├── invoices/
│       │   │   │   └── payments/
│       │   │   │       └── razorpay.webhook.ts
│       │   │   ├── documents/
│       │   │   │   └── s3.service.ts
│       │   │   ├── notifications/
│       │   │   │   ├── channels/
│       │   │   │   │   ├── sms.service.ts
│       │   │   │   │   ├── whatsapp.service.ts
│       │   │   │   │   ├── email.service.ts
│       │   │   │   │   └── push.service.ts
│       │   │   │   └── jobs/
│       │   │   │       └── reminder.processor.ts
│       │   │   └── analytics/
│       │   ├── common/
│       │   │   ├── decorators/
│       │   │   │   ├── roles.decorator.ts
│       │   │   │   └── tenant.decorator.ts
│       │   │   ├── interceptors/
│       │   │   │   ├── tenant.interceptor.ts
│       │   │   │   └── audit.interceptor.ts
│       │   │   ├── middleware/
│       │   │   │   └── tenant.middleware.ts
│       │   │   └── filters/
│       │   │       └── global-exception.filter.ts
│       │   └── prisma/
│       │       └── prisma.service.ts
│       └── prisma/
│           ├── schema.prisma
│           └── migrations/
├── packages/
│   ├── shared-types/                 # Shared TypeScript types
│   │   ├── patient.types.ts
│   │   ├── billing.types.ts
│   │   └── notification.types.ts
│   ├── ui-components/               # Shared React components
│   └── config/                      # Shared config schemas
├── infrastructure/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── rds.tf
│   │   ├── ecs.tf
│   │   └── s3.tf
│   └── docker/
│       ├── Dockerfile.api
│       └── Dockerfile.web
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── pnpm-workspace.yaml
└── turbo.json                        # Turborepo build pipeline`

export default function FolderStructure() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B4332] mb-1">Folder Structure</h2>
        <p className="text-gray-600 text-sm" style={sf('sans-serif')}>
          Turborepo monorepo — Next.js frontend + NestJS backend + shared packages. Managed with pnpm workspaces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {[
          { title: 'Monorepo Tool', body: 'Turborepo for build caching + task orchestration. pnpm workspaces for dependency management. Remote caching cuts CI build time by ~70%.', icon: '⚡' },
          { title: 'apps/web', body: 'Next.js 14 with App Router. Grouped route segments: (auth), (dashboard), portal. TypeScript strict mode. Tailwind + shadcn/ui.', icon: '🌐' },
          { title: 'apps/api', body: 'NestJS modular architecture. One module per domain (patients, billing, etc.). Prisma ORM. Bull queues for async jobs. Swagger auto-docs.', icon: '🔧' },
        ].map(c => (
          <Card key={c.title} className="border-l-4 border-l-[#1B4332]">
            <CardContent className="pt-4 px-4 pb-4">
              <div className="text-2xl mb-2">{c.icon}</div>
              <p className="font-bold text-sm text-[#1B4332] mb-1" style={sf('sans-serif')}>{c.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed" style={sf('sans-serif')}>{c.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="py-3 px-4 bg-[#0369A1]">
            <CardTitle className="text-white text-sm font-mono">Frontend — apps/web/</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <pre className="text-xs p-4 overflow-x-auto text-gray-700 bg-gray-50 leading-relaxed" style={sf('monospace')}>
              {frontendTree}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4 bg-[#1B4332]">
            <CardTitle className="text-white text-sm font-mono">Backend — apps/api/ + root</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <pre className="text-xs p-4 overflow-x-auto text-gray-700 bg-gray-50 leading-relaxed" style={sf('monospace')}>
              {backendTree}
            </pre>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm text-[#1B4332]" style={sf('sans-serif')}>Key Config Files</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2 text-xs" style={sf('sans-serif')}>
              {[
                ['turbo.json', 'Build pipeline — web depends on api types. Parallel builds.'],
                ['pnpm-workspace.yaml', 'Declares packages: [apps/*, packages/*]'],
                ['packages/shared-types', 'TypeScript interfaces shared between FE and BE'],
                ['apps/web/middleware.ts', 'Resolves tenant from subdomain, attaches to request'],
                ['apps/api/prisma/schema.prisma', 'Single schema, multi-tenant with tenant_id on all models'],
                ['.github/workflows/deploy.yml', 'Build → Test → Docker push → ECS rolling deploy'],
              ].map(([file, desc]) => (
                <div key={file} className="flex gap-2 border-b border-gray-50 pb-2">
                  <code className="font-mono text-[#1B4332] font-semibold flex-shrink-0 w-44">{file}</code>
                  <span className="text-gray-600">{desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm text-[#1B4332]" style={sf('sans-serif')}>Environment Variables</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            <pre className="text-xs bg-gray-900 text-green-400 rounded p-3 overflow-x-auto leading-relaxed" style={sf('monospace')}>
{`# apps/api/.env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=ayurvaflow-docs
AWS_REGION=ap-south-1
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
WHATSAPP_API_TOKEN=...
AWS_SES_FROM_EMAIL=noreply@ayurvaflow.com
SENTRY_DSN=...

# apps/web/.env.local
NEXT_PUBLIC_API_URL=https://api.ayurvaflow.com
NEXT_PUBLIC_RAZORPAY_KEY=...`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
