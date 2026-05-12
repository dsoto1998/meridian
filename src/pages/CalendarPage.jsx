import { useState, useMemo } from 'react';
import Icon from '../components/shared/Icon';
import TaskDetailModal from '../components/Modals/TaskDetailModal';
import { getRecurrenceType, taskOccursOn, isOccurrenceCompleted } from '../utils/recurrence';
import useAppStore from '../store/useAppStore';

const PRIORITY_COLOR = {
  high: 'var(--prio-high)',
  medium: 'var(--prio-medium)',
  low: 'var(--prio-low)',
};

function chipColor(task) {
  if (task.priority) return PRIORITY_COLOR[task.priority];
  if (task.listId === 'urgent') return 'var(--color-urgent)';
  return 'var(--color-text-tertiary)';
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function pad(n) { return String(n).padStart(2, '0'); }
function isoDay(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      date: d,
      iso: isoDay(d.getFullYear(), d.getMonth(), d.getDate()),
      inMonth: d.getMonth() === month,
    };
  });
}

function CalendarChip({ task, lists, onOpen }) {
  const color = chipColor(task);
  const list = lists.find((l) => l.id === task.listId);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onOpen(task); }}
      title={task.title + (list ? '  ·  ' + list.name : '')}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        width: '100%', padding: '2px 6px 2px 5px', borderRadius: 5,
        background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
        borderLeft: `3px solid ${color}`,
        fontSize: 11, lineHeight: 1.25, color: 'var(--color-text-primary)',
        textAlign: 'left', overflow: 'hidden',
        opacity: task.completed ? 0.5 : 1,
        textDecoration: task.completed ? 'line-through' : 'none',
        transition: 'background 140ms var(--ease)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; }}
    >
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, fontWeight: 500 }}>
        {task.title}
      </span>
    </button>
  );
}

function DayCell({ cell, tasks, lists, isToday, isSelected, onSelect, onOpen }) {
  const visible = tasks.slice(0, 3);
  const extra = tasks.length - visible.length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(cell.iso)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(cell.iso); }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 3,
        padding: 6, background: 'var(--color-surface)',
        opacity: cell.inMonth ? 1 : 0.4,
        borderRight: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        textAlign: 'left', position: 'relative', cursor: 'pointer',
        outline: isSelected ? '1.5px solid var(--color-accent)' : 'none',
        outlineOffset: -1.5,
        zIndex: isSelected ? 2 : 1,
        minHeight: 0, minWidth: 0, overflow: 'hidden',
        transition: 'background 140ms var(--ease)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <div style={{
          fontSize: 12,
          fontWeight: isToday ? 700 : 500,
          color: isToday ? '#fff' : (cell.inMonth ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)'),
          background: isToday ? 'var(--color-accent)' : 'transparent',
          width: isToday ? 20 : 'auto', height: isToday ? 20 : 'auto',
          borderRadius: '50%',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}>{cell.date.getDate()}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minHeight: 0 }}>
        {visible.map((t) => <CalendarChip key={t._occurrenceDate ? `${t.id}-${t._occurrenceDate}` : t.id} task={t} lists={lists} onOpen={onOpen} />)}
        {extra > 0 && (
          <div style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--color-text-tertiary)', paddingLeft: 5 }}>
            +{extra} more
          </div>
        )}
      </div>
    </div>
  );
}

