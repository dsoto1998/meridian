import { useState } from 'react';
import Board from '../components/Board/Board';
import TaskDetailModal from '../components/Modals/TaskDetailModal';
import useAppStore from '../store/useAppStore';

export default function BoardPage() {
  const [openTask, setOpenTask] = useState(null);
  const showCompleted = useAppStore((s) => s.showCompleted);
  const tasks = useAppStore((s) => s.tasks);

  const handleOpen = (task) => {
    const fresh = tasks.find((t) => t.id === task.id) || task;
    setOpenTask(fresh);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <Board onOpen={handleOpen} showCompleted={showCompleted} />
      {openTask && (
        <TaskDetailModal
          task={openTask}
          onClose={() => setOpenTask(null)}
        />
      )}
    </div>
  );
}
