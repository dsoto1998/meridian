import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { getRecurrenceType, getDefaultRecurrence } from '../utils/recurrence';

const DEFAULT_LISTS = [
  { id: 'urgent',    name: 'Urgent',    isDefault: true,  order: 0 },
  { id: 'daily',     name: 'Daily',     isDefault: true,  order: 1 },
  { id: 'weekly',    name: 'Weekly',    isDefault: true,  order: 2 },
  { id: 'monthly',   name: 'Monthly',   isDefault: true,  order: 3 },
  { id: 'quarterly', name: 'Quarterly', isDefault: true,  order: 4 },
  { id: 'annually',  name: 'Annually',  isDefault: true,  order: 5 },
];

const useAppStore = create(
  persist(
    (set, get) => ({
      lists: DEFAULT_LISTS,
      tasks: [],
      showCompleted: true,
      theme: 'lavender',

      // ── Lists ──────────────────────────────────────────────────
      addList: (name) => set((s) => ({
        lists: [...s.lists, {
          id: uuid(),
          name,
          isDefault: false,
          order: s.lists.length,
        }],
      })),

      updateList: (id, patch) => set((s) => ({
        lists: s.lists.map((l) => l.id === id ? { ...l, ...patch } : l),
      })),

      deleteList: (id) => set((s) => ({
        lists: s.lists.filter((l) => l.id !== id),
        tasks: s.tasks.filter((t) => t.listId !== id),
      })),

      reorderLists: (orderedIds) => set((s) => ({
        lists: orderedIds.map((id, i) => {
          const list = s.lists.find((l) => l.id === id);
          return { ...list, order: i };
        }),
      })),

      // ── Tasks ──────────────────────────────────────────────────
      addTask: (listId, title) => set((s) => {
        const listTasks = s.tasks.filter((t) => t.listId === listId);
        return {
          tasks: [...s.tasks, {
            id: uuid(),
            listId,
            title,
            notes: '',
            dueDate: null,
            priority: null,
            createdAt: new Date().toISOString(),
            completed: false,
            order: listTasks.length,
            recurrence: getDefaultRecurrence(listId),
            completedDates: [],
          }],
        };
      }),

      updateTask: (id, patch) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id ? { ...t, ...patch } : t),
      })),

      deleteTask: (id) => set((s) => ({
        tasks: s.tasks.filter((t) => t.id !== id),
      })),

      toggleTask: (id) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t),
      })),

      toggleTaskOccurrence: (id, isoDate) => set((s) => ({
        tasks: s.tasks.map((t) => {
          if (t.id !== id) return t;
          const dates = t.completedDates || [];
          const exists = dates.includes(isoDate);
          return {
            ...t,
            completedDates: exists ? dates.filter((d) => d !== isoDate) : [...dates, isoDate],
          };
        }),
      })),

      moveTask: (taskId, toListId, toIndex) => set((s) => {
        const task = s.tasks.find((t) => t.id === taskId);
        if (!task) return s;
        const withoutTask = s.tasks.filter((t) => t.id !== taskId);
        const destTasks = withoutTask
          .filter((t) => t.listId === toListId)
          .sort((a, b) => a.order - b.order);
        const listChanged = task.listId !== toListId;
        const recurrenceTypeChanged =
          listChanged && getRecurrenceType(task.listId) !== getRecurrenceType(toListId);
        const movedTask = {
          ...task,
          listId: toListId,
          ...(recurrenceTypeChanged ? { recurrence: null, completedDates: [] } : {}),
        };
        destTasks.splice(toIndex, 0, movedTask);
        const updatedDest = destTasks.map((t, i) => ({ ...t, order: i }));
        const others = withoutTask.filter((t) => t.listId !== toListId);
        return { tasks: [...others, ...updatedDest] };
      }),

      reorderTasksInList: (listId, orderedIds) => set((s) => ({
        tasks: s.tasks.map((t) => {
          if (t.listId !== listId) return t;
          const idx = orderedIds.indexOf(t.id);
          return idx === -1 ? t : { ...t, order: idx };
        }),
      })),

      // ── Preferences ───────────────────────────────────────────
      setShowCompleted: (v) => set({ showCompleted: v }),

      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('meridian-theme', theme);
        set({ theme });
      },

      // ── Data reset ────────────────────────────────────────────
      resetData: () => set({
        lists: DEFAULT_LISTS,
        tasks: [],
        showCompleted: true,
      }),
    }),
    {
      name: 'meridian-data',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const theme = state.theme || localStorage.getItem('meridian-theme') || 'lavender';
          document.documentElement.setAttribute('data-theme', theme);
        }
      },
    }
  )
);

export default useAppStore;
