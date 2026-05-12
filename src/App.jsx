import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import useAppStore from './store/useAppStore';
import { hasStoredPassword } from './utils/auth';
import LoginPage from './pages/LoginPage';
import SetPasswordPage from './pages/SetPasswordPage';
import BoardPage from './pages/BoardPage';
import CalendarPage from './pages/CalendarPage';
import Navbar from './components/shared/Navbar';
import SettingsPanel from './components/Settings/SettingsPanel';

function AppShell() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Navbar onOpenSettings={() => setSettingsOpen(true)} />
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Routes>
          <Route path="/" element={<BoardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </div>
  );
}

export default function App() {
  const isUnlocked = useAuthStore((s) => s.isUnlocked);
  const theme = useAppStore((s) => s.theme);
  const [passwordSet, setPasswordSet] = useState(() => hasStoredPassword());

  useEffect(() => {
    const stored = localStorage.getItem('meridian-theme') || theme || 'lavender';
    document.documentElement.setAttribute('data-theme', stored);
  }, [theme]);

  useEffect(() => {
    setPasswordSet(hasStoredPassword());
  }, [isUnlocked]);

  if (!passwordSet) return <SetPasswordPage />;
  if (!isUnlocked) return <LoginPage />;

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell />
    </BrowserRouter>
  );
}
