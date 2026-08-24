import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'

export default function CustomSelect({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      {label && <label className="label">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`input flex items-center justify-between text-left ${
          open ? 'border-zinc-400 ring-2 ring-zinc-200' : ''
        }`}
      >
        <span>{value}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-2 shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-md"
          >
            {options.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                    option === value
                      ? 'bg-zinc-100 font-medium text-zinc-950'
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {option}
                  {option === value && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
