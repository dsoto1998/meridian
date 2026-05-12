export default function AuthWordmark() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width="36" height="36" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="9.2" stroke="var(--color-text-primary)" strokeWidth="1.4" opacity="0.85" />
        <circle cx="11" cy="11" r="2" fill="var(--color-accent)" />
        <path d="M11 1.8v9.2L17.5 14" stroke="var(--color-text-primary)" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      </svg>
      <div style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 600,
        fontSize: 15,
        letterSpacing: '0.18em',
        color: 'var(--color-text-primary)',
      }}>MERIDIAN</div>
    </div>
  );
}
