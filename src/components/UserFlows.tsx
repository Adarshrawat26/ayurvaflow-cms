import { Card, CardContent } from '@/components/ui/card'

const flows = [
  {
    title: 'Patient Onboarding Flow',
    color: '#0369A1',
    steps: [
      { step: '1', label: 'Walk-in / Online', desc: 'Patient arrives or books online via Patient Portal' },
      { step: '2', label: 'Registration', desc: 'Receptionist creates patient profile — Personal, Contact, Emergency Contact info' },
      { step: '3', label: 'Referral Source', desc: 'Record how patient heard about clinic (website, social, doctor referral, etc.)' },
      { step: '4', label: 'Purpose of Visit', desc: 'Select: Consultation / Maintenance of Health / Preventive Measure' },
      { step: '5', label: 'Medical History', desc: 'Fill lifestyle diseases, allergies, medications, surgical history, family history' },
      { step: '6', label: 'Document Upload', desc: 'Upload Aadhaar, PAN, previous lab reports, prescriptions' },
      { step: '7', label: 'Consent Forms', desc: 'Read & digitally sign all 6 consent sections with e-signature, timestamp, IP logged' },
      { step: '8', label: 'Appointment Booking', desc: 'Book with available doctor — calendar slot selection' },
      { step: '9', label: 'Confirmation', desc: 'SMS + WhatsApp + Email confirmation sent automatically' },
    ],
  },
  {
    title: 'Doctor Consultation Flow',
    color: '#065F46',
    steps: [
      { step: '1', label: 'Patient Arrival', desc: 'Receptionist marks patient "Arrived" — doctor notified' },
      { step: '2', label: 'Review Profile', desc: 'Doctor views complete patient profile, medical history, previous visits' },
      { step: '3', label: 'Chief Complaints', desc: 'Doctor records presenting complaints with duration and severity' },
      { step: '4', label: 'Ayurvedic Assessment', desc: 'Record Prakriti, Vikriti, dominant Dosha, Dhatu imbalances, Agni status' },
      { step: '5', label: 'Clinical Diagnosis', desc: 'Add modern + Ayurvedic diagnosis codes' },
      { step: '6', label: 'Treatment Plan', desc: 'Define treatment type, duration (days), sessions per day, total sessions' },
      { step: '7', label: 'Medicines', desc: 'Prescribe Ayurvedic medicines with dosage, timing, Anupana (vehicle)' },
      { step: '8', label: 'Diet & Lifestyle', desc: 'Add Pathya (recommended) and Apathya (restricted) foods and lifestyle advice' },
      { step: '9', label: 'Handoff', desc: 'Treatment plan sent to Receptionist for scheduling & billing' },
    ],
  },
  {
    title: 'Treatment Session Flow',
    color: '#92400E',
    steps: [
      { step: '1', label: 'Schedule Sessions', desc: 'Receptionist schedules all sessions per treatment plan, assigns therapists & rooms' },
      { step: '2', label: 'Patient Check-In', desc: 'Patient arrives, Receptionist marks check-in time' },
      { step: '3', label: 'Therapist Prep', desc: 'Therapist views session details, reviews treatment protocol and patient notes' },
      { step: '4', label: 'Session Start', desc: 'Therapist marks session "In Progress" — timer starts' },
      { step: '5', label: 'Treatment Delivery', desc: 'Treatment administered per protocol (Abhyangam, Shirodhara, Kizhi, etc.)' },
      { step: '6', label: 'Session End', desc: 'Therapist marks "Completed", adds session notes, records patient feedback' },
      { step: '7', label: 'Post-Treatment', desc: 'Patient rests, post-treatment instructions given' },
      { step: '8', label: 'Next Session', desc: 'Next session auto-reminded to patient via WhatsApp/SMS' },
    ],
  },
  {
    title: 'Billing & Payment Flow',
    color: '#7C3AED',
    steps: [
      { step: '1', label: 'Bill Generation', desc: 'Auto-generate bill: consultation + treatment package + medicines + taxes' },
      { step: '2', label: 'Review Bill', desc: 'Receptionist reviews, applies discounts if authorized' },
      { step: '3', label: 'Patient Confirmation', desc: 'Share bill preview with patient (print or digital)' },
      { step: '4', label: 'Payment Collection', desc: 'Collect via Cash / Card / UPI / Net Banking through Razorpay' },
      { step: '5', label: 'Payment Verification', desc: 'Payment confirmed — webhook updates bill status in real-time' },
      { step: '6', label: 'Receipt Generation', desc: 'PDF receipt auto-generated and sent to patient email + WhatsApp' },
      { step: '7', label: 'Accounts Update', desc: 'Revenue updated in analytics dashboard immediately' },
    ],
  },
]

