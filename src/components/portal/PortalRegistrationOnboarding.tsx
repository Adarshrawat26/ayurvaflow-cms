import { CheckCircle2, ChevronRight } from 'lucide-react'
import { PUBLIC_REGISTRATION_STEPS, REGISTRATION_CHECKLIST } from '@/data/portalRegistrationGuide'

interface Props {
  onCreateAccount?: () => void
  onSignIn?: () => void
  onBackToSignIn?: () => void
}

export default function PortalRegistrationOnboarding({ onCreateAccount, onSignIn, onBackToSignIn }: Props) {
  const goSignIn = onSignIn ?? onBackToSignIn

  return (
    <div className="space-y-4 lg:space-y-6">
      {goSignIn && (
        <button
          type="button"
          onClick={goSignIn}
          className="text-xs font-medium text-[#1B4332] hover:underline"
        >
          ← Already have an account? Sign in
        </button>
      )}

      <div className="text-center sm:text-left lg:max-w-none">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">One-Time Registration</h2>
        <p className="text-sm text-gray-500 mt-1">
          New patients register entirely in the app — create an account, complete the form, and book online.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
        <div className="card p-4 md:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">How it works</h3>
          <ol className="space-y-4">
            {PUBLIC_REGISTRATION_STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <li key={step.title} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    {i < PUBLIC_REGISTRATION_STEPS.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 my-1 min-h-[12px]" />
                    )}
                  </div>
                  <div className="pb-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Icon size={14} className="text-[#1B4332] shrink-0" />
                      <span className="text-sm font-semibold text-gray-900">{step.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
                    {step.tips && (
                      <ul className="mt-2 space-y-1">
                        {step.tips.map(tip => (
                          <li key={tip} className="text-[11px] text-gray-500 flex items-start gap-1.5">
                            <CheckCircle2 size={11} className="text-[#52B788] shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="space-y-4">
          <div className="card p-4 md:p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Keep these handy</h3>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
              {REGISTRATION_CHECKLIST.map(item => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                  <CheckCircle2 size={12} className="text-[#1B4332] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {onCreateAccount && (
            <div className="card p-4 md:p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">New patient?</h3>
              <p className="text-xs text-gray-600">
                Create your portal account now, then complete registration and book your first visit — no clinic visit needed first.
              </p>
              <button
                type="button"
                onClick={onCreateAccount}
                className="w-full btn-primary flex items-center justify-center gap-1.5"
              >
                Create account <ChevronRight size={14} />
              </button>
              {goSignIn && (
                <button
                  type="button"
                  onClick={goSignIn}
                  className="w-full py-2.5 text-xs font-medium text-[#1B4332] hover:underline"
                >
                  I already have an account
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
