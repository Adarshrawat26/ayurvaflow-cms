import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import InfoArchitecture from './components/InfoArchitecture'
import UserFlows from './components/UserFlows'
import DatabaseSchema from './components/DatabaseSchema'
import ERDiagram from './components/ERDiagram'
import APIArchitecture from './components/APIArchitecture'
import Dashboards from './components/Dashboards'
import FolderStructure from './components/FolderStructure'
import PRD from './components/PRD'
import Roadmap from './components/Roadmap'

const NAV = [
  { id: 'ia', label: '1. Info Architecture' },
  { id: 'flows', label: '2. User Flows' },
  { id: 'schema', label: '3. DB Schema' },
  { id: 'er', label: '4. ER Diagram' },
  { id: 'api', label: '5. API Architecture' },
  { id: 'dashboards', label: '6–10. Dashboards' },
  { id: 'folders', label: '12. Folder Structure' },
  { id: 'prd', label: '13. PRD' },
  { id: 'roadmap', label: '14. Roadmap' },
]

export default function App() {
  const [active, setActive] = useState('ia')

  return (
    <div className="min-h-screen bg-[#F7F5F0]" style={{ fontFamily: 'Georgia, serif' }}>
      <header className="bg-[#1B4332] text-white px-6 py-4 shadow-xl">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#D4A017] flex items-center justify-center font-bold text-[#1B4332] text-xl">आ</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>AyurvaFlow CMS</h1>
              <p className="text-xs text-[#A8D5B5] mt-0.5" style={{ fontFamily: 'sans-serif' }}>Multi-Tenant Ayurveda Clinic Management SaaS · Complete System Blueprint</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-[#D4A017] text-[#1B4332] font-semibold" style={{ fontFamily: 'sans-serif' }}>Enterprise SaaS</Badge>
            <Badge className="bg-[#2D6A4F] text-[#A8D5B5] border border-[#A8D5B5]" style={{ fontFamily: 'sans-serif' }}>100+ Centers</Badge>
            <Badge className="bg-[#2D6A4F] text-[#A8D5B5] border border-[#A8D5B5]" style={{ fontFamily: 'sans-serif' }}>v1.0 PRD</Badge>
          </div>
        </div>
      </header>

      <nav className="bg-[#163828] border-b border-[#2D6A4F] sticky top-0 z-50 overflow-x-auto">
        <div className="max-w-screen-xl mx-auto flex gap-1 px-4 py-1.5">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setActive(n.id)}
              style={{ fontFamily: 'sans-serif' }}
              className={`px-3 py-1.5 text-xs whitespace-nowrap rounded transition-all font-medium ${
                active === n.id
                  ? 'bg-[#D4A017] text-[#1B4332]'
                  : 'text-[#A8D5B5] hover:text-white hover:bg-[#1B4332]'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {active === 'ia' && <InfoArchitecture />}
        {active === 'flows' && <UserFlows />}
        {active === 'schema' && <DatabaseSchema />}
        {active === 'er' && <ERDiagram />}
        {active === 'api' && <APIArchitecture />}
        {active === 'dashboards' && <Dashboards />}
        {active === 'folders' && <FolderStructure />}
        {active === 'prd' && <PRD />}
        {active === 'roadmap' && <Roadmap />}
      </main>
    </div>
  )
}
