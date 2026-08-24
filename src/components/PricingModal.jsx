const PLANS = [
  {
    name: 'Starter',
    price: '$9.99',
    period: '/mo',
    credits: '100 credits / month',
    features: [
      '100 generations per month',
      'All 4 tools included',
      '7-day history',
    ],
    id: 'starter',
  },
  {
    name: 'Pro',
    price: '$29.99',
    period: '/mo',
    credits: '500 credits / month',
    features: [
      '500 generations per month',
      'All 4 tools included',
      'Unlimited history',
      'Priority support',
    ],
    id: 'pro',
    highlighted: true,
  },
  {
    name: 'Agency',
    price: '$79.99',
    period: '/mo',
    credits: 'Unlimited credits',
    features: [
      'Unlimited generations',
      '5 team seats',
      'API access',
      'Dedicated onboarding',
    ],
    id: 'agency',
  },
]

// AccÃ¨s statique uniquement : `import.meta.env[clÃ©]` (dynamique) ferait
// inliner tout le .env.local dans le bundle.
const CHECKOUT_URLS = {
  starter: import.meta.env.VITE_CHECKOUT_STARTER,
  pro: import.meta.env.VITE_CHECKOUT_PRO,
  agency: import.meta.env.VITE_CHECKOUT_AGENCY,
}

export default function PricingModal({ onClose }) {
  function handleCheckout(plan) {
    const url = CHECKOUT_URLS[plan.id]
    if (url) {
      window.location.href = url
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950">Choose your plan</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Secure payment via Stripe or Lemon Squeezy. Cancel anytime.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-xl border p-5 ${
                plan.highlighted
                  ? 'border-zinc-900 shadow-sm'
                  : 'border-zinc-200 bg-white'
              }`}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-flex w-fit rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-base font-semibold text-zinc-950">{plan.name}</h3>
              <p className="mt-1">
                <span className="text-3xl font-semibold tracking-tight text-zinc-950">{plan.price}</span>
                <span className="text-sm text-zinc-500">{plan.period}</span>
              </p>
              <p className="mt-1 text-xs font-medium text-brand-600">{plan.credits}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-zinc-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 shrink-0 text-brand-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan)}
                className={`mt-5 ${plan.highlighted ? 'btn-primary' : 'btn-ghost'} w-full`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
