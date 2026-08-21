import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'
import { isSupabaseConfigured, supabase } from '../services/supabase.js'

const FALLBACK_COUNT = 2400

function Counter({ to }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const controls = animate(0, to, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [to])

  return <span>{value.toLocaleString('en-US')}+</span>
}

const avatars = [
  { initials: 'SK', gradient: 'from-pink-500 to-rose-600' },
  { initials: 'LM', gradient: 'from-purple-500 to-brand-600' },
  { initials: 'JD', gradient: 'from-blue-500 to-cyan-500' },
  { initials: 'AR', gradient: 'from-orange-500 to-red-500' },
  { initials: 'TP', gradient: 'from-emerald-500 to-teal-600' },
]

export default function SocialProof() {
  const [count, setCount] = useState(
    isSupabaseConfigured ? null : FALLBACK_COUNT,
  )

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let mounted = true
    supabase
      .rpc('profiles_count')
      .then(({ data, error }) => {
        if (!mounted || error || typeof data !== 'number') {
          if (mounted) setCount(FALLBACK_COUNT)
          return
        }
        setCount(Math.max(data, 1))
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5">
      <div className="flex -space-x-3">
        {avatars.map((avatar, index) => (
          <motion.div
            key={avatar.initials}
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.25,
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0b0f19] bg-gradient-to-br text-xs font-bold text-white ${avatar.gradient}`}
          >
            {avatar.initials}
          </motion.div>
        ))}
      </div>
      <p className="text-sm text-slate-400">
        <span className="font-bold text-white">
          <Counter to={count ?? FALLBACK_COUNT} />
        </span>{' '}
        {(count ?? FALLBACK_COUNT) === 1 ? 'creator' : 'creators'} already
        generate faster with KitCreator
      </p>
    </div>
  )
}
