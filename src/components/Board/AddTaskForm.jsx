import { useState, useRef, useEffect } from 'react';
import Icon from '../shared/Icon';

export default function AddTaskForm({ onAdd, onCancel }) {
  const [value, setValue] = useState('');
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => {
    if (value.trim()) onAdd(value.trim());
    onCancel();
  };

  return (
    <div style={{
      background: 'var(--color-card-bg)',
      border: '1px solid var(--color-accent)',
      borderRadius: 'var(--radius-card)',
      padding: '8px 10px',
      boxShadow: '0 0 0 3px var(--tint-glow)',
      animation: 'meridianFadeIn 200ms var(--ease)',
    }}>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Task title…"
        rows={2}
        style={{
          width: '100%', resize: 'none', border: 'none', outline: 'none',
          background: 'transparent', padding: 0,
          fontSize: 13, lineHeight: 1.45,
          color: 'var(--color-text-primary)',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <div style={{ fontSize: 10.5, color: 'var(--color-text-tertiary)' }}>Enter to add · Esc to cancel</div>
        <button
          onClick={submit}
          style={{
            padding: '4px 10px', borderRadius: 6,
            background: 'var(--color-accent)', color: '#fff',
            fontSize: 11.5, fontWeight: 600,
          }}
        >Add</button>
      </div>
    </div>
  );
}
