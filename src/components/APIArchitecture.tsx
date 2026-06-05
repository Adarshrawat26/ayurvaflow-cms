import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const methodColor: Record<string, string> = {
  GET: '#15803D', POST: '#1D4ED8', PUT: '#D97706', PATCH: '#9333EA', DELETE: '#DC2626', WS: '#0891B2',
}
const methodBg: Record<string, string> = {
  GET: '#DCFCE7', POST: '#DBEAFE', PUT: '#FEF3C7', PATCH: '#F3E8FF', DELETE: '#FEE2E2', WS: '#CFFAFE',
}

const apiGroups = [
  {
    name: 'Auth',
    base: '/api/v1/auth',
    endpoints: [
      { method: 'POST', path: '/login', desc: 'Login with email + password, returns JWT pair', auth: false },
      { method: 'POST', path: '/refresh', desc: 'Refresh access token using refresh token', auth: false },
      { method: 'POST', path: '/logout', desc: 'Invalidate refresh token', auth: true },
      { method: 'POST', path: '/forgot-password', desc: 'Send OTP to email/phone', auth: false },
      { method: 'POST', path: '/reset-password', desc: 'Verify OTP and set new password', auth: false },
      { method: 'GET', path: '/me', desc: 'Get current user profile', auth: true },
    ],
  },
  {
    name: 'Tenants',
    base: '/api/v1/tenants',
    endpoints: [
      { method: 'POST', path: '/', desc: 'Provision new tenant (Super Admin only)', auth: true },
      { method: 'GET', path: '/', desc: 'List all tenants (Super Admin)', auth: true },
      { method: 'GET', path: '/:id', desc: 'Get tenant details', auth: true },
      { method: 'PATCH', path: '/:id', desc: 'Update tenant settings / plan', auth: true },
      { method: 'DELETE', path: '/:id', desc: 'Suspend tenant', auth: true },
      { method: 'GET', path: '/:id/stats', desc: 'Tenant usage statistics', auth: true },
    ],
  },
  {
    name: 'Patients',
    base: '/api/v1/patients',
    endpoints: [
      { method: 'POST', path: '/', desc: 'Register new patient', auth: true },
      { method: 'GET', path: '/', desc: 'List patients (paginated, filterable)', auth: true },
      { method: 'GET', path: '/:id', desc: 'Get full patient profile', auth: true },
      { method: 'PATCH', path: '/:id', desc: 'Update patient info', auth: true },
      { method: 'GET', path: '/:id/timeline', desc: 'Full patient journey timeline', auth: true },
      { method: 'GET', path: '/:id/documents', desc: 'List patient documents', auth: true },
      { method: 'POST', path: '/search', desc: 'Search patients by name/phone/code', auth: true },
      { method: 'GET', path: '/:id/emergency-contacts', desc: 'Get emergency contacts', auth: true },
      { method: 'POST', path: '/:id/emergency-contacts', desc: 'Add emergency contact', auth: true },
    ],
  },
  {
    name: 'Medical History',
    base: '/api/v1/patients/:pid/medical-history',
    endpoints: [
      { method: 'GET', path: '/', desc: 'Get patient medical history', auth: true },
      { method: 'PUT', path: '/', desc: 'Update/create medical history record', auth: true },
      { method: 'POST', path: '/documents', desc: 'Upload medical document (S3 presigned URL)', auth: true },
      { method: 'DELETE', path: '/documents/:docId', desc: 'Delete uploaded document', auth: true },
    ],
  },
  {
    name: 'Consents',
    base: '/api/v1/patients/:pid/consents',
    endpoints: [
      { method: 'GET', path: '/', desc: 'Get all consent records for patient', auth: true },
      { method: 'POST', path: '/', desc: 'Submit signed consent form (with signature_data, IP)', auth: true },
      { method: 'GET', path: '/latest', desc: 'Get most recent consent record', auth: true },
      { method: 'GET', path: '/:id/audit', desc: 'Get consent audit trail', auth: true },
    ],
  },
  {
    name: 'Appointments',
    base: '/api/v1/appointments',
    endpoints: [
      { method: 'POST', path: '/', desc: 'Book new appointment', auth: true },
      { method: 'GET', path: '/', desc: 'List appointments (filter by date, doctor, status)', auth: true },
      { method: 'GET', path: '/:id', desc: 'Get appointment details', auth: true },
      { method: 'PATCH', path: '/:id/reschedule', desc: 'Reschedule appointment', auth: true },
      { method: 'PATCH', path: '/:id/cancel', desc: 'Cancel appointment', auth: true },
      { method: 'PATCH', path: '/:id/status', desc: 'Update status (arrived, in_progress, completed)', auth: true },
      { method: 'GET', path: '/availability', desc: 'Get doctor availability slots', auth: true },
      { method: 'GET', path: '/calendar', desc: 'Calendar view (daily/weekly)', auth: true },
    ],
  },
  {
    name: 'Consultations',
    base: '/api/v1/consultations',
    endpoints: [
      { method: 'POST', path: '/', desc: 'Create consultation record (doctor)', auth: true },
      { method: 'GET', path: '/:id', desc: 'Get consultation details', auth: true },
      { method: 'PUT', path: '/:id', desc: 'Update consultation (add notes, diagnosis)', auth: true },
      { method: 'GET', path: '/patient/:pid', desc: 'All consultations for a patient', auth: true },
      { method: 'POST', path: '/:id/treatment-plan', desc: 'Create treatment plan from consultation', auth: true },
    ],
  },
  {
    name: 'Treatment Plans',
    base: '/api/v1/treatment-plans',
    endpoints: [
      { method: 'GET', path: '/:id', desc: 'Get treatment plan details', auth: true },
      { method: 'PATCH', path: '/:id', desc: 'Update treatment plan', auth: true },
      { method: 'POST', path: '/:id/sessions/generate', desc: 'Auto-generate session schedule', auth: true },
      { method: 'GET', path: '/:id/sessions', desc: 'List all sessions for plan', auth: true },
      { method: 'PATCH', path: '/:id/sessions/:sid', desc: 'Update session (assign therapist, room, status)', auth: true },
      { method: 'PATCH', path: '/:id/sessions/:sid/start', desc: 'Mark session In Progress', auth: true },
      { method: 'PATCH', path: '/:id/sessions/:sid/complete', desc: 'Mark session Completed with notes', auth: true },
    ],
  },
  {
    name: 'Billing',
    base: '/api/v1/billing',
    endpoints: [
      { method: 'POST', path: '/invoices', desc: 'Generate invoice', auth: true },
      { method: 'GET', path: '/invoices', desc: 'List invoices (paginated)', auth: true },
      { method: 'GET', path: '/invoices/:id', desc: 'Get invoice details', auth: true },
      { method: 'PATCH', path: '/invoices/:id', desc: 'Apply discount, update status', auth: true },
      { method: 'GET', path: '/invoices/:id/pdf', desc: 'Download invoice PDF', auth: true },
      { method: 'POST', path: '/payments', desc: 'Record payment / initiate Razorpay order', auth: true },
      { method: 'POST', path: '/payments/webhook', desc: 'Razorpay webhook (signature verified)', auth: false },
      { method: 'GET', path: '/payments/:id/receipt', desc: 'Download receipt PDF', auth: true },
    ],
  },
  {
    name: 'Analytics',
    base: '/api/v1/analytics',
    endpoints: [
      { method: 'GET', path: '/dashboard', desc: 'Admin dashboard metrics snapshot', auth: true },
      { method: 'GET', path: '/revenue', desc: 'Revenue report (date range, grouping)', auth: true },
      { method: 'GET', path: '/patients', desc: 'Patient analytics (new, active, by referral)', auth: true },
      { method: 'GET', path: '/doctors', desc: 'Doctor performance report', auth: true },
      { method: 'GET', path: '/treatments', desc: 'Treatment utilization report', auth: true },
      { method: 'GET', path: '/therapist-utilization', desc: 'Therapist session hours report', auth: true },
    ],
  },
  {
    name: 'Notifications',
    base: '/api/v1/notifications',
    endpoints: [
      { method: 'GET', path: '/', desc: 'In-app notifications for current user', auth: true },
      { method: 'PATCH', path: '/:id/read', desc: 'Mark notification as read', auth: true },
      { method: 'POST', path: '/send', desc: 'Manual send (Admin — SMS/email/WhatsApp)', auth: true },
      { method: 'GET', path: '/templates', desc: 'List notification templates', auth: true },
      { method: 'PUT', path: '/templates/:id', desc: 'Update template (Admin)', auth: true },
    ],
  },
  {
    name: 'WebSocket Events',
    base: 'ws://api/v1/ws',
    endpoints: [
      { method: 'WS', path: 'appointment:status_changed', desc: 'Real-time appointment status updates', auth: true },
      { method: 'WS', path: 'session:started', desc: 'Treatment session started broadcast', auth: true },
      { method: 'WS', path: 'payment:confirmed', desc: 'Payment confirmed notification', auth: true },
      { method: 'WS', path: 'notification:new', desc: 'New in-app notification push', auth: true },
    ],
  },
]

