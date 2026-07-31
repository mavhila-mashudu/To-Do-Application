import styles from "./TaskUI.module.css";

const STATUSES = [
  { key: "total", label: "Total", className: "statTotal" },
  { key: "Todo", label: "To Do", className: "statTodo" },
  { key: "In-Progress", label: "In Progress", className: "statProgress" },
  { key: "Complete", label: "Complete", className: "statComplete" },
  { key: "overdue", label: "Overdue", className: "statOverdue" },
];

export default function TaskStats({ tasks }) {
  const counts = tasks.reduce(
    (result, task) => {
      result.total += 1;
      result[task.status] = (result[task.status] ?? 0) + 1;

      if (task.overdue) {
        result.overdue += 1;
      }

      return result;
    },
    { total: 0, Todo: 0, "In-Progress": 0, Complete: 0, overdue: 0 }
  );

  return (
    <section className={styles.statsGrid} aria-label="Active task statistics">
      {STATUSES.map((stat) => (
        <div
          className={`${styles.statCard} ${styles[stat.className]}`}
          key={stat.key}
        >
          <strong aria-label={`${counts[stat.key]} ${stat.label}`}>
            {counts[stat.key]}
          </strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  );
}
