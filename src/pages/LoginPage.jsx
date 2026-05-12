import { useState } from 'react';
import AuthWordmark from '../components/shared/AuthWordmark';
import PasswordField from '../components/shared/PasswordField';
import { verifyPassword } from '../utils/auth';
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
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        {children}
      </div>
      <div style={{
        position: 'absolute', bottom: 18, left: 0, right: 0,
        textAlign: 'center',
        fontSize: 11, color: 'var(--color-text-tertiary)',
        letterSpacing: '0.04em',
      }}>
        Stored locally on this device · Never synced
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const unlock = useAuthStore((s) => s.unlock);

  const submit = async () => {
    if (!pw || loading) return;
    setLoading(true);
    const ok = await verifyPassword(pw);
    setLoading(false);
    if (ok) {
      unlock();
    } else {
      setError(true);
    }
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
        }}>Welcome back</div>
        <div style={{
          fontSize: 12.5, color: 'var(--color-text-tertiary)',
          textAlign: 'center', marginBottom: 24, lineHeight: 1.5,
        }}>Enter your password to unlock your workspace.</div>

        <label htmlFor="login-pw" style={{
          fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em',
          color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: 8,
        }}>Password</label>
        <PasswordField
          id="login-pw"
          value={pw}
          onChange={(v) => { setPw(v); if (error) setError(false); }}
          placeholder="••••••••"
          autoFocus
          error={error}
          onEnter={submit}
        />

        <div style={{
          minHeight: 22, marginTop: 8,
          fontSize: 11.5, color: 'var(--color-urgent)',
          opacity: error ? 1 : 0,
          transition: 'opacity 160ms var(--ease)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-urgent)' }} />
          Incorrect password
        </div>

        <div style={{ marginTop: 10 }}>
          <button
            onClick={submit}
            disabled={!pw || loading}
            style={{
              width: '100%', padding: '12px 16px',
              background: (!pw || loading) ? 'var(--color-border-strong)' : 'var(--color-accent)',
              color: '#fff', fontSize: 13.5, fontWeight: 600,
              letterSpacing: '0.005em', borderRadius: 9,
              boxShadow: (!pw || loading) ? 'none' : '0 1px 2px rgba(20,20,30,0.08), 0 2px 6px rgba(140,111,199,0.18)',
              cursor: (!pw || loading) ? 'not-allowed' : 'pointer',
              transition: 'transform 120ms var(--ease), box-shadow 160ms var(--ease), background 160ms var(--ease)',
            }}
            onMouseEnter={(e) => {
              if (!pw || loading) return;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(20,20,30,0.08), 0 6px 14px rgba(140,111,199,0.24)';
            }}
            onMouseLeave={(e) => {
              if (!pw || loading) return;
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(20,20,30,0.08), 0 2px 6px rgba(140,111,199,0.18)';
            }}
          >
            {loading ? 'Unlocking…' : 'Unlock'}
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
