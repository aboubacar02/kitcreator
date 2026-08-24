import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AnimatedBackground from './components/AnimatedBackground.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'

const LandingPage = lazy(() => import('./pages/LandingPage.jsx'))
const Auth = lazy(() => import('./pages/Auth.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const HookGenerator = lazy(() => import('./tools/HookGenerator.jsx'))
const ScriptWriter = lazy(() => import('./tools/ScriptWriter.jsx'))
const HashtagFinder = lazy(() => import('./tools/HashtagFinder.jsx'))
const TitleAnalyzer = lazy(() => import('./tools/TitleAnalyzer.jsx'))
const PackGenerator = lazy(() => import('./tools/PackGenerator.jsx'))
const KitBot = lazy(() => import('./tools/KitBot.jsx'))
const Workspace = lazy(() => import('./pages/Workspace.jsx'))

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center" role="status" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      <span className="sr-only">Chargementâ€¦</span>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AnimatedBackground />
      <div className="relative z-10">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Navigate to="hook" replace />} />
              <Route path="hook" element={<HookGenerator />} />
              <Route path="script" element={<ScriptWriter />} />
              <Route path="hashtag" element={<HashtagFinder />} />
              <Route path="title" element={<TitleAnalyzer />} />
              <Route path="pack" element={<PackGenerator />} />
              <Route path="kitbot" element={<KitBot />} />
              <Route path="workspace" element={<Workspace />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </LanguageProvider>
  )
}
