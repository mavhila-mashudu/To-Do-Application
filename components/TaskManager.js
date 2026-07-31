"use client";

import { useCallback, useEffect, useState } from "react";

import AppHeader from "./AppHeader";
import ArchiveDialog from "./ArchiveDialog";
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

export default function TaskManager({ archived = false }) {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState("dueDate");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalTask, setModalTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [archivedCount, setArchivedCount] = useState(0);
  const [archiveDialogTask, setArchiveDialogTask] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState("");

  const requestTasks = useCallback(async (signal) => {
    const response = await fetch(
      `/api/tasks?archived=${archived}&sortBy=${encodeURIComponent(sortBy)}`,
      { cache: "no-store", signal }
    );
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(getErrorMessage(payload, "Unable to load tasks."));
    }

    return Array.isArray(payload.data) ? payload.data : [];
  }, [archived, sortBy]);

  const requestArchivedCount = useCallback(async (signal) => {
    const response = await fetch("/api/tasks?archived=true&sortBy=dueDate", {
      cache: "no-store",
      signal,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(getErrorMessage(payload, "Unable to load archived tasks."));
    }

    return Array.isArray(payload.data) ? payload.data.length : 0;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      requestTasks(controller.signal),
      requestArchivedCount(controller.signal),
    ])
      .then(([nextTasks, nextArchivedCount]) => {
        setTasks(nextTasks);
        setArchivedCount(nextArchivedCount);
      })
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
  }, [requestArchivedCount, requestTasks]);

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
    Promise.all([requestTasks(), requestArchivedCount()])
      .then(([nextTasks, nextArchivedCount]) => {
        setTasks(nextTasks);
        setArchivedCount(nextArchivedCount);
      })
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

  const closeTaskModal = useCallback(() => {
    if (!isSaving) {
      setIsTaskModalOpen(false);
      setModalTask(null);
      setFormErrors({});
    }
  }, [isSaving]);

  function openArchiveDialog(task) {
    setArchiveDialogTask(task);
    setArchiveError("");
  }

  const closeArchiveDialog = useCallback(() => {
    if (!isArchiving) {
      setArchiveDialogTask(null);
      setArchiveError("");
    }
  }, [isArchiving]);

  async function confirmArchive() {
    if (!archiveDialogTask) {
      return;
    }

    setIsArchiving(true);
    setArchiveError("");

    try {
      const response = await fetch(`/api/tasks/${archiveDialogTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setArchiveError(getErrorMessage(payload, "The task could not be archived."));
        return;
      }

      const [nextTasks, nextArchivedCount] = await Promise.all([
        requestTasks(),
        requestArchivedCount(),
      ]);
      setTasks(nextTasks);
      setArchivedCount(nextArchivedCount);
      setArchiveDialogTask(null);
      setFeedback({
        type: "success",
        message: "Task archived successfully.",
      });
    } catch (requestError) {
      setArchiveError(requestError.message || "The task could not be archived.");
    } finally {
      setIsArchiving(false);
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
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <AppHeader
        activeView={archived ? "archived" : "dashboard"}
        archivedCount={archivedCount}
        onNewTask={archived ? undefined : openCreateModal}
        showArchived
      />

      <main className={styles.main} id="main-content">
        <div className={styles.pageHeading}>
          <div>
            <h1>{archived ? "Archived Tasks" : "Active Tasks"}</h1>
            {archived ? (
              <p className={styles.pageDescription}>
                Tasks you have archived remain available here for reference.
              </p>
            ) : null}
          </div>
          <span className={styles.taskCount} aria-live="polite">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        {archived ? null : <TaskStats tasks={tasks} />}

        <section aria-labelledby="task-list-heading">
          <h2 className={styles.visuallyHidden} id="task-list-heading">
            {archived ? "Archived task list" : "Active task list"}
          </h2>
          {!archived ? (
            <div className={styles.listToolbar}>
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
          ) : null}

          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            onNewTask={openCreateModal}
            onEdit={openEditModal}
            onArchive={openArchiveDialog}
            archived={archived}
          />
        </section>
      </main>

      {feedback ? (
        <div
          className={`${styles.toast} ${styles.toastSuccess}`}
          role="status"
          aria-live="polite"
        >
          <span className={styles.toastMark} aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="m2 6.5 3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss message">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 2l8 8M10 2 2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ) : null}

      {!archived && isTaskModalOpen ? (
        <TaskModal
          key={modalTask?.id ?? "new-task"}
          task={modalTask}
          errors={formErrors}
          isSaving={isSaving}
          onSave={saveTask}
          onClose={closeTaskModal}
        />
      ) : null}

      {archiveDialogTask ? (
        <ArchiveDialog
          task={archiveDialogTask}
          error={archiveError}
          isArchiving={isArchiving}
          onConfirm={confirmArchive}
          onClose={closeArchiveDialog}
        />
      ) : null}
    </div>
  );
}
