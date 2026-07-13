import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './design/global.css';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthProvider.tsx';

// Enganche solo para desarrollo/tests E2E: expone cliente y stores en window.
if (import.meta.env.DEV) {
  void (async () => {
    const [{ supabase }, { useGame }, { useChild }, children, progress] =
      await Promise.all([
        import('./lib/supabase.ts'),
        import('./store/gameStore.ts'),
        import('./store/childStore.ts'),
        import('./data/children.ts'),
        import('./data/progress.ts'),
      ]);
    (window as unknown as Record<string, unknown>).__t = {
      supabase,
      useGame,
      useChild,
      children,
      progress,
    };
  })();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
