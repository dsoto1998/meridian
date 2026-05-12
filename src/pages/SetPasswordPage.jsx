import { useState } from 'react';
import AuthWordmark from '../components/shared/AuthWordmark';
import PasswordField from '../components/shared/PasswordField';
import Icon from '../components/shared/Icon';
import { setPassword } from '../utils/auth';
import useAuthStore from '../store/useAuthStore';

function AuthShell({ children }) {
  return (
    <div style={{
      height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)',
      backgroundImage:
        'radial-gradient(circle at 20% 0%, var(--color-accent-soft) 0%, transparent 45%), ' +
        'radial-gradient(circle at 90% 100%, var(--color-accent-soft) 0%, transparent 50%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        {children}
      </div>
      <div style={{
        position: 'absolute', bottom: 18, left: 0, right: 0,
        textAlign: 'center', fontSize: 11, color: 'var(--color-text-tertiary)', letterSpacing: '0.04em',
      }}>
        Stored locally on this device · Never synced
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const unlock = useAuthStore((s) => s.unlock);

  const mismatch = touched && confirm.length > 0 && pw !== confirm;
  const tooShort = touched && pw.length > 0 && pw.length < 6;
  const valid = pw.length >= 6 && pw === confirm;

  const submit = async () => {
    setTouched(true);
    if (!valid || loading) return;
    setLoading(true);
    await setPassword(pw);
    setLoading(false);
    unlock();
  };

  return (
    <AuthShell>
      <div style={{
        width: 400,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: '36px 36px 28px',
        boxShadow: '0 1px 2px rgba(20,20,30,0.03), 0 12px 32px rgba(20,20,30,0.06), 0 24px 48px rgba(140,111,199,0.08)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <AuthWordmark />
        </div>

        <div style={{
          fontSize: 17, fontWeight: 600,
          color: 'var(--color-text-primary)',
          textAlign: 'center', letterSpacing: '-0.01em', marginBottom: 6,
        }}>Create a password</div>
        <div style={{
          fontSize: 12.5, color: 'var(--color-text-tertiary)',
          textAlign: 'center', marginBottom: 24, lineHeight: 1.55, padding: '0 6px',
        }}>
          One-time setup to protect your workspace. You won't be able to recover this password later, so pick something you'll remember.
        </div>

        <label htmlFor="sp-pw" style={{
          fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em',
          color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 8,
        }}>Password</label>
        <PasswordField
          id="sp-pw"
          value={pw}
          onChange={setPw}
          placeholder="At least 6 characters"
          autoFocus
          error={tooShort}
        />

        <div style={{ height: 14 }} />

        <label htmlFor="sp-confirm" style={{
          fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em',
          color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 8,
        }}>Confirm password</label>
        <PasswordField
          id="sp-confirm"
          value={confirm}
          onChange={(v) => { setConfirm(v); setTouched(true); }}
          placeholder="Re-enter password"
          error={mismatch}
          onEnter={submit}
        />

        <div style={{
          minHeight: 22, marginTop: 8,
          fontSize: 11.5,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {mismatch ? (
            <>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-urgent)' }} />
              <span style={{ color: 'var(--color-urgent)' }}>Passwords don't match</span>
            </>
          ) : tooShort ? (
            <>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-urgent)' }} />
              <span style={{ color: 'var(--color-urgent)' }}>Use at least 6 characters</span>
            </>
          ) : valid ? (
            <>
              <span style={{ color: 'var(--color-accent)', display: 'inline-flex' }}>
                <Icon name="check" size={12} stroke={2.2} />
              </span>
              <span style={{ color: 'var(--color-text-secondary)' }}>Passwords match</span>
            </>
          ) : null}
        </div>

        <div style={{ marginTop: 10 }}>
          <button
            onClick={submit}
            disabled={!valid || loading}
            style={{
              width: '100%', padding: '12px 16px',
              background: (!valid || loading) ? 'var(--color-border-strong)' : 'var(--color-accent)',
              color: '#fff', fontSize: 13.5, fontWeight: 600,
              letterSpacing: '0.005em', borderRadius: 9,
              boxShadow: (!valid || loading) ? 'none' : '0 1px 2px rgba(20,20,30,0.08), 0 2px 6px rgba(140,111,199,0.18)',
              cursor: (!valid || loading) ? 'not-allowed' : 'pointer',
              transition: 'transform 120ms var(--ease), box-shadow 160ms var(--ease), background 160ms var(--ease)',
            }}
            onMouseEnter={(e) => {
              if (!valid || loading) return;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(20,20,30,0.08), 0 6px 14px rgba(140,111,199,0.24)';
            }}
            onMouseLeave={(e) => {
              if (!valid || loading) return;
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(20,20,30,0.08), 0 2px 6px rgba(140,111,199,0.18)';
            }}
          >
            {loading ? 'Setting up…' : 'Get started'}
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
