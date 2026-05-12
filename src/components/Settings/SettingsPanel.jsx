import { useState } from 'react';
import Icon from '../shared/Icon';
import PasswordField from '../shared/PasswordField';
import { verifyPassword, setPassword } from '../../utils/auth';
import useAppStore from '../../store/useAppStore';

const THEME_SWATCHES = [
  { id: 'lavender', label: 'Lavender', bg: '#f6f2fb', accent: '#8c6fc7' },
  { id: 'sage',     label: 'Sage',     bg: '#f1f5f0', accent: '#6a9070' },
  { id: 'blush',    label: 'Blush',    bg: '#fbf3f3', accent: '#c97a8c' },
  { id: 'sky',      label: 'Sky',      bg: '#f0f5fb', accent: '#6a90c4' },
  { id: 'peach',    label: 'Peach',    bg: '#fbf4ec', accent: '#c8865c' },
  { id: 'slate',    label: 'Slate',    bg: '#262a33', accent: '#8d9bba', dark: true },
];

function ThemePicker({ theme, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {THEME_SWATCHES.map((t) => {
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'stretch',
              gap: 8, padding: 8, borderRadius: 12,
              background: 'var(--color-surface)',
              border: active ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
              transition: 'all 180ms var(--ease)', textAlign: 'left',
            }}
          >
            <div style={{
              height: 44, borderRadius: 7,
              background: t.bg,
              border: `1px solid ${t.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', left: 6, top: 6, right: 14, height: 6, borderRadius: 3, background: t.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)' }} />
              <div style={{ position: 'absolute', left: 6, top: 18, width: 26, height: 4, borderRadius: 2, background: t.dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)' }} />
              <div style={{ position: 'absolute', left: 6, bottom: 6, width: 14, height: 14, borderRadius: '50%', background: t.accent }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 12, fontWeight: 500,
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}>
              {t.label}
              {active && <Icon name="check" size={12} stroke={2.2} style={{ color: 'var(--color-accent)' }} />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SwitchRow({ label, sublabel, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', borderTop: '1px solid var(--color-border)',
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11.5, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{sublabel}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        role="switch" aria-checked={value}
        style={{
          width: 34, height: 20, borderRadius: 999,
          background: value ? 'var(--color-accent)' : 'var(--color-border-strong)',
          padding: 2, position: 'relative',
          transition: 'background 180ms var(--ease)',
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transform: value ? 'translateX(14px)' : 'translateX(0)',
          transition: 'transform 200ms var(--ease)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }} />
      </button>
    </div>
  );
}

function ChangePasswordSection() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const mismatch = touched && confirm.length > 0 && next !== confirm;
  const tooShort = touched && next.length > 0 && next.length < 6;
  const valid = current.length > 0 && next.length >= 6 && next === confirm;

  const reset = () => { setCurrent(''); setNext(''); setConfirm(''); setTouched(false); setError(''); setSuccess(false); };

  const submit = async () => {
    setTouched(true);
    if (!valid || loading) return;
    setLoading(true);
    const ok = await verifyPassword(current);
    if (!ok) { setLoading(false); setError('Current password is incorrect.'); return; }
    await setPassword(next);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => { setOpen(false); reset(); }, 1500);
  };

  return (
    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
      <button
        onClick={() => { setOpen((o) => !o); reset(); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '4px 0',
          fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)',
        }}
      >
        Change password
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={14} stroke={1.7} style={{ color: 'var(--color-text-tertiary)' }} />
      </button>

      {open && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {success ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--color-accent)' }}>
              <Icon name="check" size={14} stroke={2} />
              Password updated successfully.
            </div>
          ) : (
            <>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Current password</div>
                <PasswordField value={current} onChange={(v) => { setCurrent(v); setError(''); }} placeholder="Enter current password" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>New password</div>
                <PasswordField value={next} onChange={setNext} placeholder="At least 6 characters" error={tooShort} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Confirm new password</div>
                <PasswordField value={confirm} onChange={(v) => { setConfirm(v); setTouched(true); }} placeholder="Re-enter new password" error={mismatch} onEnter={submit} />
              </div>
              {(error || mismatch || tooShort) && (
                <div style={{ fontSize: 11.5, color: 'var(--color-urgent)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-urgent)' }} />
                  {error || (mismatch ? "Passwords don't match" : 'Use at least 6 characters')}
                </div>
              )}
              <button
                onClick={submit}
                disabled={!valid || loading}
                style={{
                  padding: '8px 14px', borderRadius: 8, alignSelf: 'flex-start',
                  background: (!valid || loading) ? 'var(--color-border-strong)' : 'var(--color-accent)',
                  color: '#fff', fontSize: 12.5, fontWeight: 600,
                  cursor: (!valid || loading) ? 'not-allowed' : 'pointer',
                  transition: 'background 160ms var(--ease)',
                }}
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function SettingsPanel({ open, onClose }) {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const showCompleted = useAppStore((s) => s.showCompleted);
  const setShowCompleted = useAppStore((s) => s.setShowCompleted);
  const resetData = useAppStore((s) => s.resetData);

  const handleReset = () => {
    if (window.confirm('Reset all data? This will delete all tasks and lists. Your password will not be affected.')) {
      resetData();
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="settings-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(20, 20, 30, 0.25)',
          backdropFilter: 'blur(2px)',
          animation: 'meridianBackdrop 200ms var(--ease)',
          zIndex: 60,
        }}
      />
      <div className="settings-panel" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 340,
        background: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-panel)',
        animation: 'meridianSlideIn 280ms var(--ease)',
        display: 'flex', flexDirection: 'column',
        zIndex: 61,
      }}>
        <div style={{
          padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.04em' }}>Settings</div>
          <button
            onClick={onClose}
            style={{
              width: 26, height: 26, borderRadius: 6,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Icon name="close" size={14} stroke={1.8} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 10,
          }}>Color theme</div>
          <ThemePicker theme={theme} onChange={setTheme} />

          <div style={{ height: 24 }} />

          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 4,
          }}>Display</div>
          <SwitchRow
            label="Show completed tasks"
            sublabel="Display checked items in board view."
            value={showCompleted}
            onChange={setShowCompleted}
          />

          <div style={{ height: 16 }} />

          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 10,
          }}>Account</div>
          <ChangePasswordSection />

          <div style={{ height: 16 }} />

          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 10,
          }}>Data</div>
          <button
            onClick={handleReset}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-urgent)',
              fontSize: 12.5, fontWeight: 500,
              transition: 'all 160ms var(--ease)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-urgent-soft)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; }}
          >
            <Icon name="trash" size={13} stroke={1.7} />
            Reset all data…
          </button>

          <div style={{ height: 32 }} />
          <div style={{
            fontSize: 11, color: 'var(--color-text-tertiary)',
            lineHeight: 1.6, paddingTop: 14,
            borderTop: '1px solid var(--color-border)',
          }}>
            Meridian stores everything locally on this device. Nothing is synced or uploaded.
          </div>
        </div>

        <div style={{
          padding: '10px 18px',
          borderTop: '1px solid var(--color-border)',
          fontSize: 11, color: 'var(--color-text-tertiary)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>Meridian</span>
          <span>v1.0 · local</span>
        </div>
      </div>
    </>
  );
}
