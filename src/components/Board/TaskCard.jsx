import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Icon from '../shared/Icon';

const PRIORITY_COLOR = {
  high: 'var(--prio-high)',
  medium: 'var(--prio-medium)',
  low: 'var(--prio-low)',
};
const PRIORITY_LABEL = { high: 'High', medium: 'Med', low: 'Low' };

function PriorityBadge({ priority }) {
  if (!priority) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 7px 2px 6px',
      borderRadius: 'var(--radius-pill)',
      fontSize: 10.5, fontWeight: 600, letterSpacing: '0.02em',
      color: PRIORITY_COLOR[priority],
      background: 'transparent',
      border: '1px solid currentColor',
      opacity: 0.85,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
      {PRIORITY_LABEL[priority]}
    </div>
  );
}

function formatDue(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const diff = Math.round((date - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function dueTone(iso) {
  if (!iso) return 'normal';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const diff = Math.round((date - today) / 86400000);
  if (diff < 0) return 'overdue';
  if (diff <= 1) return 'soon';
  return 'normal';
}

export function TaskCardDisplay({ task, isUrgentList, onOpen, onToggle, dragOverlay, hover }) {
  const accent = PRIORITY_COLOR[task.priority] || (isUrgentList ? 'var(--color-urgent)' : 'transparent');
  const dueTxt = formatDue(task.dueDate);
  const tone = dueTone(task.dueDate);

  return (
    <div style={{
      position: 'relative',
      background: 'var(--color-card-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--card-pad)',
      boxShadow: hover ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
      transform: hover && !dragOverlay ? 'translateY(-1px)' : 'none',
      transition: 'transform 160ms var(--ease), box-shadow 160ms var(--ease), opacity 200ms var(--ease)',
      opacity: task.completed ? 0.55 : 1,
      cursor: 'pointer',
      overflow: 'hidden',
      animation: dragOverlay ? 'none' : 'meridianFadeIn 280ms var(--ease)',
    }}>
      {(task.priority || isUrgentList) && (
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle && onToggle(task.id); }}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            width: 16, height: 16, borderRadius: 4,
            border: '1.4px solid var(--color-border-strong)',
            background: task.completed ? 'var(--color-accent)' : 'transparent',
            borderColor: task.completed ? 'var(--color-accent)' : 'var(--color-border-strong)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 2,
            transition: 'all 160ms var(--ease)',
            color: '#fff',
          }}
        >
          {task.completed && <Icon name="check" size={12} stroke={2.4} />}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 'var(--card-title-size)', fontWeight: 500,
            color: 'var(--color-text-primary)',
            lineHeight: 1.4,
            textDecoration: task.completed ? 'line-through' : 'none',
            textDecorationColor: 'var(--color-text-tertiary)',
            wordBreak: 'break-word',
          }}>
            {task.title}
          </div>

          {task.notes && (
            <div style={{
              fontSize: 11.5, color: 'var(--color-text-tertiary)',
              marginTop: 4, lineHeight: 1.45,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {task.notes}
            </div>
          )}

          {(task.priority || dueTxt) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginTop: 'var(--card-meta-mt)', flexWrap: 'wrap',
            }}>
              <PriorityBadge priority={task.priority} />
              {dueTxt && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 500,
                  color: tone === 'overdue' ? 'var(--color-urgent)'
                       : tone === 'soon' ? 'var(--color-accent)'
                       : 'var(--color-text-tertiary)',
                }}>
                  <Icon name="calendar" size={11} stroke={1.7} />
                  {dueTxt}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TaskCard({ task, isUrgentList, onOpen, onToggle }) {
  const [hover, setHover] = useState(false);
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', listId: task.listId } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <TaskCardDisplay
        task={task}
        isUrgentList={isUrgentList}
        onOpen={onOpen}
        onToggle={onToggle}
        hover={hover}
      />
    </div>
  );
}
