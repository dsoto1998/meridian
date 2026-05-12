import { useState, useMemo, useRef } from 'react';
import {
  DndContext, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragOverlay,
  pointerWithin, rectIntersection,
} from '@dnd-kit/core';

function collisionDetection(args) {
  const hits = pointerWithin(args);
  return hits.length > 0 ? hits : rectIntersection(args);
}
import {
  SortableContext, horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import List from './List';
import TaskCard, { TaskCardDisplay } from './TaskCard';
import Icon from '../shared/Icon';
import useAppStore from '../../store/useAppStore';

function AddListButton() {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const addList = useAppStore((s) => s.addList);

  const submit = () => {
    if (name.trim()) addList(name.trim());
    setName('');
    setAdding(false);
  };

  if (adding) {
    return (
      <div style={{
        width: 240, flexShrink: 0,
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-accent)',
        borderRadius: 'var(--radius-list)',
        padding: '12px',
        boxShadow: '0 0 0 3px var(--tint-glow)',
        animation: 'meridianFadeIn 180ms var(--ease)',
      }}>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setAdding(false); setName(''); } }}
          placeholder="List name…"
          style={{
            width: '100%', border: 'none', outline: 'none',
            background: 'transparent', fontSize: 13, fontWeight: 500,
            color: 'var(--color-text-primary)', marginBottom: 10,
          }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={submit}
            style={{ flex: 1, padding: '6px', borderRadius: 7, background: 'var(--color-accent)', color: '#fff', fontSize: 12, fontWeight: 600 }}
          >Add list</button>
          <button
            onClick={() => { setAdding(false); setName(''); }}
            style={{ flex: 1, padding: '6px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-secondary)' }}
          >Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setAdding(true)}
      style={{
        width: 240, flexShrink: 0,
        background: 'transparent',
        border: '1px dashed var(--color-border-strong)',
        borderRadius: 'var(--radius-list)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '14px', color: 'var(--color-text-tertiary)',
        fontSize: 12.5, fontWeight: 500, gap: 6, height: 64,
        transition: 'all 160ms var(--ease)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon name="plus" size={13} stroke={1.8} />
      Add list
    </button>
  );
}

export default function Board({ onOpen, showCompleted }) {
  const rawLists = useAppStore((s) => s.lists);
  const tasks = useAppStore((s) => s.tasks);
  const lists = useMemo(() => [...rawLists].sort((a, b) => a.order - b.order), [rawLists]);
  const reorderLists = useAppStore((s) => s.reorderLists);
  const moveTask = useAppStore((s) => s.moveTask);

  const [activeItem, setActiveItem] = useState(null);
  const lastMovedTo = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = ({ active }) => {
    setActiveItem(active);
    lastMovedTo.current = null;
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    if (active.data.current?.type !== 'task') return;

    const overType = over.data.current?.type;
    const overListId = overType === 'task' ? over.data.current.listId : over.id;

    // Determine where the task currently lives: use lastMovedTo if set,
    // otherwise fall back to the frozen drag-start value.
    const currentListId = lastMovedTo.current?.taskId === active.id
      ? lastMovedTo.current.listId
      : active.data.current.listId;

    if (overListId === currentListId) return; // same list — nothing to do

    const destTasks = tasks
      .filter((t) => t.listId === overListId)
      .sort((a, b) => a.order - b.order);

    let toIndex = destTasks.length;
    if (overType === 'task') {
      toIndex = destTasks.findIndex((t) => t.id === over.id);
      if (toIndex === -1) toIndex = destTasks.length;
    }

    moveTask(active.id, overListId, toIndex);
    lastMovedTo.current = { taskId: active.id, listId: overListId };
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveItem(null);
    lastMovedTo.current = null;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'list') {
      const oldIndex = lists.findIndex((l) => l.id === active.id);
      const newIndex = lists.findIndex((l) => l.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = [...lists];
        reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, lists[oldIndex]);
        reorderLists(reordered.map((l) => l.id));
      }
      return;
    }

    if (activeType === 'task') {
      // Read listId from store — active.data.current.listId is frozen at drag-start
      // and will be stale if handleDragOver already moved the task cross-list.
      const currentTask = tasks.find((t) => t.id === active.id);
      if (!currentTask) return;
      const currentListId = currentTask.listId;

      const overListId = overType === 'task'
        ? over.data.current.listId
        : over.id;

      // Cross-list: handleDragOver already committed the move — skip.
      if (currentListId !== overListId) return;

      // Same-list reorder: refine final position.
      const destTasks = tasks
        .filter((t) => t.listId === currentListId)
        .sort((a, b) => a.order - b.order);

      let toIndex = destTasks.length;
      if (overType === 'task') {
        toIndex = destTasks.findIndex((t) => t.id === over.id);
        if (toIndex === -1) toIndex = destTasks.length;
        const fromIndex = destTasks.findIndex((t) => t.id === active.id);
        if (fromIndex < toIndex) toIndex -= 1;
      }

      moveTask(active.id, currentListId, toIndex);
    }
  };

  const activeTask = activeItem?.data.current?.type === 'task'
    ? tasks.find((t) => t.id === activeItem.id)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{
        flex: 1, overflowX: 'auto', overflowY: 'hidden',
        padding: 'var(--board-pad)',
        background: 'var(--color-bg)',
        backgroundImage: 'radial-gradient(circle at 0% 0%, var(--tint-glow), transparent 50%)',
        height: '100%',
      }}>
        <SortableContext items={lists.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
          <div style={{
            display: 'flex', gap: 'var(--list-gap)',
            alignItems: 'stretch', height: '100%', minWidth: 'min-content',
          }}>
            {lists.map((list) => (
              <List
                key={list.id}
                list={list}
                tasks={tasks.filter((t) => t.listId === list.id)}
                onOpen={onOpen}
                showCompleted={showCompleted}
              />
            ))}
            <AddListButton />
          </div>
        </SortableContext>
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCardDisplay
            task={activeTask}
            isUrgentList={activeTask.listId === 'urgent'}
            onOpen={() => {}}
            onToggle={() => {}}
            dragOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
