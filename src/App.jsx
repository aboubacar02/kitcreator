import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import HookGenerator from './tools/HookGenerator.jsx'
import ScriptWriter from './tools/ScriptWriter.jsx'
import HashtagFinder from './tools/HashtagFinder.jsx'
import TitleAnalyzer from './tools/TitleAnalyzer.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<Navigate to="hook" replace />} />
        <Route path="hook" element={<HookGenerator />} />
        <Route path="script" element={<ScriptWriter />} />
        <Route path="hashtag" element={<HashtagFinder />} />
        <Route path="title" element={<TitleAnalyzer />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
