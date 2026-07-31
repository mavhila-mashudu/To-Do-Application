"use client";

import { useEffect, useRef } from "react";

import styles from "./TaskUI.module.css";

export default function ArchiveDialog({
  task,
  error,
  isArchiving,
  onConfirm,
  onClose,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isArchiving) {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = dialogRef.current?.querySelectorAll(
        "button:not([disabled])"
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
    dialogRef.current?.querySelector("button")?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [isArchiving, onClose]);

  function handleBackdropMouseDown(event) {
    if (event.target === event.currentTarget && !isArchiving) {
      onClose();
    }
  }

  return (
    <div className={styles.modalBackdrop} onMouseDown={handleBackdropMouseDown}>
      <section
        className={`${styles.modal} ${styles.archiveDialog}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="archive-dialog-title"
        aria-describedby="archive-dialog-description"
        ref={dialogRef}
      >
        <div className={styles.archiveDialogBody}>
          <span className={styles.archiveDialogIcon} aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M6 7v11h12V7M9 11h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 4h18v3H3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          </span>
          <h2 id="archive-dialog-title">Archive task?</h2>
          <p id="archive-dialog-description">
            This will move <strong>{task.title}</strong> to Archived. You can
            still view it there.
          </p>
          {error ? <p className={styles.formError} role="alert">{error}</p> : null}
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelButton}
            type="button"
            onClick={onClose}
            disabled={isArchiving}
          >
            Cancel
          </button>
          <button
            className={styles.archiveConfirmButton}
            type="button"
            onClick={onConfirm}
            disabled={isArchiving}
          >
            {isArchiving ? "Archiving..." : "Archive task"}
          </button>
        </div>
      </section>
    </div>
  );
}