function DayDetail({ iso, tasks, lists, onOpen, isOpen, onClose }) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dowLabel = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayLabel = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="day-detail-backdrop"
          style={{ position: 'fixed', inset: 0, zIndex: 29, display: 'none' }}
        />
      )}
      <div className={isOpen ? 'calendar-day-detail is-open' : 'calendar-day-detail'} style={{
        width: 240, flexShrink: 0,
        background: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 20px 16px', position: 'relative' }}>
          <button
            onClick={onClose}
            aria-label="Close day panel"
            className="day-detail-close"
            style={{
              display: 'none',
              position: 'absolute', top: 14, right: 14,
              width: 30, height: 30, borderRadius: 8,
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              background: 'var(--color-surface-2)',
            }}
          >
            <Icon name="close" size={14} stroke={1.8} />
          </button>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>{dowLabel}</div>
          <div style={{ fontSize: 19, fontWeight: 600, color: 'var(--color-text-primary)', marginTop: 2, letterSpacing: '-0.01em' }}>{dayLabel}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tasks.length === 0 && (
            <div style={{ padding: '12px 0', fontSize: 12.5, color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
              Nothing scheduled. A clear day.
            </div>
          )}
          {tasks.map((t) => {
            const list = lists.find((l) => l.id === t.listId);
            const color = chipColor(t);
            return (
              <button
                key={t._occurrenceDate ? `${t.id}-${t._occurrenceDate}` : t.id}
                onClick={() => onOpen(t)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                  padding: '10px 12px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                  textAlign: 'left', boxShadow: 'var(--shadow-card)',
                  transition: 'all 160ms var(--ease)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
                  color: 'var(--color-text-tertiary)', textTransform: 'uppercase',
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
                  {list?.name || '—'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginTop: 4, lineHeight: 1.4 }}>
                  {t.title}
                </div>
                {t.priority && (
                  <div style={{ marginTop: 6 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '2px 7px 2px 6px', borderRadius: 'var(--radius-pill)',
                      fontSize: 10.5, fontWeight: 600,
                      color: t.priority === 'high' ? 'var(--prio-high)' : t.priority === 'medium' ? 'var(--prio-medium)' : 'var(--prio-low)',
                      border: '1px solid currentColor', opacity: 0.85,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                      {t.priority[0].toUpperCase() + t.priority.slice(1)}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function CalendarPage() {
  const lists = useAppStore((s) => s.lists);
  const tasks = useAppStore((s) => s.tasks);
  const today = new Date();

  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(isoDay(today.getFullYear(), today.getMonth(), today.getDate()));
  const [openTask, setOpenTask] = useState(null);
  const [daySheetOpen, setDaySheetOpen] = useState(false);

  const grid = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  const tasksByDay = useMemo(() => {
    const m = {};
    const gridIsos = grid.map((c) => c.iso);

    for (const t of tasks) {
      const recType = getRecurrenceType(t.listId);
      if (recType) {
        for (const iso of gridIsos) {
          if (taskOccursOn(t, iso)) {
            const viewTask = {
              ...t,
              _occurrenceDate: iso,
              completed: isOccurrenceCompleted(t, iso),
            };
            (m[iso] = m[iso] || []).push(viewTask);
          }
        }
      } else if (t.dueDate) {
        (m[t.dueDate] = m[t.dueDate] || []).push(t);
      }
    }
    return m;
  }, [tasks, grid]);

  const todayIso = isoDay(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedTasks = tasksByDay[selected] || [];

  const handleOpen = (task) => {
    const fresh = tasks.find((t) => t.id === task.id) || task;
    setOpenTask({ task: fresh, occurrenceDate: task._occurrenceDate || null });
  };

  return (
    <div className="calendar-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden', background: 'var(--color-bg)', height: '100%', position: 'relative' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Calendar header */}
        <div style={{
          padding: '18px 24px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
              {cursor.getFullYear()}
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.015em', marginTop: 1 }}>
              {MONTHS[cursor.getMonth()]}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(todayIso); }}
              style={{
                padding: '6px 12px', borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500,
                transition: 'all 160ms var(--ease)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; }}
            >Today</button>
            <div style={{ display: 'inline-flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-pill)', background: 'var(--color-surface)', overflow: 'hidden' }}>
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                aria-label="Previous month"
                style={{ width: 30, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}
              ><Icon name="chevronLeft" size={14} stroke={1.7} /></button>
              <div style={{ width: 1, background: 'var(--color-border)' }} />
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                aria-label="Next month"
                style={{ width: 30, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}
              ><Icon name="chevronRight" size={14} stroke={1.7} /></button>
            </div>
          </div>
        </div>

        {/* DOW headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 18px', flexShrink: 0 }}>
          {DOW.map((d) => (
            <div key={d} style={{
              fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em',
              color: 'var(--color-text-tertiary)', textTransform: 'uppercase',
              padding: '6px 8px',
            }}>{d}</div>
          ))}
        </div>

        {/* Month grid */}
        <div style={{
          flex: 1, margin: '0 18px 18px',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-list)',
          background: 'var(--color-surface)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(6, minmax(0, 1fr))',
          minHeight: 0,
        }}>
          {grid.map((cell) => (
            <DayCell
              key={cell.iso}
              cell={cell}
              tasks={tasksByDay[cell.iso] || []}
              lists={lists}
              isToday={cell.iso === todayIso}
              isSelected={cell.iso === selected}
              onSelect={(iso) => { setSelected(iso); setDaySheetOpen(true); }}
              onOpen={handleOpen}
            />
          ))}
        </div>
      </div>

      {/* Day detail rail */}
      <DayDetail
        iso={selected}
        tasks={selectedTasks}
        lists={lists}
        onOpen={handleOpen}
        isOpen={daySheetOpen}
        onClose={() => setDaySheetOpen(false)}
      />

      {openTask && (
        <TaskDetailModal
          task={openTask.task}
          occurrenceDate={openTask.occurrenceDate}
          onClose={() => setOpenTask(null)}
        />
      )}
    </div>
  );
}
