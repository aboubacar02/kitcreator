import { FaTiktok, FaYoutube, FaInstagram } from 'react-icons/fa'

const platforms = [
  {
    id: 'TikTok',
    name: 'TikTok',
    icon: FaTiktok,
    activeColor: 'border-pink-500 bg-pink-500/10 text-pink-400',
  },
  {
    id: 'Instagram Reels',
    name: 'Reels',
    icon: FaInstagram,
    activeColor: 'border-purple-500 bg-purple-500/10 text-purple-400',
  },
  {
    id: 'YouTube Shorts',
    name: 'Shorts',
    icon: FaYoutube,
    activeColor: 'border-red-500 bg-red-500/10 text-red-400',
  },
]

export default function PlatformSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {platforms.map((p) => {
        const Icon = p.icon
        const isSelected = value === p.id
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 transform active:scale-95 ${
              isSelected
                ? `${p.activeColor} border-2 shadow-lg shadow-brand-500/10`
                : 'border border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Icon
              className={`h-5 w-5 transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}
            />
            <span>{p.name}</span>
          </button>
        )
      })}
    </div>
  )
}
