import { useState, useEffect, useRef } from 'react';
import Icon from '../shared/Icon';
import { getHue } from '../../utils/listHues';
import { getRecurrenceType, getDefaultRecurrence, isOccurrenceCompleted } from '../../utils/recurrence';
import RecurrencePicker from './RecurrencePicker';
import useAppStore from '../../store/useAppStore';

export default function TaskDetailModal({ task, occurrenceDate = null, onClose }) {
  const lists = useAppStore((s) => s.lists);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const toggleTaskOccurrence = useAppStore((s) => s.toggleTaskOccurrence);

  const isOccurrence = occurrenceDate != null;

  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [priority, setPriority] = useState(task.priority || null);
  const [listId, setListId] = useState(task.listId);
  const [completed, setCompleted] = useState(
    isOccurrence ? isOccurrenceCompleted(task, occurrenceDate) : !!task.completed
  );
  const [recurrence, setRecurrence] = useState(task.recurrence || getDefaultRecurrence(task.listId));

  const titleRef = useRef(null);
  useEffect(() => { titleRef.current?.focus(); }, []);

  const save = () => {
    const patch = {
      title: title.trim() || task.title,
      notes,
      dueDate: dueDate || null,
      priority,
      listId,
      recurrence,
    };

    if (isOccurrence) {
      const wasCompleted = isOccurrenceCompleted(task, occurrenceDate);
      if (completed !== wasCompleted) {
        toggleTaskOccurrence(task.id, occurrenceDate);
      }
    } else {
      patch.completed = completed;
    }

    updateTask(task.id, patch);
    onClose();
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') save(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const handleListChange = (e) => {
    const newListId = e.target.value;
    setListId(newListId);
    if (newListId === task.listId) {
      setRecurrence(task.recurrence || getDefaultRecurrence(task.listId));
    } else {
      setRecurrence(getDefaultRecurrence(newListId));
    }
  };

  const list = lists.find((l) => l.id === listId);
  const hue = getHue(listId);
  const recurrenceType = getRecurrenceType(listId);

  const PRIO_COLOR = { low: 'var(--prio-low)', medium: 'var(--prio-medium)', high: 'var(--prio-high)' };

  const handleDelete = () => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <>
      <div
        className="task-modal-backdrop"
        onClick={save}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(20, 20, 30, 0.32)',
          backdropFilter: 'blur(3px)',
          animation: 'meridianBackdrop 200ms var(--ease)',
          zIndex: 70,
        }}
      />
      <div className="task-modal-panel" style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 520, maxHeight: '85%',
        background: 'var(--color-surface)',
        borderRadius: 14,
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-panel)',
        animation: 'meridianModalPop 240ms var(--ease)',
        display: 'flex', flexDirection: 'column',
        zIndex: 71,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setCompleted((c) => !c)}
              title={isOccurrence ? `Mark ${occurrenceDate} done` : undefined}
              style={{
                width: 18, height: 18, borderRadius: 5,
                border: '1.6px solid var(--color-border-strong)',
                background: completed ? 'var(--color-accent)' : 'transparent',
                borderColor: completed ? 'var(--color-accent)' : 'var(--color-border-strong)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', transition: 'all 160ms var(--ease)',
              }}
            >
              {completed && <Icon name="check" size={12} stroke={2.4} />}
            </button>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '2px 8px', borderRadius: 'var(--radius-pill)',
              background: 'var(--color-surface-2)',
              fontSize: 11.5, fontWeight: 500, color: 'var(--color-text-secondary)',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: hue }} />
              {list?.name || ''}
            </div>
            {isOccurrence && (
              <div style={{
                fontSize: 11, color: 'var(--color-text-tertiary)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Icon name="calendar" size={11} stroke={1.6} />
                {occurrenceDate}
              </div>
            )}
          </div>
          <button
            onClick={save}
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

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 14px' }}>
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            style={{
              width: '100%', border: 'none', outline: 'none',
              background: 'transparent',
              fontSize: 18, fontWeight: 600,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em', padding: 0,
              textDecoration: completed ? 'line-through' : 'none',
              textDecorationColor: 'var(--color-text-tertiary)',
            }}
          />

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Due date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                <Icon name="calendar" size={12} stroke={1.7} /> Due
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  borderRadius: 7, padding: '5px 10px',
                  fontSize: 12.5, color: 'var(--color-text-primary)',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
              {dueDate && (
                <button
                  onClick={() => setDueDate('')}
                  style={{ fontSize: 11, color: 'var(--color-text-tertiary)', padding: '3px 6px', borderRadius: 4 }}
                >Clear</button>
              )}
            </div>

            {/* Priority */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                <Icon name="flag" size={12} stroke={1.7} /> Priority
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['low', 'medium', 'high'].map((p) => {
                  const active = priority === p;
                  const color = PRIO_COLOR[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(priority === p ? null : p)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '5px 10px', borderRadius: 'var(--radius-pill)',
                        border: '1px solid ' + (active ? color : 'var(--color-border)'),
                        background: active ? 'transparent' : 'var(--color-surface)',
                        color: active ? color : 'var(--color-text-secondary)',
                        fontSize: 12, fontWeight: 500,
                        transition: 'all 160ms var(--ease)',
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
                      {p[0].toUpperCase() + p.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 80, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                <Icon name="board" size={12} stroke={1.7} /> List
              </div>
              <select
                value={listId}
                onChange={handleListChange}
                style={{
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', borderRadius: 7,
                  padding: '5px 10px', fontSize: 12.5,
                  color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'inherit',
                }}
              >
                {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            {/* Recurrence */}
            {recurrenceType && (
              <div style={{
                paddingTop: 2,
                borderTop: '1px solid var(--color-border)',
                marginTop: 2, paddingTop: 10,
              }}>
                <RecurrencePicker
                  listId={listId}
                  recurrence={recurrence}
                  onChange={setRecurrence}
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={{ marginTop: 18 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
              color: 'var(--color-text-tertiary)', textTransform: 'uppercase',
              marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="note" size={11} stroke={1.7} /> Notes
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes…"
              rows={5}
              style={{
                width: '100%', border: '1px solid var(--color-border)',
                background: 'var(--color-surface)', borderRadius: 8,
                padding: '10px 12px', fontSize: 13, lineHeight: 1.5,
                color: 'var(--color-text-primary)', outline: 'none',
                resize: 'vertical', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface-2)',
        }}>
          <button
            onClick={handleDelete}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 10px', borderRadius: 7,
              color: 'var(--color-urgent)', fontSize: 12, fontWeight: 500,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-urgent-soft)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Icon name="trash" size={12} stroke={1.7} />
            Delete
          </button>
          <button
            onClick={save}
            style={{
              padding: '6px 14px', borderRadius: 7,
              background: 'var(--color-accent)', color: '#fff',
              fontSize: 12.5, fontWeight: 600,
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            }}
          >Done</button>
        </div>
      </div>
    </>
  );
}
