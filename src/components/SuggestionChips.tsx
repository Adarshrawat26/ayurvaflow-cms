import { Sparkles } from 'lucide-react'

type Props = {
  label?: string
  suggestions: string[]
  onSelect: (value: string) => void
  activeValues?: string[]
  hint?: string
}

export default function SuggestionChips({ label = 'Suggestions', suggestions, onSelect, activeValues = [], hint }: Props) {
  if (!suggestions.length) return null

  return (
    <div className="mt-1.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkles size={11} className="text-[#52B788] shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#1B4332]/70">{label}</span>
        {hint && <span className="text-[10px] text-gray-400">· {hint}</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map(s => {
          const active = activeValues.some(v => v.includes(s) || s.includes(v))
          return (
            <button
              key={s}
              type="button"
              onClick={() => onSelect(s)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all text-left leading-snug ${
                active
                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                  : 'bg-[#1B4332]/[0.04] text-[#1B4332] border-[#1B4332]/15 hover:bg-[#1B4332]/10 hover:border-[#1B4332]/30'
              }`}
            >
              {s}
            </button>
          )
        })}
      </div>
    </div>
  )
}