export default function APIArchitecture() {
  const [active, setActive] = useState('Auth')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B4332] mb-1">API Architecture</h2>
        <p className="text-gray-600 text-sm" style={{ fontFamily: 'sans-serif' }}>
          RESTful JSON API (NestJS) + WebSocket gateway. Base URL: <code className="bg-gray-100 px-1 rounded text-xs">https://api.ayurvaflow.com</code>. All requests require <code className="bg-gray-100 px-1 rounded text-xs">X-Tenant-ID</code> header resolved from subdomain middleware.
        </p>
      </div>

      {/* Architecture diagram */}
      <div className="bg-[#1B4332] rounded-lg p-4">
        <svg viewBox="0 0 900 180" className="w-full">
          {/* Client */}
          <rect x="10" y="60" width="110" height="60" rx="6" fill="#2D6A4F" stroke="#D4A017" strokeWidth="1.5" />
          <text x="65" y="85" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Client</text>
          <text x="65" y="98" textAnchor="middle" fill="#A8D5B5" fontSize="8">Next.js SPA</text>
          <text x="65" y="110" textAnchor="middle" fill="#A8D5B5" fontSize="8">Mobile PWA</text>
          {/* Arrow */}
          <line x1="120" y1="90" x2="155" y2="90" stroke="#D4A017" strokeWidth="1.5" markerEnd="url(#arrow)" />
          {/* API Gateway */}
          <rect x="155" y="50" width="130" height="80" rx="6" fill="#D4A017" />
          <text x="220" y="75" textAnchor="middle" fill="#1B4332" fontSize="10" fontWeight="bold">API Gateway</text>
          <text x="220" y="88" textAnchor="middle" fill="#1B4332" fontSize="8">Tenant Middleware</text>
          <text x="220" y="100" textAnchor="middle" fill="#1B4332" fontSize="8">JWT Guard</text>
          <text x="220" y="112" textAnchor="middle" fill="#1B4332" fontSize="8">Rate Limiter</text>
          <text x="220" y="124" textAnchor="middle" fill="#1B4332" fontSize="8">Request Logger</text>
          {/* Arrow */}
          <line x1="285" y1="90" x2="320" y2="90" stroke="#D4A017" strokeWidth="1.5" />
          {/* NestJS */}
          <rect x="320" y="40" width="140" height="100" rx="6" fill="#163828" stroke="#2D6A4F" strokeWidth="1.5" />
          <text x="390" y="62" textAnchor="middle" fill="#D4A017" fontSize="10" fontWeight="bold">NestJS App</text>
          <text x="390" y="76" textAnchor="middle" fill="#A8D5B5" fontSize="8">Controllers → Services</text>
          <text x="390" y="88" textAnchor="middle" fill="#A8D5B5" fontSize="8">Guards → Interceptors</text>
          <text x="390" y="100" textAnchor="middle" fill="#A8D5B5" fontSize="8">Pipes → Decorators</text>
          <text x="390" y="112" textAnchor="middle" fill="#A8D5B5" fontSize="8">Bull Queue Workers</text>
          <text x="390" y="124" textAnchor="middle" fill="#A8D5B5" fontSize="8">WebSocket Gateway</text>
          {/* Arrows to data stores */}
          <line x1="460" y1="75" x2="500" y2="55" stroke="#A8D5B5" strokeWidth="1.5" />
          <line x1="460" y1="90" x2="500" y2="90" stroke="#A8D5B5" strokeWidth="1.5" />
          <line x1="460" y1="105" x2="500" y2="125" stroke="#A8D5B5" strokeWidth="1.5" />
          {/* PostgreSQL */}
          <rect x="500" y="20" width="110" height="50" rx="6" fill="#0369A1" stroke="#7DD3FC" strokeWidth="1.5" />
          <text x="555" y="40" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">PostgreSQL</text>
          <text x="555" y="52" textAnchor="middle" fill="#BAE6FD" fontSize="8">Prisma ORM</text>
          <text x="555" y="64" textAnchor="middle" fill="#BAE6FD" fontSize="8">RLS Policies</text>
          {/* Redis */}
          <rect x="500" y="80" width="110" height="40" rx="6" fill="#DC2626" stroke="#FCA5A5" strokeWidth="1.5" />
          <text x="555" y="97" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">Redis</text>
          <text x="555" y="110" textAnchor="middle" fill="#FECACA" fontSize="8">Cache + Sessions + Bull</text>
          {/* S3 */}
          <rect x="500" y="130" width="110" height="40" rx="6" fill="#92400E" stroke="#FCD34D" strokeWidth="1.5" />
          <text x="555" y="147" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">AWS S3</text>
          <text x="555" y="160" textAnchor="middle" fill="#FDE68A" fontSize="8">Documents + PDFs</text>
          {/* External services */}
          <line x1="610" y1="45" x2="650" y2="45" stroke="#A8D5B5" strokeWidth="1.5" />
          <rect x="650" y="10" width="230" height="160" rx="6" fill="#163828" stroke="#2D6A4F" strokeWidth="1.5" />
          <text x="765" y="30" textAnchor="middle" fill="#D4A017" fontSize="10" fontWeight="bold">External Services</text>
          <text x="765" y="50" textAnchor="middle" fill="#A8D5B5" fontSize="8">📱 Twilio — SMS</text>
          <text x="765" y="66" textAnchor="middle" fill="#A8D5B5" fontSize="8">💬 WhatsApp Business API</text>
          <text x="765" y="82" textAnchor="middle" fill="#A8D5B5" fontSize="8">📧 AWS SES — Email</text>
          <text x="765" y="98" textAnchor="middle" fill="#A8D5B5" fontSize="8">💳 Razorpay — Payments</text>
          <text x="765" y="114" textAnchor="middle" fill="#A8D5B5" fontSize="8">🔔 Firebase FCM — Push</text>
          <text x="765" y="130" textAnchor="middle" fill="#A8D5B5" fontSize="8">🔍 Elasticsearch — Search</text>
          <text x="765" y="146" textAnchor="middle" fill="#A8D5B5" fontSize="8">📊 Datadog — APM</text>
          <text x="765" y="162" textAnchor="middle" fill="#A8D5B5" fontSize="8">🚨 Sentry — Errors</text>
          {/* arrow marker */}
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#D4A017" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Endpoint table */}
      <div className="flex flex-wrap gap-2 mb-4">
        {apiGroups.map(g => (
          <button
            key={g.name}
            onClick={() => setActive(g.name)}
            className="px-3 py-1 rounded text-xs font-medium transition-all"
            style={{
              fontFamily: 'sans-serif',
              backgroundColor: active === g.name ? '#1B4332' : '#F3F4F6',
              color: active === g.name ? 'white' : '#374151',
            }}
          >
            {g.name}
          </button>
        ))}
      </div>

      {apiGroups.filter(g => g.name === active).map(group => (
        <Card key={group.name}>
          <CardHeader className="py-3 px-4 bg-[#1B4332]">
            <CardTitle className="text-white text-sm font-mono">{group.base}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs" style={{ fontFamily: 'sans-serif' }}>
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 w-16">Method</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Endpoint</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Description</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-700 w-16">Auth</th>
                </tr>
              </thead>
              <tbody>
                {group.endpoints.map((ep, i) => (
                  <tr key={i} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold font-mono"
                        style={{ backgroundColor: methodBg[ep.method], color: methodColor[ep.method] }}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-gray-800">{ep.path}</td>
                    <td className="px-4 py-2 text-gray-600">{ep.desc}</td>
                    <td className="px-4 py-2 text-center">{ep.auth ? '🔒' : '🌐'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm" style={{ fontFamily: 'sans-serif', color: '#1B4332' }}>Standard Response Envelope</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            <pre className="text-xs bg-gray-50 rounded p-3 overflow-x-auto text-gray-700">
{`{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 342,
    "totalPages": 18
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_abc123"
}`}
            </pre>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm" style={{ fontFamily: 'sans-serif', color: '#1B4332' }}>Error Response Format</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            <pre className="text-xs bg-gray-50 rounded p-3 overflow-x-auto text-gray-700">
{`{
  "success": false,
  "error": {
    "code": "PATIENT_NOT_FOUND",
    "message": "Patient with id xyz not found",
    "statusCode": 404,
    "details": []
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_abc123"
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
