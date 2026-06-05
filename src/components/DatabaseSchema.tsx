import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

const tables = [
  {
    name: 'tenants',
    group: 'Core',
    desc: 'One row per Ayurveda clinic. Root of all multi-tenant data.',
    columns: [
      { name: 'id', type: 'UUID PK', desc: 'Primary key' },
      { name: 'name', type: 'VARCHAR(200)', desc: 'Clinic name' },
      { name: 'subdomain', type: 'VARCHAR(100) UNIQUE', desc: 'e.g. kairali' },
      { name: 'custom_domain', type: 'VARCHAR(255)', desc: 'Optional custom domain' },
      { name: 'plan', type: 'ENUM(starter,growth,enterprise)', desc: 'Subscription plan' },
      { name: 'status', type: 'ENUM(active,suspended,trial)', desc: 'Account status' },
      { name: 'settings', type: 'JSONB', desc: 'Feature flags, branding, timezone' },
      { name: 'created_at', type: 'TIMESTAMPTZ', desc: 'Provisioned date' },
    ],
  },
  {
    name: 'users',
    group: 'Core',
    desc: 'All system users across roles. Linked to a tenant.',
    columns: [
      { name: 'id', type: 'UUID PK', desc: 'Primary key' },
      { name: 'tenant_id', type: 'UUID FK→tenants', desc: 'Tenant reference' },
      { name: 'role', type: 'ENUM(super_admin,admin,receptionist,doctor,therapist,patient)', desc: 'User role' },
      { name: 'email', type: 'VARCHAR(255) UNIQUE', desc: 'Login email' },
      { name: 'phone', type: 'VARCHAR(20)', desc: 'Mobile number' },
      { name: 'password_hash', type: 'TEXT', desc: 'Bcrypt hash' },
      { name: 'first_name', type: 'VARCHAR(100)', desc: '' },
      { name: 'last_name', type: 'VARCHAR(100)', desc: '' },
      { name: 'is_active', type: 'BOOLEAN DEFAULT true', desc: '' },
      { name: 'last_login', type: 'TIMESTAMPTZ', desc: '' },
      { name: 'refresh_token_hash', type: 'TEXT', desc: 'For JWT refresh' },
    ],
  },
  {
    name: 'patients',
    group: 'Patient',
    desc: 'Extended patient profile beyond user record.',
    columns: [
      { name: 'id', type: 'UUID PK', desc: '' },
      { name: 'tenant_id', type: 'UUID FK→tenants', desc: 'RLS key' },
      { name: 'user_id', type: 'UUID FK→users', desc: 'Linked user account' },
      { name: 'patient_code', type: 'VARCHAR(20)', desc: 'e.g. KAI-2024-0001' },
      { name: 'title', type: 'ENUM(Mr,Mrs,Ms,Dr,Prof)', desc: '' },
      { name: 'middle_name', type: 'VARCHAR(100)', desc: '' },
      { name: 'dob', type: 'DATE', desc: '' },
      { name: 'gender', type: 'ENUM(male,female,other)', desc: '' },
      { name: 'occupation', type: 'VARCHAR(150)', desc: '' },
      { name: 'nationality', type: 'VARCHAR(100)', desc: '' },
      { name: 'blood_group', type: 'VARCHAR(5)', desc: '' },
      { name: 'alt_phone', type: 'VARCHAR(20)', desc: '' },
      { name: 'address', type: 'TEXT', desc: '' },
      { name: 'city', type: 'VARCHAR(100)', desc: '' },
      { name: 'state', type: 'VARCHAR(100)', desc: '' },
      { name: 'country', type: 'VARCHAR(100)', desc: '' },
      { name: 'pincode', type: 'VARCHAR(20)', desc: '' },
      { name: 'referral_source', type: 'ENUM(website,social_media,advertisement,doctor_referral,existing_patient,others)', desc: '' },
      { name: 'referral_notes', type: 'TEXT', desc: '' },
      { name: 'purpose_of_visit', type: 'ENUM(consultation,health_maintenance,preventive)', desc: '' },
      { name: 'created_at', type: 'TIMESTAMPTZ', desc: '' },
    ],
  },
  {
    name: 'emergency_contacts',
    group: 'Patient',
    desc: 'Emergency contact persons for each patient.',
    columns: [
      { name: 'id', type: 'UUID PK', desc: '' },
      { name: 'tenant_id', type: 'UUID FK→tenants', desc: '' },
      { name: 'patient_id', type: 'UUID FK→patients', desc: '' },
      { name: 'name', type: 'VARCHAR(200)', desc: '' },
      { name: 'relation', type: 'VARCHAR(100)', desc: 'e.g. Spouse, Parent' },
      { name: 'phone', type: 'VARCHAR(20)', desc: '' },
    ],
  },
  {
    name: 'medical_histories',
    group: 'Medical',
    desc: 'Core medical history record per patient.',
    columns: [
      { name: 'id', type: 'UUID PK', desc: '' },
      { name: 'tenant_id', type: 'UUID FK→tenants', desc: '' },
      { name: 'patient_id', type: 'UUID FK→patients', desc: '' },
      { name: 'lifestyle_diseases', type: 'JSONB', desc: '{ diabetes: true, hypertension: false, ... }' },
      { name: 'allergies', type: 'TEXT[]', desc: 'Array of allergen strings' },
      { name: 'current_medications', type: 'JSONB[]', desc: '[{name, dose, frequency}]' },
      { name: 'surgical_history', type: 'JSONB[]', desc: '[{procedure, year, hospital}]' },
      { name: 'family_history', type: 'JSONB', desc: '{diabetes: true, heart_disease: false}' },
      { name: 'previous_ayurveda_tx', type: 'TEXT', desc: 'Free text description' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', desc: '' },
    ],
  },
  {
    name: 'consents',
    group: 'Consent',
    desc: 'Digital consent records with full audit trail.',
    columns: [
      { name: 'id', type: 'UUID PK', desc: '' },
      { name: 'tenant_id', type: 'UUID FK→tenants', desc: '' },
      { name: 'patient_id', type: 'UUID FK→patients', desc: '' },
      { name: 'consent_version', type: 'VARCHAR(20)', desc: 'Version of consent template' },
      { name: 'treatment_understanding', type: 'BOOLEAN', desc: '' },
      { name: 'risk_acceptance', type: 'BOOLEAN', desc: '' },
      { name: 'medical_disclosure', type: 'BOOLEAN', desc: '' },
      { name: 'medication_disclosure', type: 'BOOLEAN', desc: '' },
      { name: 'data_privacy', type: 'BOOLEAN', desc: '' },
      { name: 'marketing_consent', type: 'BOOLEAN', desc: '' },
      { name: 'signature_data', type: 'TEXT', desc: 'Base64 SVG of e-signature' },
      { name: 'signed_at', type: 'TIMESTAMPTZ', desc: '' },
      { name: 'ip_address', type: 'INET', desc: 'Client IP at time of signing' },
      { name: 'user_agent', type: 'TEXT', desc: 'Browser/device info' },
    ],
  },
  {
    name: 'consultations',
    group: 'Clinical',
    desc: 'Doctor consultation records per visit.',
    columns: [
      { name: 'id', type: 'UUID PK', desc: '' },
      { name: 'tenant_id', type: 'UUID FK→tenants', desc: '' },
      { name: 'patient_id', type: 'UUID FK→patients', desc: '' },
      { name: 'doctor_id', type: 'UUID FK→users', desc: '' },
      { name: 'appointment_id', type: 'UUID FK→appointments', desc: '' },
      { name: 'chief_complaints', type: 'JSONB[]', desc: '[{complaint, duration, severity}]' },
      { name: 'diagnosis', type: 'TEXT', desc: '' },
      { name: 'prakriti', type: 'ENUM(vata,pitta,kapha,vata_pitta,pitta_kapha,vata_kapha,tridosha)', desc: '' },
      { name: 'vikriti', type: 'TEXT', desc: 'Current imbalances' },
      { name: 'dosha_notes', type: 'TEXT', desc: '' },
      { name: 'diet_recommendations', type: 'TEXT', desc: '' },
      { name: 'lifestyle_recommendations', type: 'TEXT', desc: '' },
      { name: 'follow_up_days', type: 'INTEGER', desc: 'Suggested days until next visit' },
      { name: 'created_at', type: 'TIMESTAMPTZ', desc: '' },
    ],
  },
  {
    name: 'treatment_plans',
    group: 'Treatment',
    desc: 'Defined course of treatment for a patient.',
    columns: [
      { name: 'id', type: 'UUID PK', desc: '' },
      { name: 'tenant_id', type: 'UUID FK→tenants', desc: '' },
      { name: 'consultation_id', type: 'UUID FK→consultations', desc: '' },
      { name: 'patient_id', type: 'UUID FK→patients', desc: '' },
      { name: 'treatment_name', type: 'VARCHAR(200)', desc: '' },
      { name: 'treatment_type', type: 'ENUM(panchakarma,abhyangam,shirodhara,kizhi,nasya,custom)', desc: '' },
      { name: 'duration_days', type: 'INTEGER', desc: '' },
      { name: 'sessions_per_day', type: 'INTEGER DEFAULT 1', desc: '' },
      { name: 'total_sessions', type: 'INTEGER', desc: '' },
      { name: 'medicines', type: 'JSONB[]', desc: '[{name, dose, timing, anupana}]' },
      { name: 'status', type: 'ENUM(planned,active,completed,cancelled)', desc: '' },
      { name: 'start_date', type: 'DATE', desc: '' },
      { name: 'end_date', type: 'DATE', desc: '' },
    ],
  },
  {
    name: 'appointments',
    group: 'Scheduling',
    desc: 'All appointment bookings.',
    columns: [
      { name: 'id', type: 'UUID PK', desc: '' },
      { name: 'tenant_id', type: 'UUID FK→tenants', desc: '' },
      { name: 'patient_id', type: 'UUID FK→patients', desc: '' },
      { name: 'doctor_id', type: 'UUID FK→users', desc: '' },
      { name: 'appointment_date', type: 'DATE', desc: '' },
      { name: 'start_time', type: 'TIME', desc: '' },
      { name: 'end_time', type: 'TIME', desc: '' },
      { name: 'type', type: 'ENUM(consultation,follow_up,treatment)', desc: '' },
      { name: 'status', type: 'ENUM(scheduled,confirmed,arrived,in_progress,completed,cancelled,no_show)', desc: '' },
      { name: 'notes', type: 'TEXT', desc: '' },
      { name: 'booked_by', type: 'UUID FK→users', desc: '' },
      { name: 'cancelled_reason', type: 'TEXT', desc: '' },
    ],
  },
  {
    name: 'treatment_sessions',
    group: 'Treatment',
    desc: 'Individual treatment session instances.',
    columns: [
      { name: 'id', type: 'UUID PK', desc: '' },
      { name: 'tenant_id', type: 'UUID FK→tenants', desc: '' },
      { name: 'treatment_plan_id', type: 'UUID FK→treatment_plans', desc: '' },
      { name: 'patient_id', type: 'UUID FK→patients', desc: '' },
      { name: 'therapist_id', type: 'UUID FK→users', desc: '' },
      { name: 'room_id', type: 'UUID FK→rooms', desc: '' },
      { name: 'session_number', type: 'INTEGER', desc: 'e.g. 3 of 14' },
      { name: 'scheduled_date', type: 'DATE', desc: '' },
      { name: 'scheduled_time', type: 'TIME', desc: '' },
      { name: 'started_at', type: 'TIMESTAMPTZ', desc: '' },
      { name: 'ended_at', type: 'TIMESTAMPTZ', desc: '' },
      { name: 'status', type: 'ENUM(scheduled,in_progress,completed,cancelled)', desc: '' },
      { name: 'therapist_notes', type: 'TEXT', desc: '' },
      { name: 'patient_feedback', type: 'TEXT', desc: '' },
    ],
  },
  {
    name: 'invoices',
    group: 'Billing',
    desc: 'Billing invoices for consultations and treatments.',
    columns: [
      { name: 'id', type: 'UUID PK', desc: '' },
      { name: 'tenant_id', type: 'UUID FK→tenants', desc: '' },
      { name: 'patient_id', type: 'UUID FK→patients', desc: '' },
      { name: 'invoice_number', type: 'VARCHAR(30) UNIQUE', desc: 'e.g. KAI-INV-2024-0089' },
      { name: 'consultation_charge', type: 'NUMERIC(10,2)', desc: '' },
      { name: 'treatment_charge', type: 'NUMERIC(10,2)', desc: '' },
      { name: 'medicine_charge', type: 'NUMERIC(10,2)', desc: '' },
      { name: 'discount_amount', type: 'NUMERIC(10,2) DEFAULT 0', desc: '' },
      { name: 'tax_amount', type: 'NUMERIC(10,2)', desc: '' },
      { name: 'total_amount', type: 'NUMERIC(10,2)', desc: '' },
      { name: 'paid_amount', type: 'NUMERIC(10,2)', desc: '' },
      { name: 'status', type: 'ENUM(draft,sent,paid,partial,overdue,cancelled)', desc: '' },
      { name: 'due_date', type: 'DATE', desc: '' },
    ],
  },
  {
    name: 'payments',
    group: 'Billing',
    desc: 'Payment transactions linked to invoices.',
    columns: [
      { name: 'id', type: 'UUID PK', desc: '' },
      { name: 'tenant_id', type: 'UUID FK→tenants', desc: '' },
      { name: 'invoice_id', type: 'UUID FK→invoices', desc: '' },
      { name: 'amount', type: 'NUMERIC(10,2)', desc: '' },
      { name: 'payment_mode', type: 'ENUM(cash,card,upi,net_banking)', desc: '' },
      { name: 'gateway_txn_id', type: 'VARCHAR(200)', desc: 'Razorpay payment ID' },
      { name: 'gateway_order_id', type: 'VARCHAR(200)', desc: '' },
      { name: 'status', type: 'ENUM(pending,success,failed,refunded)', desc: '' },
      { name: 'paid_at', type: 'TIMESTAMPTZ', desc: '' },
      { name: 'collected_by', type: 'UUID FK→users', desc: '' },
    ],
  },
  {
    name: 'documents',
    group: 'Documents',
    desc: 'Patient document storage metadata (files in AWS S3).',
    columns: [
      { name: 'id', type: 'UUID PK', desc: '' },
      { name: 'tenant_id', type: 'UUID FK→tenants', desc: '' },
      { name: 'patient_id', type: 'UUID FK→patients', desc: '' },
      { name: 'doc_type', type: 'ENUM(aadhaar,pan,prescription,lab_report,medical_history,consent,other)', desc: '' },
      { name: 'file_name', type: 'VARCHAR(255)', desc: '' },
      { name: 's3_key', type: 'TEXT', desc: 'S3 object key' },
      { name: 's3_bucket', type: 'VARCHAR(100)', desc: '' },
      { name: 'file_size', type: 'INTEGER', desc: 'Bytes' },
      { name: 'mime_type', type: 'VARCHAR(100)', desc: '' },
      { name: 'uploaded_by', type: 'UUID FK→users', desc: '' },
      { name: 'uploaded_at', type: 'TIMESTAMPTZ', desc: '' },
    ],
  },
]

const groups = ['Core', 'Patient', 'Medical', 'Consent', 'Clinical', 'Treatment', 'Scheduling', 'Billing', 'Documents']
const groupColors: Record<string, string> = {
  Core: '#7C3AED', Patient: '#0369A1', Medical: '#DC2626', Consent: '#9F1239',
  Clinical: '#065F46', Treatment: '#92400E', Scheduling: '#0891B2', Billing: '#B45309', Documents: '#6B7280',
}

export default function DatabaseSchema() {
  const [activeGroup, setActiveGroup] = useState('Core')
  const filtered = tables.filter(t => t.group === activeGroup)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B4332] mb-1">Database Schema</h2>
        <p className="text-gray-600 text-sm" style={{ fontFamily: 'sans-serif' }}>PostgreSQL — all tables include tenant_id for RLS-based multi-tenancy. Timestamps use TIMESTAMPTZ.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {groups.map(g => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className="px-3 py-1 rounded text-xs font-medium transition-all"
            style={{
              fontFamily: 'sans-serif',
              backgroundColor: activeGroup === g ? groupColors[g] : '#F3F4F6',
              color: activeGroup === g ? 'white' : '#374151',
              border: `1px solid ${activeGroup === g ? groupColors[g] : '#E5E7EB'}`,
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map(table => (
          <Card key={table.name} className="overflow-hidden">
            <CardHeader className="py-3 px-4" style={{ backgroundColor: groupColors[table.group] }}>
              <CardTitle className="text-white font-mono text-base flex items-center justify-between">
                <span>{table.name}</span>
                <span className="text-xs font-sans font-normal opacity-80">{table.desc}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs" style={{ fontFamily: 'monospace' }}>
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left font-semibold text-gray-700" style={{ fontFamily: 'sans-serif' }}>Column</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700" style={{ fontFamily: 'sans-serif' }}>Type / Constraint</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700" style={{ fontFamily: 'sans-serif' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {table.columns.map((col, i) => (
                    <tr key={col.name} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-1.5 font-mono font-semibold text-[#1B4332]">{col.name}</td>
                      <td className="px-4 py-1.5">
                        <span className="px-1.5 py-0.5 rounded text-xs" style={{
                          backgroundColor: col.type.includes('FK') ? '#FEF3C7' : col.type.includes('PK') ? '#D1FAE5' : col.type.includes('ENUM') ? '#EDE9FE' : '#F3F4F6',
                          color: col.type.includes('FK') ? '#92400E' : col.type.includes('PK') ? '#065F46' : col.type.includes('ENUM') ? '#5B21B6' : '#374151',
                        }}>
                          {col.type}
                        </span>
                      </td>
                      <td className="px-4 py-1.5 text-gray-500" style={{ fontFamily: 'sans-serif' }}>{col.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
