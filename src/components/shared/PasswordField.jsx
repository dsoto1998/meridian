import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

export default function PasswordField({ value, onChange, placeholder, autoFocus, error, onEnter, id }) {
  const [shown, setShown] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);

  return (
    <div style={{
      position: 'relative',
      display: 'flex', alignItems: 'center',
      background: 'var(--color-surface)',
      border: '1px solid ' + (error ? 'var(--color-urgent)' : 'var(--color-border-strong)'),
      borderRadius: 9,
      transition: 'border-color 160ms var(--ease), box-shadow 160ms var(--ease)',
      boxShadow: error
        ? '0 0 0 3px rgba(194, 91, 107, 0.10)'
        : '0 1px 0 rgba(20, 20, 30, 0.02)',
    }}>
      <input
        id={id}
        ref={ref}
        type={shown ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        onKeyDown={(e) => { if (e.key === 'Enter') onEnter?.(); }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.parentElement.style.borderColor = 'var(--color-accent)';
            e.currentTarget.parentElement.style.boxShadow = '0 0 0 3px var(--tint-glow)';
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.parentElement.style.borderColor = 'var(--color-border-strong)';
            e.currentTarget.parentElement.style.boxShadow = '0 1px 0 rgba(20, 20, 30, 0.02)';
          }
        }}
        style={{
          flex: 1, border: 'none', outline: 'none',
          background: 'transparent',
          padding: '11px 6px 11px 14px',
          fontSize: 14, color: 'var(--color-text-primary)',
          fontFamily: 'inherit',
          letterSpacing: shown ? 'normal' : '0.05em',
        }}
      />
      <button
        type="button"
        aria-label={shown ? 'Hide password' : 'Show password'}
        onClick={() => setShown((s) => !s)}
        tabIndex={-1}
        style={{
          width: 36, height: 36, marginRight: 4,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-tertiary)',
          borderRadius: 6,
          transition: 'color 160ms var(--ease)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
      >
        <Icon name="eye" size={15} stroke={1.6} />
      </button>
    </div>
  );
}
