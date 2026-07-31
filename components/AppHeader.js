import Link from "next/link";

import styles from "./TaskUI.module.css";

export default function AppHeader({
  activeView = "dashboard",
  archivedCount = 0,
  onNewTask,
  showArchived = false,
}) {
  return (
    <header className={styles.appHeader}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="Tasker dashboard">
          <span className={styles.brandMark} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 4.5h10M3 8h7M3 11.5h5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>Tasker</span>
        </Link>

        <nav className={styles.navigation} aria-label="Main navigation">
          <Link
            className={`${styles.navLink} ${
              activeView === "dashboard" ? styles.navLinkActive : ""
            }`}
            href="/"
            aria-current={activeView === "dashboard" ? "page" : undefined}
          >
            Dashboard
          </Link>

          {showArchived ? (
            <Link
              className={`${styles.navLink} ${
                activeView === "archived" ? styles.navLinkActive : ""
              }`}
              href="/archived"
              aria-current={activeView === "archived" ? "page" : undefined}
            >
              Archived
              {archivedCount > 0 ? (
                <span
                  className={styles.navCount}
                  aria-label={`${archivedCount} archived`}
                >
                  {archivedCount}
                </span>
              ) : null}
            </Link>
          ) : null}
        </nav>

        {onNewTask ? (
          <button className={styles.primaryButton} type="button" onClick={onNewTask}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path
                d="M6.5 1.5v10M1.5 6.5h10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span className={styles.newTaskLabel}>New Task</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
