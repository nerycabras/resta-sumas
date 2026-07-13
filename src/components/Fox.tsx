// Mascota zorro (reutilizable). Migra el zorro del prototipo a un SVG limpio
// con expresiones para las distintas pantallas.

interface FoxProps {
  size?: number;
  mood?: 'happy' | 'neutral' | 'sad';
  bob?: boolean;
}

export function Fox({ size = 76, mood = 'neutral', bob = false }: FoxProps) {
  const coral = 'var(--c-coral)';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Zorro"
      style={{ animation: bob ? 'bob 2.4s ease-in-out infinite' : undefined }}
    >
      {/* orejas */}
      <path d="M14 10 L24 30 L8 24 Z" fill={coral} />
      <path d="M50 10 L40 30 L56 24 Z" fill={coral} />
      {/* cabeza */}
      <circle cx="32" cy="34" r="21" fill={coral} />
      {/* hocico */}
      <ellipse cx="32" cy="42" rx="12" ry="9" fill="#fff" />
      {mood === 'sad' ? (
        <>
          <path
            d="M23 33 l6 2"
            stroke="#2b2b2b"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M41 33 l-6 2"
            stroke="#2b2b2b"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="25" cy="34" r="3.2" fill="#2b2b2b" />
          <circle cx="39" cy="34" r="3.2" fill="#2b2b2b" />
        </>
      )}
      {/* nariz / boca */}
      <ellipse cx="32" cy="41" rx="3.4" ry="2.6" fill="#2b2b2b" />
      {mood === 'happy' && (
        <path
          d="M26 45 q6 5 12 0"
          stroke="#2b2b2b"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
