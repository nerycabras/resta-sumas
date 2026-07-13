// Contador de gemas (rombo dorado + número).

interface GemCounterProps {
  gems: number;
  size?: number;
}

export function GemCounter({ gems, size = 16 }: GemCounterProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: '#fff',
        padding: '5px 12px 5px 8px',
        borderRadius: 20,
        boxShadow: '0 2px 6px rgba(0,0,0,.08)',
      }}
      aria-label={`${gems} gemas`}
    >
      <div
        style={{
          width: size,
          height: size,
          background: 'var(--c-gold)',
          transform: 'rotate(45deg)',
          borderRadius: 3,
        }}
      />
      <span
        style={{
          font: "800 15px var(--f-display)",
          color: 'var(--c-ink)',
        }}
      >
        {gems}
      </span>
    </div>
  );
}