export default function UserFlows() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1B4332] mb-1">User Flow Diagrams</h2>
        <p className="text-gray-600 text-sm" style={{ fontFamily: 'sans-serif' }}>Step-by-step flows for each major journey through the system.</p>
      </div>

      {flows.map(flow => (
        <section key={flow.title}>
          <h3 className="text-base font-bold mb-4 px-3 py-2 rounded" style={{ backgroundColor: flow.color, color: 'white', fontFamily: 'sans-serif' }}>
            {flow.title}
          </h3>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-3">
              {flow.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 z-10 shadow"
                    style={{ backgroundColor: flow.color, fontFamily: 'sans-serif' }}
                  >
                    {s.step}
                  </div>
                  <Card className="flex-1 border-l-2" style={{ borderLeftColor: flow.color }}>
                    <CardContent className="py-2 px-4">
                      <div className="flex items-start gap-3">
                        <div>
                          <p className="font-bold text-sm" style={{ fontFamily: 'sans-serif', color: flow.color }}>{s.label}</p>
                          <p className="text-xs text-gray-600 mt-0.5" style={{ fontFamily: 'sans-serif' }}>{s.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Role-Access Matrix */}
      <section>
        <h3 className="text-lg font-bold text-[#1B4332] mb-3 border-b border-[#D4A017] pb-1">Role × Module Access Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse" style={{ fontFamily: 'sans-serif' }}>
            <thead>
              <tr className="bg-[#1B4332] text-white">
                <th className="px-3 py-2 text-left font-semibold">Module</th>
                {['Super Admin', 'Admin', 'Receptionist', 'Doctor', 'Therapist', 'Patient'].map(r => (
                  <th key={r} className="px-3 py-2 text-center font-semibold">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Patient Management', '✅', '✅', '✅', '👁️', '❌', '👁️'],
                ['Medical History', '✅', '✅', '✅', '✅', '👁️', '👁️'],
                ['Consent Management', '✅', '✅', '✅', '👁️', '❌', '✅'],
                ['Doctor Consultation', '✅', '✅', '❌', '✅', '❌', '👁️'],
                ['Treatment Management', '✅', '✅', '✅', '✅', '👁️', '❌'],
                ['Appointments', '✅', '✅', '✅', '👁️', '👁️', '✅'],
                ['Billing', '✅', '✅', '✅', '❌', '❌', '👁️'],
                ['Documents', '✅', '✅', '✅', '✅', '❌', '✅'],
                ['Analytics', '✅', '✅', '❌', '👁️', '❌', '❌'],
                ['Notifications', '✅', '✅', '✅', '❌', '❌', '👁️'],
                ['Tenant Config', '✅', '✅', '❌', '❌', '❌', '❌'],
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, j) => (
                    <td key={j} className={`px-3 py-2 border-b border-gray-100 ${j === 0 ? 'font-medium text-[#1B4332]' : 'text-center'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'sans-serif' }}>✅ Full Access &nbsp;|&nbsp; 👁️ Read Only &nbsp;|&nbsp; ❌ No Access</p>
        </div>
      </section>
    </div>
  )
}
