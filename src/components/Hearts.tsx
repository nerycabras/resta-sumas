// Vidas (corazones). Los llenos usan rojo; el que se acaba de perder hace
// la animación heartpop.

interface HeartsProps {
  lives: number;
  total?: number;
  size?: number;
  /** Índice del corazón que se está perdiendo (para animar), o null. */
  losing?: number | null;
}

export function Hearts({ lives, total = 3, size = 22, losing = null }: HeartsProps) {
  return (
    <div style={{ display: 'flex', gap: 5 }} aria-label={`${lives} de ${total} vidas`}>
      {Array.from({ length: total }, (_, i) => {
        const filled = i < lives;
        const animate = losing === i;
        return (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: filled ? 'var(--c-red)' : 'rgba(0,0,0,.12)',
              animation: animate ? 'heartpop .6s ease-out' : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
