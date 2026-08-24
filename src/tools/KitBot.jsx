import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Bot, Check, Loader2, Send, Trash2 } from 'lucide-react'
import { AGENT_COST, sendAgentMessage } from '../services/aiEngine.js'
import { supabase, isSupabaseConfigured } from '../services/supabase.js'
import { useI18n } from '../i18n/LanguageContext.jsx'
import { friendlyError } from '../i18n/strings.js'

const TONES = ['Energetic', 'Curious', 'Bold', 'Inspirational', 'Funny']

function ProfilePanel() {
  const { user } = useOutletContext()
  const { t } = useI18n()
  const [profile, setProfile] = useState({
    niche: '',
    target_audience: '',
    content_tone: 'Energetic',
    custom_instructions: '',
  })
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState('idle')

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!isSupabaseConfigured || !supabase || !user) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('creator_profiles')
        .select('niche, target_audience, content_tone, custom_instructions')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!cancelled && data) {
        setProfile({
          niche: data.niche ?? '',
          target_audience: data.target_audience ?? '',
          content_tone: data.content_tone ?? 'Energetic',
          custom_instructions: data.custom_instructions ?? '',
        })
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user])

  async function handleSave(e) {
    e.preventDefault()
    if (!isSupabaseConfigured || !supabase || !user) return
    setSaveState('saving')
    const { error } = await supabase.from('creator_profiles').upsert({
      user_id: user.id,
      niche: profile.niche.trim().slice(0, 150) || null,
      target_audience: profile.target_audience.trim().slice(0, 160) || null,
      content_tone: TONES.includes(profile.content_tone) ? profile.content_tone : 'Energetic',
      custom_instructions: profile.custom_instructions.trim().slice(0, 500) || null,
      updated_at: new Date().toISOString(),
    })
    setSaveState(error ? 'error' : 'done')
    if (!error) setTimeout(() => setSaveState('idle'), 2000)
  }

  const set = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }))

  return (
    <details data-background-lock className="card">
      <summary className="cursor-pointer select-none text-sm font-semibold text-zinc-950">
        ðŸ§  {t('profile.title')}
      </summary>
      <form onSubmit={handleSave} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="kb-niche" className="label">{t('profile.niche')}</label>
            <input id="kb-niche" className="input" value={profile.niche} onChange={set('niche')}
              placeholder={t('profile.niche.placeholder')} maxLength={150} />
          </div>
          <div>
            <label htmlFor="kb-audience" className="label">{t('profile.audience')}</label>
            <input id="kb-audience" className="input" value={profile.target_audience} onChange={set('target_audience')}
              placeholder={t('profile.audience.placeholder')} maxLength={160} />
          </div>
        </div>
        <div>
          <label htmlFor="kb-tone" className="label">{t('profile.tone')}</label>
          <select id="kb-tone" className="input" value={profile.content_tone} onChange={set('content_tone')}>
            {TONES.map((tone) => (
              <option key={tone} value={tone}>{t(`tone.${tone}`)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="kb-instructions" className="label">{t('profile.instructions')}</label>
          <textarea id="kb-instructions" className="input min-h-[72px]" value={profile.custom_instructions}
            onChange={set('custom_instructions')} placeholder={t('profile.instructions.placeholder')} maxLength={500} />
        </div>
        <button type="submit"
          disabled={!isSupabaseConfigured || !user || loading || saveState === 'saving'}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 px-3.5 py-2 text-sm font-semibold text-blue-700 transition hover:bg-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50">
          {saveState === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" />
            : saveState === 'done' ? <Check className="h-4 w-4 text-emerald-400" /> : null}
          {saveState === 'done' ? t('profile.saved') : t('profile.save')}
        </button>
      </form>
    </details>
  )
}

export default function KitBot() {
  const { refreshCredits, user } = useOutletContext()
  const { t } = useI18n()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, sending])

  // MÃ©moire : on recharge les 20 derniers Ã©changes au montage
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user) return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await supabase
          .from('chat_messages')
          .select('role, content')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
        if (!cancelled && data?.length) {
          setMessages(data.reverse())
        }
      } catch {
        /* pas d'historique -> chat vierge */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  async function clearHistory() {
    setMessages([])
    setError('')
    if (isSupabaseConfigured && supabase && user) {
      await supabase.from('chat_messages').delete().eq('user_id', user.id)
    }
  }

  function persistMessages(userText, assistantText) {
    if (!isSupabaseConfigured || !supabase || !user) return
    supabase
      .from('chat_messages')
      .insert([
        { user_id: user.id, role: 'user', content: userText },
        { user_id: user.id, role: 'assistant', content: assistantText },
      ])
      .then(null, () => {})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const message = input.trim()
    if (!message || sending) return
    setError('')
    setInput('')
    const history = messages.filter((m) => !m.demo).map(({ role, content }) => ({ role, content }))
    setMessages((prev) => [...prev, { role: 'user', content: message }])
    setSending(true)
    try {
      const reply = await sendAgentMessage(message, history)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      persistMessages(message, reply)
      await refreshCredits('kitbot')
    } catch (err) {
      setError(friendlyError(err, t))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-200 bg-white px-6 py-6 shadow-md transition-shadow duration-200 hover:shadow-lg">
        
        <div className="relative flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">KitBot</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">{t('tools.kitbot.desc')}</p>
            <p className="mt-1 text-xs font-medium text-zinc-400">{t('chat.costHint')}</p>
          </div>
        </div>
      </div>

      <ProfilePanel />

      <div data-background-lock className="card relative flex max-h-[52vh] min-h-[320px] flex-col gap-3 overflow-y-auto">
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            title={t('chat.clear')}
            aria-label={t('chat.clear')}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-50 hover:text-zinc-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-700">
          {t('chat.welcome')}
        </div>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'self-end rounded-br-sm bg-zinc-950 font-medium text-white'
                : 'self-start rounded-bl-sm border border-zinc-100 bg-zinc-50 text-zinc-700'
            }`}
          >
            {m.content}
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2 self-start text-xs font-medium text-zinc-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('chat.thinking')}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} data-background-lock className="card space-y-3">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder={t('chat.placeholder')}
            className="input min-h-[56px] flex-1 resize-none"
            maxLength={2000}
            rows={2}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t('chat.send')}
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
        {error && (
          <p className="animate-shake rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
