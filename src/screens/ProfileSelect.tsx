// Selector de perfil "¿Quién juega hoy?" (RF-03) + alta/edición/eliminación de
// niños (RF-02/RF-04) tras la puerta parental (RF-05).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.tsx';
import { useChild } from '../store/childStore.ts';
import {
  listChildren,
  createChild,
  updateChild,
  deleteChild,
  type Child,
} from '../data/children.ts';
import { Fox } from '../components/Fox.tsx';
import { ParentalGate } from '../components/ParentalGate.tsx';
import ui from './ui.module.css';
import styles from './ProfileSelect.module.css';

export function ProfileSelect() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const selectChild = useChild((s) => s.select);

  const [children, setChildren] = useState<Child[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Child | null>(null);
  const [manage, setManage] = useState(false);
  const [gate, setGate] = useState(false);

  const reload = async () => {
    try {
      setChildren(await listChildren());
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const play = (child: Child) => {
    selectChild(child);
    navigate('/jugar');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <div className={styles.title}>¿Quién juega hoy?</div>
        <button className={styles.link} onClick={signOut}>
          Salir
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {children === null && <div className={styles.loading}>Cargando…</div>}

      {children && (
        <div className={styles.grid}>
          {children.map((c) => (
            <div key={c.id} className={styles.card}>
              <button className={styles.avatarBtn} onClick={() => play(c)}>
                <Fox size={64} mood="happy" />
                <span className={styles.name}>{c.name}</span>
              </button>
              {manage && (
                <div className={styles.cardManage}>
                  <button className={styles.chip} onClick={() => setEditing(c)}>
                    Editar
                  </button>
                  <button
                    className={styles.chipDanger}
                    onClick={async () => {
                      await deleteChild(c.id);
                      reload();
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}

          <button className={styles.addCard} onClick={() => setAdding(true)}>
            <span className={styles.plus}>＋</span>
            <span className={styles.name}>Añadir</span>
          </button>
        </div>
      )}

      {children && children.length > 0 && (
        <button
          className={styles.manageBtn}
          onClick={() => (manage ? setManage(false) : setGate(true))}
        >
          {manage ? 'Listo' : 'Gestionar perfiles'}
        </button>
      )}

      {(adding || editing) && (
        <ChildForm
          initial={editing ?? undefined}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSaved={() => {
            setAdding(false);
            setEditing(null);
            reload();
          }}
        />
      )}

      {gate && (
        <ParentalGate
          onPass={() => {
            setGate(false);
            setManage(true);
          }}
          onCancel={() => setGate(false)}
        />
      )}
    </div>
  );
}

function ChildForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Child;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [age, setAge] = useState(
    initial?.birth_year ? String(new Date().getFullYear() - initial.birth_year) : '',
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) {
      setErr('Escribe un nombre.');
      return;
    }
    setBusy(true);
    setErr(null);
    const birth_year = age ? new Date().getFullYear() - Number(age) : null;
    try {
      if (initial) await updateChild(initial.id, { name: name.trim(), birth_year });
      else await createChild({ name: name.trim(), birth_year });
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalTitle}>
          {initial ? 'Editar perfil' : 'Nuevo perfil'}
        </div>
        <label className={styles.label}>
          Nombre o apodo
          <input
            className={styles.input}
            value={name}
            autoFocus
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ana"
          />
        </label>
        <label className={styles.label}>
          Edad (opcional)
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            min={4}
            max={12}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="7"
          />
        </label>
        {err && <div className={styles.error}>{err}</div>}
        <div className={styles.actions}>
          <button className={ui.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button className={ui.btnPrimary} onClick={save} disabled={busy}>
            {busy ? '…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
