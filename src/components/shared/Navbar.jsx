import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';

function Wordmark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9.2" stroke="var(--color-text-primary)" strokeWidth="1.4" opacity="0.85" />
        <circle cx="11" cy="11" r="2" fill="var(--color-accent)" />
        <path d="M11 1.8v9.2L17.5 14" stroke="var(--color-text-primary)" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      </svg>
      <div style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 600, fontSize: 15,
        letterSpacing: '0.12em',
        color: 'var(--color-text-primary)',
      }}>MERIDIAN</div>
    </div>
  );
}

function ViewToggle() {
  const navigate = useNavigate();
  const location = useLocation();
  const view = location.pathname === '/calendar' ? 'calendar' : 'board';

  const options = [
    { id: 'board', label: 'Board', icon: 'board', path: '/' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', path: '/calendar' },
  ];

  return (
    <div style={{
      display: 'inline-flex', padding: 3,
      background: 'var(--color-surface-2)',
      borderRadius: 'var(--radius-pill)',
      border: '1px solid var(--color-border)',
      gap: 2,
    }}>
      {options.map((opt) => {
        const active = view === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => navigate(opt.path)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              background: active ? 'var(--color-surface)' : 'transparent',
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              fontWeight: active ? 600 : 500,
              fontSize: 13,
              boxShadow: active ? '0 1px 2px rgba(20,20,30,0.06), 0 0 0 1px var(--color-border)' : 'none',
              transition: 'all 220ms var(--ease)',
            }}
          >
            <Icon name={opt.icon} size={14} stroke={1.7} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Navbar({ onOpenSettings }) {
  const today = new Date();
  return (
    <div style={{
      height: 48,
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      padding: '0 14px',
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Wordmark />
      </div>

      <div>
        <ViewToggle />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
        <div style={{
          fontSize: 12, color: 'var(--color-text-tertiary)',
          fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em',
        }}>
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          style={{
            width: 30, height: 30,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, color: 'var(--color-text-secondary)',
            transition: 'background 180ms var(--ease)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Icon name="menu" size={18} stroke={1.8} />
        </button>
      </div>
    </div>
  );
}
