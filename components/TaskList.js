import TaskCard from "./TaskCard";
import styles from "./TaskUI.module.css";

function LoadingState() {
  return (
    <div className={styles.loadingGrid} aria-label="Loading tasks" aria-live="polite" aria-busy="true">
      {[0, 1, 2].map((item) => (
        <div className={styles.loadingCard} key={item} aria-hidden="true">
          <span className={styles.loadingTitle} />
          <span className={styles.loadingLine} />
          <span className={styles.loadingLineShort} />
        </div>
      ))}
      <span className={styles.visuallyHidden}>Loading tasks…</span>
    </div>
  );
}

export default function TaskList({ tasks, isLoading, error, onRetry }) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className={styles.statePanel} role="alert">
        <span className={styles.stateIconError} aria-hidden="true">!</span>
        <h3>Tasks could not be loaded</h3>
        <p>{error}</p>
        <button className={styles.secondaryButton} type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.statePanel}>
        <span className={styles.emptyTaskIcon} aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="7" y="10" width="26" height="24" rx="3" stroke="currentColor" strokeWidth="1.6" />
            <path d="M13 18h14M13 23h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <h3>No active tasks</h3>
        <p>You&apos;re all caught up. Create a new task when you are ready.</p>
      </div>
    );
  }

  return (
    <div className={styles.taskGrid}>
      {tasks.map((task) => (
        <TaskCard task={task} key={task.id} />
      ))}
    </div>
  );
}
