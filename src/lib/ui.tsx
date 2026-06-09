export const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

export function EmptyState({ icon: Icon, title, description }: {
  icon: React.ElementType; title: string; description: string
}) {
  return (
    <div className="card p-10 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
        <Icon size={22} className="text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">{description}</p>
    </div>
  )
}

export function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${className}`}>
      {children}
    </span>
  )
}

export function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
      <input type="checkbox" className="mt-1 accent-[#1B4332]" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

type FieldProps = {
  label: string; value: string; onChange?: (v: string) => void
  type?: string; upper?: boolean; error?: string; readOnly?: boolean; rows?: number; maxLength?: number
}

export function Field({ label, value, onChange, type = 'text', upper, error, readOnly, rows, maxLength }: FieldProps) {
  const cls = `input-field${upper ? ' uppercase' : ''}${readOnly ? ' bg-gray-50' : ''}`
  return (
    <div>
      <label className="label">{label}</label>
      {rows ? (
        <textarea className={`${cls} resize-none`} rows={rows} value={value} readOnly={readOnly}
          onChange={e => onChange?.(upper ? e.target.value.toUpperCase() : e.target.value)} />
      ) : (
        <input type={type} className={cls} value={value} readOnly={readOnly} maxLength={maxLength}
          onChange={e => onChange?.(upper ? e.target.value.toUpperCase() : e.target.value)} />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
