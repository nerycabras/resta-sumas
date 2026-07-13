import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider.tsx';
import { useChild } from './store/childStore.ts';
import { PhoneFrame } from './components/PhoneFrame.tsx';
import { Fox } from './components/Fox.tsx';
import { Login } from './screens/Login.tsx';
import { ProfileSelect } from './screens/ProfileSelect.tsx';
import { Game } from './Game.tsx';

function Splash() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fox size={90} bob />
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <PhoneFrame><Splash /></PhoneFrame>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireChild({ children }: { children: ReactNode }) {
  const child = useChild((s) => s.child);
  if (!child) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { session, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          loading ? (
            <PhoneFrame><Splash /></PhoneFrame>
          ) : session ? (
            <Navigate to="/" replace />
          ) : (
            <PhoneFrame><Login /></PhoneFrame>
          )
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <PhoneFrame><ProfileSelect /></PhoneFrame>
          </RequireAuth>
        }
      />
      <Route
        path="/jugar"
        element={
          <RequireAuth>
            <RequireChild>
              <PhoneFrame><Game /></PhoneFrame>
            </RequireChild>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
