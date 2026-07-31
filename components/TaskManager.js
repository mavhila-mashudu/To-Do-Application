"use client";

import { useCallback, useEffect, useState } from "react";

import AppHeader from "./AppHeader";
import TaskList from "./TaskList";
import TaskModal from "./TaskModal";
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
  const [modalTask, setModalTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [feedback, setFeedback] = useState(null);

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

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => setFeedback(null), 4500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

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

  function openCreateModal() {
    setModalTask(null);
    setFormErrors({});
    setIsTaskModalOpen(true);
  }

  function openEditModal(task) {
    setModalTask(task);
    setFormErrors({});
    setIsTaskModalOpen(true);
  }

  function closeTaskModal() {
    if (!isSaving) {
      setIsTaskModalOpen(false);
      setModalTask(null);
      setFormErrors({});
    }
  }

  async function saveTask(values) {
    const isEditing = Boolean(modalTask);
    const url = isEditing ? `/api/tasks/${modalTask.id}` : "/api/tasks";

    setIsSaving(true);
    setFormErrors({});

    try {
      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFormErrors({
          ...(payload?.error?.fields ?? {}),
          form: getErrorMessage(payload, "The task could not be saved."),
        });
        return;
      }

      const nextTasks = await requestTasks();
      setTasks(nextTasks);
      setIsTaskModalOpen(false);
      setModalTask(null);
      setFeedback({
        type: "success",
        message: isEditing ? "Task updated successfully." : "Task created successfully.",
      });
    } catch (requestError) {
      setFormErrors({
        form: requestError.message || "The task could not be saved.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.appShell}>
      <AppHeader onNewTask={openCreateModal} />

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
            onNewTask={openCreateModal}
            onEdit={openEditModal}
          />
        </section>
      </main>

      {feedback ? (
        <div
          className={`${styles.toast} ${styles.toastSuccess}`}
          role="status"
          aria-live="polite"
        >
          <span className={styles.toastMark} aria-hidden="true">✓</span>
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss message">
            ×
          </button>
        </div>
      ) : null}

      {isTaskModalOpen ? (
        <TaskModal
          key={modalTask?.id ?? "new-task"}
          task={modalTask}
          errors={formErrors}
          isSaving={isSaving}
          onSave={saveTask}
          onClose={closeTaskModal}
        />
      ) : null}
    </div>
  );
}
