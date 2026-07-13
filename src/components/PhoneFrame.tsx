// Marco "teléfono" responsive compartido por todas las pantallas.
import type { ReactNode } from 'react';
import styles from '../App.module.css';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.stage}>
      <main className={styles.frame}>{children}</main>
    </div>
  );
}
