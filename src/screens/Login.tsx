// Registro / inicio de sesión del adulto (email + contraseña). RF-01.
import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider.tsx';
import { Fox } from '../components/Fox.tsx';
import ui from './ui.module.css';
import styles from './Login.module.css';

export function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    const fn = mode === 'in' ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    if (mode === 'up') {
      setInfo('¡Cuenta creada! Ya puedes entrar.');
      setMode('in');
    }
    // Si el login tiene éxito, el guard de ruta redirige solo.
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <Fox size={84} mood="happy" bob />
        <div className={styles.brand}>Zorro Aventurero</div>
        <div className={styles.tagline}>Sumas y restas para peques</div>
      </div>

      <form className={styles.card} onSubmit={submit}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={mode === 'in' ? styles.tabOn : styles.tab}
            onClick={() => setMode('in')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={mode === 'up' ? styles.tabOn : styles.tab}
            onClick={() => setMode('up')}
          >
            Crear cuenta
          </button>
        </div>

        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
          />
        </label>

        <label className={styles.label}>
          Contraseña
          <input
            className={styles.input}
            type="password"
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        {error && <div className={styles.error}>{error}</div>}
        {info && <div className={styles.info}>{info}</div>}

        <button className={ui.btnPrimary} type="submit" disabled={busy}>
          {busy ? '…' : mode === 'in' ? 'Entrar' : 'Crear cuenta'}
        </button>
        <div className={styles.note}>
          Es el adulto quien gestiona la cuenta. Los niños solo juegan.
        </div>
      </form>
    </div>
  );
}
