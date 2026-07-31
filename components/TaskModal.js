"use client";

import { useEffect, useRef, useState } from "react";

import TaskForm from "./TaskForm";
import styles from "./TaskUI.module.css";

const EMPTY_TASK = {
  title: "",
  description: "",
  topic: "",
  dueDate: "",
  status: "Todo",
};

export default function TaskModal({ task, errors, isSaving, onSave, onClose }) {
  const [values, setValues] = useState(() =>
    task
      ? {
          title: task.title,
          description: task.description,
          topic: task.topic,
          dueDate: task.dueDate,
          status: task.status,
        }
      : EMPTY_TASK
  );
  const dialogRef = useRef(null);
  const isEditing = Boolean(task);

  useEffect(() => {
    const previouslyFocused = document.activeElement;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSaving) {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href]'
      );

      if (!focusable?.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [isSaving, onClose]);

  function handleSubmit(event) {
    event.preventDefault();
    onSave(values);
  }

  function handleBackdropMouseDown(event) {
    if (event.target === event.currentTarget && !isSaving) {
      onClose();
    }
  }

  return (
    <div className={styles.modalBackdrop} onMouseDown={handleBackdropMouseDown}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        ref={dialogRef}
      >
        <div className={styles.modalHeader}>
          <h2 id="task-modal-title">{isEditing ? "Edit Task" : "New Task"}</h2>
          <button
            className={styles.iconButton}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            disabled={isSaving}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <TaskForm
            values={values}
            errors={errors}
            onChange={setValues}
            disabled={isSaving}
          />

          <div className={styles.modalFooter}>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button className={styles.primaryButton} type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
