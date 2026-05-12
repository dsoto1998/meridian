import { useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Icon from '../shared/Icon';
import TaskCard from './TaskCard';
import AddTaskForm from './AddTaskForm';
import { getHue } from '../../utils/listHues';
import useAppStore from '../../store/useAppStore';

function ListOptionsMenu({ list, onClose }) {
  const updateList = useAppStore((s) => s.updateList);
  const deleteList = useAppStore((s) => s.deleteList);
  const tasks = useAppStore((s) => s.tasks);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(list.name);
  const inputRef = useRef(null);

  const handleRename = () => {
    if (name.trim()) updateList(list.id, { name: name.trim() });
    setRenaming(false);
    onClose();
  };

  const handleDelete = () => {
    const count = tasks.filter((t) => t.listId === list.id).length;
    const msg = count > 0
      ? `Delete "${list.name}"? This will also delete ${count} task${count === 1 ? '' : 's'}.`
      : `Delete "${list.name}"?`;
    if (window.confirm(msg)) { deleteList(list.id); onClose(); }
  };

  return (
    <div
      style={{
        position: 'absolute', top: '100%', right: 0, zIndex: 50,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 10, padding: 6,
        boxShadow: 'var(--shadow-panel)',
        minWidth: 140,
        animation: 'meridianFadeIn 160ms var(--ease)',
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {renaming ? (
        <div style={{ padding: '4px 6px' }}>
          <input
            ref={inputRef}
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setRenaming(false); onClose(); } }}
            style={{
              width: '100%', border: '1px solid var(--color-accent)', borderRadius: 6,
              padding: '5px 8px', fontSize: 12.5, outline: 'none',
              background: 'var(--color-surface)', color: 'var(--color-text-primary)',
            }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button onClick={handleRename} style={{ flex: 1, padding: '5px', borderRadius: 6, background: 'var(--color-accent)', color: '#fff', fontSize: 11.5, fontWeight: 600 }}>Save</button>
            <button onClick={() => { setRenaming(false); onClose(); }} style={{ flex: 1, padding: '5px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 11.5, color: 'var(--color-text-secondary)' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <button
            onClick={() => { setRenaming(true); setTimeout(() => inputRef.current?.focus(), 0); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '7px 10px', borderRadius: 7,
              fontSize: 12.5, color: 'var(--color-text-primary)',
              transition: 'background 140ms var(--ease)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Icon name="note" size={12} stroke={1.7} />
            Rename
          </button>
          <button
            onClick={handleDelete}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '7px 10px', borderRadius: 7,
              fontSize: 12.5, color: 'var(--color-urgent)',
              transition: 'background 140ms var(--ease)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-urgent-soft)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Icon name="trash" size={12} stroke={1.7} />
            Delete list
          </button>
        </>
      )}
    </div>
  );
}

export default function List({ list, tasks, onOpen, showCompleted }) {
  const [adding, setAdding] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const addTask = useAppStore((s) => s.addTask);
  const toggleTask = useAppStore((s) => s.toggleTask);

  const visible = tasks
    .filter((t) => showCompleted || !t.completed)
    .sort((a, b) => a.order - b.order);

  const isUrgent = list.id === 'urgent';
  const hue = getHue(list.id);

  const {
    attributes, listeners, setNodeRef: setSortableRef,
    transform, transition, isDragging,
  } = useSortable({ id: list.id, data: { type: 'list' } });

  const { setNodeRef: setDropRef } = useDroppable({ id: list.id });

  const setRef = (el) => { setSortableRef(el); setDropRef(el); };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setRef} style={{ ...style, width: 'var(--list-width)', flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
      <div style={{
        background: 'var(--color-surface-2)',
        borderRadius: 'var(--radius-list)',
        border: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '100%',
        boxShadow: 'var(--shadow-list)',
        overflow: 'hidden',
      }}>
        {/* Header — drag handle */}
        <div
          {...attributes}
          {...listeners}
          style={{
            padding: 'var(--list-header-pad)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0, cursor: 'grab', position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: hue, opacity: 0.9 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.005em' }}>
              {list.name}
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)',
              background: 'var(--color-surface)', padding: '1px 6px',
              borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)',
              fontVariantNumeric: 'tabular-nums',
            }}>{visible.length}</div>
          </div>

          {!list.isDefault && (
            <div style={{ position: 'relative' }}>
              <button
                aria-label="List options"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
                style={{
                  width: 22, height: 22, borderRadius: 5,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-text-tertiary)', opacity: 0.7,
                  transition: 'all 140ms var(--ease)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.7'; }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="3" cy="7" r="1" fill="currentColor" />
                  <circle cx="7" cy="7" r="1" fill="currentColor" />
                  <circle cx="11" cy="7" r="1" fill="currentColor" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setMenuOpen(false)} />
                  <ListOptionsMenu list={list} onClose={() => setMenuOpen(false)} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: 'var(--list-body-pad)',
          display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)',
        }}>
          <SortableContext items={visible.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {visible.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                isUrgentList={isUrgent}
                onOpen={onOpen}
                onToggle={toggleTask}
              />
            ))}
          </SortableContext>

          {adding ? (
            <AddTaskForm
              onAdd={(title) => { addTask(list.id, title); }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 10px',
                borderRadius: 'var(--radius-card)',
                color: 'var(--color-text-tertiary)',
                fontSize: 12.5, fontWeight: 500,
                transition: 'all 160ms var(--ease)',
                border: '1px dashed transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-surface)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-tertiary)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <Icon name="plus" size={13} stroke={1.8} />
              Add task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
