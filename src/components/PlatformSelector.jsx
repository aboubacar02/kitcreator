import { FaTiktok, FaYoutube, FaInstagram } from 'react-icons/fa'

const platforms = [
  {
    id: 'TikTok',
    name: 'TikTok',
    icon: FaTiktok,
    activeColor: 'border-pink-500 bg-pink-50 text-pink-600',
  },
  {
    id: 'Instagram Reels',
    name: 'Reels',
    icon: FaInstagram,
    activeColor: 'border-purple-500 bg-purple-50 text-purple-600',
  },
  {
    id: 'YouTube Shorts',
    name: 'Shorts',
    icon: FaYoutube,
    activeColor: 'border-red-500 bg-red-50 text-red-600',
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
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              isSelected
                ? `${p.activeColor} border-2`
                : 'border border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-950'
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
