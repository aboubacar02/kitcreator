import { Navigate, Route, Routes } from 'react-router-dom'
import AnimatedBackground from './components/AnimatedBackground.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Settings from './pages/Settings.jsx'
import HookGenerator from './tools/HookGenerator.jsx'
import ScriptWriter from './tools/ScriptWriter.jsx'
import HashtagFinder from './tools/HashtagFinder.jsx'
import TitleAnalyzer from './tools/TitleAnalyzer.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'

export default function App() {
  return (
    <LanguageProvider>
      <AnimatedBackground />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="hook" replace />} />
          <Route path="hook" element={<HookGenerator />} />
          <Route path="script" element={<ScriptWriter />} />
          <Route path="hashtag" element={<HashtagFinder />} />
          <Route path="title" element={<TitleAnalyzer />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LanguageProvider>
  )
}
