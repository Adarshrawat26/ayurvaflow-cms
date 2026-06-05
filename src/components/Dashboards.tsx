import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

const sf = (f: string) => ({ fontFamily: f })

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1" style={{ backgroundColor: color }} />
      <CardContent className="pt-4 pb-4 px-4">
        <p className="text-xs text-gray-500 mb-1" style={sf('sans-serif')}>{label}</p>
        <p className="text-2xl font-bold" style={{ color, ...sf('sans-serif') }}>{value}</p>
        <p className="text-xs text-gray-400 mt-1" style={sf('sans-serif')}>{sub}</p>
      </CardContent>
    </Card>
  )
}

function SidebarItem({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-xs ${active ? 'bg-[#D4A017] text-[#1B4332] font-semibold' : 'text-[#A8D5B5] hover:bg-[#2D6A4F]'}`} style={sf('sans-serif')}>
      <span>{icon}</span> {label}
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="bg-gray-100 rounded-xl overflow-hidden border shadow-sm" style={{ height: 560 }}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-44 bg-[#1B4332] flex flex-col p-3 gap-1 flex-shrink-0">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-7 h-7 bg-[#D4A017] rounded flex items-center justify-center text-[#1B4332] font-bold text-sm">आ</div>
            <span className="text-white text-xs font-bold" style={sf('sans-serif')}>AyurvaFlow</span>
          </div>
          <SidebarItem icon="📊" label="Dashboard" active />
          <SidebarItem icon="👥" label="Patients" />
          <SidebarItem icon="📅" label="Appointments" />
          <SidebarItem icon="🩺" label="Doctors" />
          <SidebarItem icon="🌿" label="Treatments" />
          <SidebarItem icon="💳" label="Billing" />
          <SidebarItem icon="📁" label="Documents" />
          <SidebarItem icon="📢" label="Notifications" />
          <SidebarItem icon="📈" label="Analytics" />
          <SidebarItem icon="⚙️" label="Settings" />
          <div className="flex-1" />
          <div className="px-2">
            <div className="text-xs text-[#6EE7B7] mb-1" style={sf('sans-serif')}>Kairali Centre</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#D4A017] rounded-full flex items-center justify-center text-xs text-[#1B4332] font-bold">A</div>
              <span className="text-xs text-[#A8D5B5]" style={sf('sans-serif')}>Admin</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800 text-sm" style={sf('sans-serif')}>Admin Dashboard</h2>
              <p className="text-xs text-gray-500" style={sf('sans-serif')}>Thursday, 5 June 2025</p>
            </div>
            <div className="flex gap-2">
              <span className="bg-[#1B4332] text-white text-xs px-2 py-1 rounded" style={sf('sans-serif')}>This Month</span>
              <span className="bg-white border text-gray-600 text-xs px-2 py-1 rounded" style={sf('sans-serif')}>Export</span>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <StatCard label="Total Patients" value="1,284" sub="↑ 23 this week" color="#1B4332" />
            <StatCard label="Monthly Revenue" value="₹4.2L" sub="↑ 12% vs last month" color="#D4A017" />
            <StatCard label="Appointments Today" value="38" sub="6 pending confirmation" color="#0369A1" />
            <StatCard label="Active Treatments" value="89" sub="14 completing this week" color="#92400E" />
          </div>

          {/* Second row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="col-span-2 bg-white rounded-lg border p-3">
              <p className="text-xs font-semibold text-gray-700 mb-3" style={sf('sans-serif')}>Revenue — Last 6 Months</p>
              <svg viewBox="0 0 400 100">
                <line x1="0" y1="100" x2="400" y2="100" stroke="#E5E7EB" />
                {[0,1,2,3,4,5].map(i => <line key={i} x1={i*66+33} y1="0" x2={i*66+33} y2="100" stroke="#F3F4F6" />)}
                <polyline points="33,70 99,55 165,60 231,40 297,30 363,20" fill="none" stroke="#1B4332" strokeWidth="2.5" />
                <polyline points="33,70 99,55 165,60 231,40 297,30 363,20 363,100 33,100" fill="#1B4332" fillOpacity="0.1" />
                {[[33,70],[99,55],[165,60],[231,40],[297,30],[363,20]].map(([x,y],i)=>(
                  <circle key={i} cx={x} cy={y} r="3" fill="#D4A017" />
                ))}
                {['Jan','Feb','Mar','Apr','May','Jun'].map((m,i)=>(
                  <text key={m} x={i*66+33} y="115" textAnchor="middle" fontSize="7" fill="#9CA3AF">{m}</text>
                ))}
                {['1L','2L','3L','4L','5L'].map((v,i)=>(
                  <text key={v} x="0" y={100-i*20} fontSize="7" fill="#9CA3AF">{v}</text>
                ))}
              </svg>
            </div>
            <div className="bg-white rounded-lg border p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2" style={sf('sans-serif')}>Referral Sources</p>
              <div className="space-y-2">
                {[['Doctor Referral','42%','#1B4332'],['Website','28%','#0369A1'],['Social Media','16%','#D4A017'],['Existing Patient','10%','#92400E'],['Others','4%','#9CA3AF']].map(([label,pct,color])=>(
                  <div key={label as string}>
                    <div className="flex justify-between text-xs mb-1" style={sf('sans-serif')}>
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold">{pct}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full rounded-full" style={{ width: pct as string, backgroundColor: color as string }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg border p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2" style={sf('sans-serif')}>Today's Appointments</p>
              <div className="space-y-1.5">
                {[
                  ['09:00','Priya Sharma','Dr. Menon','Consultation','confirmed'],
                  ['10:00','Rajan Kumar','Dr. Nair','Shirodhara','in_progress'],
                  ['11:00','Ananya Singh','Dr. Menon','Follow-Up','scheduled'],
                  ['12:00','Mohan Das','Dr. Krishnan','Panchakarma','arrived'],
                ].map(([time,patient,doctor,,status])=>(
                  <div key={time as string} className="flex items-center gap-2 text-xs py-1 border-b border-gray-50">
                    <span className="text-gray-400 w-10 flex-shrink-0" style={sf('sans-serif')}>{time}</span>
                    <span className="font-medium text-gray-700 flex-1" style={sf('sans-serif')}>{patient}</span>
                    <span className="text-gray-500 flex-1" style={sf('sans-serif')}>{doctor}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: status==='in_progress'?'#1B4332':status==='confirmed'?'#0369A1':status==='arrived'?'#D4A017':'#9CA3AF', ...sf('sans-serif') }}>{status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg border p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2" style={sf('sans-serif')}>Treatment Distribution</p>
              <svg viewBox="0 0 200 120">
                {[
                  { label:'Abhyangam', pct: 35, color:'#1B4332', start:0 },
                  { label:'Shirodhara', pct: 25, color:'#D4A017', start:35 },
                  { label:'Panchakarma', pct: 20, color:'#0369A1', start:60 },
                  { label:'Kizhi', pct: 12, color:'#92400E', start:80 },
                  { label:'Others', pct: 8, color:'#9CA3AF', start:92 },
                ].map((s,i) => {
                  const total = 100, r = 40, cx = 70, cy = 60
                  const a1 = (s.start/total)*2*Math.PI - Math.PI/2
                  const a2 = ((s.start+s.pct)/total)*2*Math.PI - Math.PI/2
                  const x1 = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1)
                  const x2 = cx + r*Math.cos(a2), y2 = cy + r*Math.sin(a2)
                  const large = s.pct > 50 ? 1 : 0
                  return (
                    <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
                      fill={s.color} stroke="white" strokeWidth="1.5" />
                  )
                })}
                <circle cx="70" cy="60" r="20" fill="white" />
                <text x="70" y="63" textAnchor="middle" fontSize="7" fill="#1B4332" fontWeight="bold">89</text>
                <text x="70" y="72" textAnchor="middle" fontSize="6" fill="#6B7280">Active</text>
                {[['Abhyangam 35%','#1B4332',15],['Shirodhara 25%','#D4A017',28],['Panchakarma 20%','#0369A1',41],['Kizhi 12%','#92400E',54],['Others 8%','#9CA3AF',67]].map(([label,color,y])=>(
                  <g key={label as string}>
                    <rect x="125" y={y as number} width="8" height="8" fill={color as string} rx="1" />
                    <text x="136" y={(y as number)+7} fontSize="7" fill="#6B7280">{label}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReceptionDashboard() {
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden border shadow-sm" style={{ minHeight: 500 }}>
      <div className="bg-[#0369A1] text-white px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm" style={sf('sans-serif')}>Reception Dashboard — Kairali Centre</h3>
          <p className="text-xs opacity-80" style={sf('sans-serif')}>Thursday 5 June · Good morning, Sujatha 👋</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-white text-[#0369A1] text-xs font-semibold px-3 py-1 rounded cursor-pointer" style={sf('sans-serif')}>+ New Patient</span>
          <span className="bg-[#0284C7] text-white text-xs px-3 py-1 rounded cursor-pointer" style={sf('sans-serif')}>+ Appointment</span>
        </div>
      </div>
      <div className="p-4">
        {/* Quick stats */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[['Today\'s Apt','38','📅','#0369A1'],['Walk-ins','6','🚶','#1B4332'],['Pending Bills','12','💳','#D97706'],['Checked In','14','✅','#065F46'],['Cancelled','3','❌','#DC2626']].map(([label,val,icon,color])=>(
            <div key={label as string} className="bg-white rounded-lg p-3 border text-center">
              <div className="text-xl mb-1">{icon}</div>
              <div className="font-bold text-lg" style={{ color: color as string, ...sf('sans-serif') }}>{val}</div>
              <div className="text-xs text-gray-500" style={sf('sans-serif')}>{label}</div>
            </div>
          ))}
        </div>
        {/* Queue */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border p-3">
            <p className="text-xs font-bold text-gray-700 mb-3" style={sf('sans-serif')}>Live Queue</p>
            <div className="space-y-2">
              {[
                ['KAI-0089','Rajan Kumar','09:00','Dr. Nair','🟢 In Session'],
                ['KAI-0112','Priya Sharma','09:30','Dr. Menon','🟡 Waiting'],
                ['KAI-0045','Ananya Singh','10:00','Dr. Nair','🔵 Checked In'],
                ['KAI-0201','Mohan Das','10:30','Dr. Krishnan','⚪ Scheduled'],
                ['KAI-0178','Lakshmi Iyer','11:00','Dr. Menon','⚪ Scheduled'],
              ].map(([code,name,time,doc,status])=>(
                <div key={code as string} className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-400 font-mono w-20 flex-shrink-0" style={sf('monospace')}>{code}</span>
                  <span className="font-medium flex-1 text-gray-700" style={sf('sans-serif')}>{name}</span>
                  <span className="text-gray-400" style={sf('sans-serif')}>{time}</span>
                  <span className="text-gray-500 flex-1" style={sf('sans-serif')}>{doc}</span>
                  <span style={sf('sans-serif')}>{status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg border p-3">
            <p className="text-xs font-bold text-gray-700 mb-3" style={sf('sans-serif')}>Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Register Patient','#1B4332','👤'],['Book Appointment','#0369A1','📅'],
                ['Generate Bill','#D97706','🧾'],['Mark Arrived','#065F46','✅'],
                ['Send Reminder','#9333EA','📱'],['View Reports','#6B7280','📊'],
              ].map(([label,color,icon])=>(
                <button key={label as string} className="flex items-center gap-2 p-2 rounded-lg text-white text-xs font-medium" style={{ backgroundColor: color as string, ...sf('sans-serif') }}>
                  <span>{icon}</span>{label}
                </button>
              ))}
            </div>
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="text-xs font-semibold text-yellow-800 mb-1" style={sf('sans-serif')}>⚠️ Pending Actions</p>
              <p className="text-xs text-yellow-700" style={sf('sans-serif')}>• 3 consents pending signature</p>
              <p className="text-xs text-yellow-700" style={sf('sans-serif')}>• 5 appointment reminders to send</p>
              <p className="text-xs text-yellow-700" style={sf('sans-serif')}>• 2 overdue invoices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DoctorDashboard() {
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden border shadow-sm" style={{ minHeight: 500 }}>
      <div className="bg-[#065F46] text-white px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm" style={sf('sans-serif')}>Dr. Menon's Dashboard</h3>
          <p className="text-xs opacity-80" style={sf('sans-serif')}>8 consultations today · 2 follow-ups pending</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-[#6EE7B7] text-[#065F46] px-2 py-1 rounded font-semibold" style={sf('sans-serif')}>● Available</span>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[['Today\'s Pts','8','#065F46'],['Consultations Done','3','#0369A1'],['Follow-Ups','12','#D97706'],['Treatment Plans','24','#92400E']].map(([label,val,color])=>(
            <div key={label as string} className="bg-white border rounded-lg p-3 text-center">
              <div className="text-xl font-bold" style={{ color: color as string, ...sf('sans-serif') }}>{val}</div>
              <div className="text-xs text-gray-500 mt-1" style={sf('sans-serif')}>{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border p-3">
            <p className="text-xs font-bold text-[#065F46] mb-3" style={sf('sans-serif')}>Today's Patient Queue</p>
            {[
              {name:'Priya Sharma',age:42,purpose:'Consultation',status:'waiting',prakriti:'Vata-Pitta'},
              {name:'Rajan Kumar',age:58,purpose:'Follow-Up',status:'in_room',prakriti:'Kapha'},
              {name:'Ananya Singh',age:35,purpose:'Treatment Review',status:'scheduled',prakriti:'Pitta'},
            ].map((p,i)=>(
              <div key={i} className="flex items-start gap-3 p-2 rounded mb-1 border border-gray-100">
                <div className="w-8 h-8 bg-[#D4A017] rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={sf('sans-serif')}>
                  {p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-xs text-gray-800" style={sf('sans-serif')}>{p.name}, {p.age}y</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${p.status==='in_room'?'bg-green-100 text-green-700':p.status==='waiting'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-600'}`} style={sf('sans-serif')}>{p.status}</span>
                  </div>
                  <p className="text-xs text-gray-500" style={sf('sans-serif')}>{p.purpose} · Prakriti: {p.prakriti}</p>
                </div>
                <button className="text-xs bg-[#065F46] text-white px-2 py-1 rounded flex-shrink-0" style={sf('sans-serif')}>Open</button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border p-3">
            <p className="text-xs font-bold text-[#065F46] mb-3" style={sf('sans-serif')}>Quick Consultation Panel</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1" style={sf('sans-serif')}>Chief Complaints</p>
                <textarea className="w-full border rounded p-2 text-xs resize-none" rows={2} placeholder="e.g. Lower back pain for 3 weeks, worsens on sitting..." style={sf('sans-serif')} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1" style={sf('sans-serif')}>Prakriti</p>
                  <select className="w-full border rounded p-1.5 text-xs" style={sf('sans-serif')}>
                    <option>Vata</option><option>Pitta</option><option>Kapha</option>
                    <option>Vata-Pitta</option><option>Pitta-Kapha</option><option>Tridosha</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1" style={sf('sans-serif')}>Treatment Type</p>
                  <select className="w-full border rounded p-1.5 text-xs" style={sf('sans-serif')}>
                    <option>Abhyangam</option><option>Shirodhara</option><option>Panchakarma</option>
                    <option>Kizhi</option><option>Nasya</option><option>Custom</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-[#065F46] text-white text-xs py-1.5 rounded font-medium" style={sf('sans-serif')}>Save Consultation</button>
                <button className="flex-1 border text-gray-600 text-xs py-1.5 rounded font-medium" style={sf('sans-serif')}>Create Rx</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TherapistDashboard() {
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden border shadow-sm" style={{ minHeight: 420 }}>
      <div className="bg-[#92400E] text-white px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm" style={sf('sans-serif')}>Therapist Dashboard — Divya K.</h3>
          <p className="text-xs opacity-80" style={sf('sans-serif')}>5 sessions today · Room 2 assigned</p>
        </div>
        <span className="text-xs bg-[#FDE68A] text-[#92400E] font-bold px-2 py-1 rounded" style={sf('sans-serif')}>Abhyangam Specialist</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[['Sessions Today','5','#92400E'],['Completed','2','#065F46'],['Remaining','3','#0369A1'],['Hours Clocked','3.5h','#D97706']].map(([l,v,c])=>(
            <div key={l as string} className="bg-white border rounded-lg p-3 text-center">
              <div className="font-bold text-xl" style={{ color: c as string, ...sf('sans-serif') }}>{v}</div>
              <div className="text-xs text-gray-500 mt-1" style={sf('sans-serif')}>{l}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border p-3">
          <p className="text-xs font-bold text-[#92400E] mb-3" style={sf('sans-serif')}>Today's Session Schedule — Room 2</p>
          <div className="space-y-2">
            {[
              {time:'09:00',pt:'Priya Sharma',tx:'Abhyangam',dur:'60 min',status:'completed',session:'Day 3/14'},
              {time:'10:30',pt:'Rajan Kumar',tx:'Shirodhara',dur:'45 min',status:'completed',session:'Day 7/7'},
              {time:'11:30',pt:'Ananya Singh',tx:'Kizhi',dur:'60 min',status:'in_progress',session:'Day 1/10'},
              {time:'13:00',pt:'Mohan Das',tx:'Abhyangam',dur:'60 min',status:'scheduled',session:'Day 5/21'},
              {time:'14:30',pt:'Lakshmi Iyer',tx:'Nasya',dur:'30 min',status:'scheduled',session:'Day 2/5'},
            ].map((s,i)=>(
              <div key={i} className="flex items-center gap-3 text-xs py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-400 w-12 flex-shrink-0" style={sf('sans-serif')}>{s.time}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-700" style={sf('sans-serif')}>{s.pt}</p>
                  <p className="text-gray-500" style={sf('sans-serif')}>{s.tx} · {s.dur} · {s.session}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.status==='completed'?'bg-green-100 text-green-700':s.status==='in_progress'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-600'}`} style={sf('sans-serif')}>{s.status}</span>
                {s.status==='in_progress' && <button className="bg-[#065F46] text-white px-2 py-1 rounded text-xs" style={sf('sans-serif')}>Complete</button>}
                {s.status==='scheduled' && <button className="bg-[#92400E] text-white px-2 py-1 rounded text-xs" style={sf('sans-serif')}>Start</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PatientPortal() {
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden border shadow-sm" style={{ minHeight: 480 }}>
      <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4A017] rounded-full flex items-center justify-center font-bold text-[#1B4332]" style={sf('sans-serif')}>P</div>
            <div>
              <h3 className="font-bold" style={sf('sans-serif')}>Welcome, Priya Sharma</h3>
              <p className="text-xs text-[#A8D5B5]" style={sf('sans-serif')}>Patient ID: KAI-2024-0089</p>
            </div>
          </div>
          <span className="text-xs bg-[#D4A017] text-[#1B4332] px-2 py-1 rounded font-bold" style={sf('sans-serif')}>Active Treatment</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[['Next Session','Today 11:30 AM','📅'],['Treatment','Abhyangam Day 3/14','🌿'],['Doctor','Dr. R. Menon','🩺']].map(([l,v,i])=>(
            <div key={l as string} className="bg-white/10 rounded-lg p-2 text-center">
              <div className="text-lg">{i}</div>
              <div className="text-xs font-semibold" style={sf('sans-serif')}>{v}</div>
              <div className="text-xs opacity-70" style={sf('sans-serif')}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border p-3">
            <p className="text-xs font-bold text-[#1B4332] mb-3" style={sf('sans-serif')}>Treatment Progress</p>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1" style={sf('sans-serif')}>
                <span className="text-gray-600">Abhyangam (14-day course)</span>
                <span className="font-bold text-[#1B4332]">21%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full bg-[#1B4332] rounded-full" style={{ width: '21%' }} />
              </div>
              <p className="text-xs text-gray-400 mt-1" style={sf('sans-serif')}>3 of 14 sessions completed</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600" style={sf('sans-serif')}>Symptom Improvement Log</p>
              {[['Lower back pain','Moderate → Mild','↗️'],['Energy levels','Low → Good','↗️'],['Sleep quality','Fair → Good','↗️']].map(([sym,imp,icon])=>(
                <div key={sym as string} className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                  <span className="text-gray-600" style={sf('sans-serif')}>{sym}</span>
                  <span className="text-green-600 font-medium" style={sf('sans-serif')}>{icon} {imp}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border p-3">
            <p className="text-xs font-bold text-[#1B4332] mb-3" style={sf('sans-serif')}>Quick Actions</p>
            <div className="space-y-2">
              {[
                ['Book Appointment','#0369A1','📅'],
                ['View Prescriptions','#065F46','💊'],
                ['Download Reports','#92400E','📄'],
                ['Pay Dues (₹2,400)','#D97706','💳'],
                ['Message Doctor','#9333EA','💬'],
              ].map(([label,color,icon])=>(
                <button key={label as string} className="w-full flex items-center gap-2 px-3 py-2 rounded border border-gray-200 text-xs hover:bg-gray-50 transition-colors" style={sf('sans-serif')}>
                  <span>{icon}</span>
                  <span className="font-medium" style={{ color: color as string }}>{label}</span>
                  <span className="ml-auto text-gray-400">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 bg-[#F7F5F0] rounded-lg p-3 border border-[#D4A017]/30">
          <p className="text-xs font-bold text-[#1B4332] mb-2" style={sf('sans-serif')}>Doctor's Diet Recommendations (Pathya)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-green-700 font-medium mb-1" style={sf('sans-serif')}>✅ Recommended</p>
              {['Warm cooked foods','Sesame oil massage','Light dal & rice','Ginger tea','Early bedtime'].map(f=>(
                <p key={f} className="text-xs text-gray-600" style={sf('sans-serif')}>• {f}</p>
              ))}
            </div>
            <div>
              <p className="text-xs text-red-700 font-medium mb-1" style={sf('sans-serif')}>❌ Avoid (Apathya)</p>
              {['Cold & raw foods','Excessive screen time','Irregular meal times','Stress','Heavy exercise'].map(f=>(
                <p key={f} className="text-xs text-gray-600" style={sf('sans-serif')}>• {f}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const TABS = ['Admin', 'Reception', 'Doctor', 'Therapist', 'Patient Portal']

export default function Dashboards() {
  const [tab, setTab] = useState('Admin')
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B4332] mb-1">Dashboard Designs</h2>
        <p className="text-gray-600 text-sm" style={sf('sans-serif')}>Role-specific dashboard mockups showing key screens for each user type. Deliverables 6–10.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-all ${tab===t ? 'border-[#1B4332] text-[#1B4332]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            style={sf('sans-serif')}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Admin' && <AdminDashboard />}
      {tab === 'Reception' && <ReceptionDashboard />}
      {tab === 'Doctor' && <DoctorDashboard />}
      {tab === 'Therapist' && <TherapistDashboard />}
      {tab === 'Patient Portal' && <PatientPortal />}

      <div className="bg-[#1B4332] text-white rounded-lg p-4">
        <h4 className="font-bold text-sm mb-2 text-[#D4A017]" style={sf('sans-serif')}>📱 Mobile Responsiveness (Deliverable 11)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs" style={sf('sans-serif')}>
          <div><p className="font-semibold text-[#A8D5B5] mb-1">Breakpoints (Tailwind)</p><p className="opacity-80">sm: 640px (portrait phone), md: 768px (tablet), lg: 1024px (desktop). All grids collapse to single column on mobile.</p></div>
          <div><p className="font-semibold text-[#A8D5B5] mb-1">Mobile-First Features</p><p className="opacity-80">Hamburger nav, bottom tab bar for Patient Portal, touch-friendly 44px tap targets, swipe gestures for calendar, PWA installable.</p></div>
          <div><p className="font-semibold text-[#A8D5B5] mb-1">Therapist Mobile App</p><p className="opacity-80">Therapist view is optimized for mobile — session start/stop with one tap, voice-to-text for notes, offline mode for poor connectivity.</p></div>
        </div>
      </div>
    </div>
  )
}
