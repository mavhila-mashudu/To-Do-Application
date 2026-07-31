"use client";

import { useCallback, useEffect, useState } from "react";

import AppHeader from "./AppHeader";
import TaskList from "./TaskList";
import TaskStats from "./TaskStats";
import styles from "./TaskUI.module.css";

const SORT_OPTIONS = [
  { value: "dueDate", label: "Due Date" },
  { value: "status", label: "Status" },
  { value: "topic", label: "Topic" },
];

function getErrorMessage(payload, fallback) {
  return payload?.error?.message ?? fallback;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState("dueDate");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const requestTasks = useCallback(async (signal) => {
    const response = await fetch(
      `/api/tasks?archived=false&sortBy=${encodeURIComponent(sortBy)}`,
      { cache: "no-store", signal }
    );
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(getErrorMessage(payload, "Unable to load tasks."));
    }

    return Array.isArray(payload.data) ? payload.data : [];
  }, [sortBy]);

  useEffect(() => {
    const controller = new AbortController();
    requestTasks(controller.signal)
      .then((nextTasks) => setTasks(nextTasks))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load tasks.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [requestTasks]);

  function handleSortChange(nextSort) {
    if (nextSort === sortBy) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSortBy(nextSort);
  }

  function handleRetry() {
    setIsLoading(true);
    setError("");
    requestTasks()
      .then((nextTasks) => setTasks(nextTasks))
      .catch((requestError) => {
        setError(requestError.message || "Unable to load tasks.");
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div className={styles.appShell}>
      <AppHeader />

      <main className={styles.main} id="main-content">
        <div className={styles.pageHeading}>
          <h1>Active Tasks</h1>
          <span className={styles.taskCount} aria-live="polite">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        <TaskStats tasks={tasks} />

        <section aria-labelledby="active-task-list-heading">
          <div className={styles.listToolbar}>
            <h2 className={styles.visuallyHidden} id="active-task-list-heading">
              Active task list
            </h2>
            <span className={styles.sortLabel}>Sort by</span>
            <div className={styles.sortOptions} aria-label="Sort active tasks">
              {SORT_OPTIONS.map((option) => (
                <button
                  className={`${styles.sortButton} ${
                    sortBy === option.value ? styles.sortButtonActive : ""
                  }`}
                  type="button"
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  aria-pressed={sortBy === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
          />
        </section>
      </main>
    </div>
  );
}
