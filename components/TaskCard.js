import styles from "./TaskUI.module.css";

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const TOPIC_TONES = [
  "topicBlue",
  "topicPurple",
  "topicPink",
  "topicAmber",
  "topicGreen",
];

function getTopicTone(topic) {
  const value = [...topic].reduce((total, character) => total + character.charCodeAt(0), 0);
  return TOPIC_TONES[value % TOPIC_TONES.length];
}

function formatDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(date.getTime()) ? dateValue : dateFormatter.format(date);
}

function getStatusClass(status) {
  if (status === "Complete") {
    return styles.statusComplete;
  }

  if (status === "In-Progress") {
    return styles.statusProgress;
  }

  return styles.statusTodo;
}

export default function TaskCard({ task, onEdit, onArchive, archived = false }) {
  return (
    <article className={styles.taskCard} aria-label={`Task: ${task.title}`}>
      <div className={styles.taskCardHeader}>
        <h3>{task.title}</h3>
        {archived ? <span className={styles.archivedBadge}>Archived</span> : null}
        {task.overdue ? (
          <span className={styles.overdueBadge} aria-label="Overdue">
            <span aria-hidden="true" />
            Overdue
          </span>
        ) : null}
      </div>

      <p className={styles.taskDescription}>{task.description}</p>

      <div className={styles.taskMeta}>
        <span className={`${styles.topicBadge} ${styles[getTopicTone(task.topic)]}`}>
          {task.topic}
        </span>
        <span className={styles.dueDate}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <rect x="0.75" y="1.75" width="9.5" height="8.5" rx="1.25" stroke="currentColor" strokeWidth="1.1" />
            <path d="M3.5.75v2M7.5.75v2M.75 4.5h9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
          <time dateTime={task.dueDate}>{formatDate(task.dueDate)}</time>
        </span>
        <span
          className={`${styles.statusBadge} ${getStatusClass(task.status)}`}
          aria-label={`Status: ${task.status}`}
        >
          <span aria-hidden="true" />
          {task.status}
        </span>
      </div>

      {onEdit || onArchive ? (
        <div className={styles.taskActions}>
          {onEdit ? (
            <button
              className={styles.editButton}
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit task: ${task.title}`}
            >
              Edit
            </button>
          ) : null}
          {onArchive ? (
            <button
              className={styles.archiveButton}
              type="button"
              onClick={() => onArchive(task)}
              aria-label={`Archive task: ${task.title}`}
            >
              Archive
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
