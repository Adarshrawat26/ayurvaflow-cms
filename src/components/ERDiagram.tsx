export default function ERDiagram() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B4332] mb-1">Entity Relationship Diagram</h2>
        <p className="text-gray-600 text-sm" style={{ fontFamily: 'sans-serif' }}>Core relationships between entities. All tables have tenant_id FK to tenants (omitted for clarity).</p>
      </div>

      <div className="bg-white rounded-lg border p-4 overflow-x-auto">
        <svg viewBox="0 0 1000 700" className="w-full" style={{ minWidth: 800 }}>
          {/* Background */}
          <rect width="1000" height="700" fill="#F7F5F0" />

          {/* === TENANTS (center-top) === */}
          <rect x="390" y="20" width="220" height="90" rx="6" fill="#1B4332" stroke="#D4A017" strokeWidth="2" />
          <text x="500" y="45" textAnchor="middle" fill="#D4A017" fontSize="13" fontWeight="bold">tenants</text>
          <line x1="390" y1="52" x2="610" y2="52" stroke="#D4A017" strokeWidth="1" />
          <text x="400" y="67" fill="#A8D5B5" fontSize="10">id UUID PK</text>
          <text x="400" y="80" fill="#A8D5B5" fontSize="10">subdomain VARCHAR UNIQUE</text>
          <text x="400" y="93" fill="#A8D5B5" fontSize="10">plan ENUM · settings JSONB</text>

          {/* === USERS === */}
          <rect x="20" y="160" width="200" height="110" rx="6" fill="#2D3748" stroke="#718096" strokeWidth="1.5" />
          <text x="120" y="182" textAnchor="middle" fill="#F7FAFC" fontSize="12" fontWeight="bold">users</text>
          <line x1="20" y1="188" x2="220" y2="188" stroke="#718096" strokeWidth="1" />
          <text x="30" y="202" fill="#CBD5E0" fontSize="9">id UUID PK</text>
          <text x="30" y="214" fill="#CBD5E0" fontSize="9">tenant_id FK</text>
          <text x="30" y="226" fill="#CBD5E0" fontSize="9">role ENUM</text>
          <text x="30" y="238" fill="#CBD5E0" fontSize="9">email · phone · password_hash</text>
          <text x="30" y="250" fill="#CBD5E0" fontSize="9">first_name · last_name</text>
          <text x="30" y="262" fill="#CBD5E0" fontSize="9">is_active · last_login</text>

          {/* === PATIENTS === */}
          <rect x="260" y="160" width="210" height="130" rx="6" fill="#0369A1" stroke="#7DD3FC" strokeWidth="1.5" />
          <text x="365" y="182" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">patients</text>
          <line x1="260" y1="188" x2="470" y2="188" stroke="#7DD3FC" strokeWidth="1" />
          <text x="270" y="202" fill="#BAE6FD" fontSize="9">id UUID PK</text>
          <text x="270" y="214" fill="#BAE6FD" fontSize="9">tenant_id FK</text>
          <text x="270" y="226" fill="#BAE6FD" fontSize="9">user_id FK → users</text>
          <text x="270" y="238" fill="#BAE6FD" fontSize="9">patient_code · dob · gender</text>
          <text x="270" y="250" fill="#BAE6FD" fontSize="9">occupation · nationality</text>
          <text x="270" y="262" fill="#BAE6FD" fontSize="9">referral_source · purpose</text>
          <text x="270" y="274" fill="#BAE6FD" fontSize="9">address · city · state · country</text>
          <text x="270" y="286" fill="#BAE6FD" fontSize="9">alt_phone · blood_group</text>

          {/* === MEDICAL HISTORIES === */}
          <rect x="20" y="340" width="210" height="100" rx="6" fill="#B91C1C" stroke="#FCA5A5" strokeWidth="1.5" />
          <text x="125" y="362" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">medical_histories</text>
          <line x1="20" y1="368" x2="230" y2="368" stroke="#FCA5A5" strokeWidth="1" />
          <text x="30" y="382" fill="#FECACA" fontSize="9">id UUID PK · patient_id FK</text>
          <text x="30" y="394" fill="#FECACA" fontSize="9">lifestyle_diseases JSONB</text>
          <text x="30" y="406" fill="#FECACA" fontSize="9">allergies TEXT[]</text>
          <text x="30" y="418" fill="#FECACA" fontSize="9">current_medications JSONB[]</text>
          <text x="30" y="430" fill="#FECACA" fontSize="9">surgical_history · family_history</text>

          {/* === CONSENTS === */}
          <rect x="260" y="340" width="200" height="100" rx="6" fill="#9F1239" stroke="#FDA4AF" strokeWidth="1.5" />
          <text x="360" y="362" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">consents</text>
          <line x1="260" y1="368" x2="460" y2="368" stroke="#FDA4AF" strokeWidth="1" />
          <text x="270" y="382" fill="#FECDD3" fontSize="9">id UUID PK · patient_id FK</text>
          <text x="270" y="394" fill="#FECDD3" fontSize="9">treatment_understanding BOOL</text>
          <text x="270" y="406" fill="#FECDD3" fontSize="9">risk_acceptance · data_privacy</text>
          <text x="270" y="418" fill="#FECDD3" fontSize="9">signature_data TEXT</text>
          <text x="270" y="430" fill="#FECDD3" fontSize="9">signed_at · ip_address</text>

          {/* === APPOINTMENTS === */}
          <rect x="500" y="160" width="200" height="120" rx="6" fill="#0891B2" stroke="#67E8F9" strokeWidth="1.5" />
          <text x="600" y="182" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">appointments</text>
          <line x1="500" y1="188" x2="700" y2="188" stroke="#67E8F9" strokeWidth="1" />
          <text x="510" y="202" fill="#A5F3FC" fontSize="9">id UUID PK</text>
          <text x="510" y="214" fill="#A5F3FC" fontSize="9">patient_id FK · doctor_id FK</text>
          <text x="510" y="226" fill="#A5F3FC" fontSize="9">date · start_time · end_time</text>
          <text x="510" y="238" fill="#A5F3FC" fontSize="9">type ENUM · status ENUM</text>
          <text x="510" y="250" fill="#A5F3FC" fontSize="9">booked_by FK · notes</text>
          <text x="510" y="262" fill="#A5F3FC" fontSize="9">cancelled_reason</text>
          <text x="510" y="274" fill="#A5F3FC" fontSize="9">tenant_id FK</text>

          {/* === CONSULTATIONS === */}
          <rect x="500" y="330" width="200" height="110" rx="6" fill="#065F46" stroke="#6EE7B7" strokeWidth="1.5" />
          <text x="600" y="352" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">consultations</text>
          <line x1="500" y1="358" x2="700" y2="358" stroke="#6EE7B7" strokeWidth="1" />
          <text x="510" y="372" fill="#A7F3D0" fontSize="9">id UUID PK</text>
          <text x="510" y="384" fill="#A7F3D0" fontSize="9">patient_id FK · doctor_id FK</text>
          <text x="510" y="396" fill="#A7F3D0" fontSize="9">appointment_id FK</text>
          <text x="510" y="408" fill="#A7F3D0" fontSize="9">prakriti · vikriti ENUM</text>
          <text x="510" y="420" fill="#A7F3D0" fontSize="9">chief_complaints JSONB[]</text>
          <text x="510" y="432" fill="#A7F3D0" fontSize="9">diagnosis · diet_recs</text>

          {/* === TREATMENT PLANS === */}
          <rect x="750" y="160" width="220" height="120" rx="6" fill="#92400E" stroke="#FCD34D" strokeWidth="1.5" />
          <text x="860" y="182" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">treatment_plans</text>
          <line x1="750" y1="188" x2="970" y2="188" stroke="#FCD34D" strokeWidth="1" />
          <text x="760" y="202" fill="#FDE68A" fontSize="9">id UUID PK</text>
          <text x="760" y="214" fill="#FDE68A" fontSize="9">consultation_id FK</text>
          <text x="760" y="226" fill="#FDE68A" fontSize="9">treatment_type ENUM</text>
          <text x="760" y="238" fill="#FDE68A" fontSize="9">duration_days · total_sessions</text>
          <text x="760" y="250" fill="#FDE68A" fontSize="9">medicines JSONB[]</text>
          <text x="760" y="262" fill="#FDE68A" fontSize="9">status ENUM · start_date</text>
          <text x="760" y="274" fill="#FDE68A" fontSize="9">end_date · patient_id FK</text>

          {/* === TREATMENT SESSIONS === */}
          <rect x="750" y="340" width="220" height="110" rx="6" fill="#B45309" stroke="#FCD34D" strokeWidth="1.5" />
          <text x="860" y="362" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">treatment_sessions</text>
          <line x1="750" y1="368" x2="970" y2="368" stroke="#FCD34D" strokeWidth="1" />
          <text x="760" y="382" fill="#FDE68A" fontSize="9">id UUID PK</text>
          <text x="760" y="394" fill="#FDE68A" fontSize="9">treatment_plan_id FK</text>
          <text x="760" y="406" fill="#FDE68A" fontSize="9">therapist_id FK · room_id FK</text>
          <text x="760" y="418" fill="#FDE68A" fontSize="9">session_number · scheduled_date</text>
          <text x="760" y="430" fill="#FDE68A" fontSize="9">started_at · ended_at</text>
          <text x="760" y="442" fill="#FDE68A" fontSize="9">status ENUM · notes</text>

          {/* === INVOICES === */}
          <rect x="260" y="510" width="200" height="110" rx="6" fill="#6B7280" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="360" y="532" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">invoices</text>
          <line x1="260" y1="538" x2="460" y2="538" stroke="#D1D5DB" strokeWidth="1" />
          <text x="270" y="552" fill="#E5E7EB" fontSize="9">id UUID PK · patient_id FK</text>
          <text x="270" y="564" fill="#E5E7EB" fontSize="9">invoice_number UNIQUE</text>
          <text x="270" y="576" fill="#E5E7EB" fontSize="9">consultation/treatment/medicine</text>
          <text x="270" y="588" fill="#E5E7EB" fontSize="9">discount · tax · total_amount</text>
          <text x="270" y="600" fill="#E5E7EB" fontSize="9">status ENUM · due_date</text>
          <text x="270" y="612" fill="#E5E7EB" fontSize="9">paid_amount</text>

          {/* === PAYMENTS === */}
          <rect x="500" y="510" width="200" height="100" rx="6" fill="#4B5563" stroke="#9CA3AF" strokeWidth="1.5" />
          <text x="600" y="532" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">payments</text>
          <line x1="500" y1="538" x2="700" y2="538" stroke="#9CA3AF" strokeWidth="1" />
          <text x="510" y="552" fill="#E5E7EB" fontSize="9">id UUID PK · invoice_id FK</text>
          <text x="510" y="564" fill="#E5E7EB" fontSize="9">amount · payment_mode ENUM</text>
          <text x="510" y="576" fill="#E5E7EB" fontSize="9">gateway_txn_id</text>
          <text x="510" y="588" fill="#E5E7EB" fontSize="9">status ENUM · paid_at</text>
          <text x="510" y="600" fill="#E5E7EB" fontSize="9">collected_by FK</text>

          {/* RELATIONSHIP LINES */}
          {/* tenants → users */}
          <line x1="390" y1="65" x2="220" y2="65" stroke="#D4A017" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1="220" y1="65" x2="220" y2="160" stroke="#D4A017" strokeWidth="1.5" strokeDasharray="4,3" />
          {/* tenants → patients */}
          <line x1="500" y1="110" x2="500" y2="140" stroke="#D4A017" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1="500" y1="140" x2="365" y2="140" stroke="#D4A017" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1="365" y1="140" x2="365" y2="160" stroke="#D4A017" strokeWidth="1.5" strokeDasharray="4,3" />
          {/* users → patients (user_id) */}
          <line x1="260" y1="220" x2="220" y2="220" stroke="#7DD3FC" strokeWidth="1.5" />
          <polygon points="220,216 210,220 220,224" fill="#7DD3FC" />
          {/* patients → medical_histories */}
          <line x1="310" y1="290" x2="310" y2="310" stroke="#FCA5A5" strokeWidth="1.5" />
          <line x1="310" y1="310" x2="125" y2="310" stroke="#FCA5A5" strokeWidth="1.5" />
          <line x1="125" y1="310" x2="125" y2="340" stroke="#FCA5A5" strokeWidth="1.5" />
          <polygon points="121,340 125,330 129,340" fill="#FCA5A5" />
          {/* patients → consents */}
          <line x1="365" y1="290" x2="365" y2="310" stroke="#FDA4AF" strokeWidth="1.5" />
          <line x1="365" y1="310" x2="360" y2="310" stroke="#FDA4AF" strokeWidth="1.5" />
          <line x1="360" y1="310" x2="360" y2="340" stroke="#FDA4AF" strokeWidth="1.5" />
          <polygon points="356,340 360,330 364,340" fill="#FDA4AF" />
          {/* patients → appointments */}
          <line x1="470" y1="220" x2="500" y2="220" stroke="#67E8F9" strokeWidth="1.5" />
          <polygon points="500,216 510,220 500,224" fill="#67E8F9" />
          {/* appointments → consultations */}
          <line x1="600" y1="280" x2="600" y2="330" stroke="#6EE7B7" strokeWidth="1.5" />
          <polygon points="596,330 600,320 604,330" fill="#6EE7B7" />
          {/* consultations → treatment_plans */}
          <line x1="700" y1="385" x2="750" y2="385" stroke="#FCD34D" strokeWidth="1.5" />
          <polygon points="750,381 760,385 750,389" fill="#FCD34D" />
          {/* treatment_plans → treatment_sessions */}
          <line x1="860" y1="280" x2="860" y2="340" stroke="#FCD34D" strokeWidth="1.5" />
          <polygon points="856,340 860,330 864,340" fill="#FCD34D" />
          {/* patients → invoices */}
          <line x1="365" y1="290" x2="365" y2="480" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1="365" y1="480" x2="360" y2="480" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1="360" y1="480" x2="360" y2="510" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4,3" />
          {/* invoices → payments */}
          <line x1="460" y1="565" x2="500" y2="565" stroke="#9CA3AF" strokeWidth="1.5" />
          <polygon points="500,561 510,565 500,569" fill="#9CA3AF" />

          {/* Legend */}
          <rect x="20" y="640" width="460" height="50" rx="4" fill="white" stroke="#E5E7EB" />
          <text x="30" y="658" fill="#374151" fontSize="10" fontWeight="bold" style={{ fontFamily: 'sans-serif' }}>Legend:</text>
          <line x1="90" y1="655" x2="130" y2="655" stroke="#D4A017" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x="135" y="658" fill="#6B7280" fontSize="9">Tenant FK (all tables)</text>
          <line x1="250" y1="655" x2="290" y2="655" stroke="#7DD3FC" strokeWidth="1.5" />
          <text x="295" y="658" fill="#6B7280" fontSize="9">1-to-many</text>
          <text x="30" y="678" fill="#6B7280" fontSize="9">PK = Primary Key   FK = Foreign Key   JSONB = flexible JSON column   RLS = Row Level Security</text>
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Row Level Security', body: 'Every table has a RLS policy: CREATE POLICY tenant_isolation ON patients USING (tenant_id = current_setting(\'app.tenant_id\')::uuid). The NestJS middleware sets this variable at connection time.', color: '#1B4332' },
          { title: 'Indexes Strategy', body: 'Composite indexes on (tenant_id, patient_id), (tenant_id, appointment_date), (tenant_id, created_at DESC). GIN index on JSONB columns for fast filtering of lifestyle_diseases.', color: '#0369A1' },
          { title: 'Soft Deletes', body: 'All entities use deleted_at TIMESTAMPTZ (NULL = active). No hard deletes. Audit log table records all mutations with user_id, table_name, row_id, action, old_data, new_data, timestamp.', color: '#92400E' },
        ].map(c => (
          <div key={c.title} className="rounded-lg p-4 text-white" style={{ backgroundColor: c.color }}>
            <p className="font-bold text-sm mb-2" style={{ fontFamily: 'sans-serif' }}>{c.title}</p>
            <p className="text-xs leading-relaxed opacity-90" style={{ fontFamily: 'sans-serif' }}>{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
