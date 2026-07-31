import styles from "./TaskUI.module.css";

const STATUS_OPTIONS = ["Todo", "In-Progress", "Complete"];

function FieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return (
    <p className={styles.fieldError} id={id} role="alert">
      {message}
    </p>
  );
}

export default function TaskForm({ values, errors, onChange, disabled }) {
  function updateField(field, value) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className={styles.formFields}>
      {errors.form ? (
        <div className={styles.formError} role="alert">
          {errors.form}
        </div>
      ) : null}

      <div className={styles.formField}>
        <label htmlFor="task-title">
          Title <span aria-hidden="true">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          value={values.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="e.g. Redesign landing page hero section"
          aria-describedby={errors.title ? "title-error" : undefined}
          aria-invalid={Boolean(errors.title)}
          required
          autoFocus
          disabled={disabled}
        />
        <FieldError id="title-error" message={errors.title} />
      </div>

      <div className={styles.formField}>
        <label htmlFor="task-description">
          Description <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="task-description"
          rows="4"
          value={values.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Add enough detail to make the next step clear."
          aria-describedby={errors.description ? "description-error" : undefined}
          aria-invalid={Boolean(errors.description)}
          required
          disabled={disabled}
        />
        <FieldError id="description-error" message={errors.description} />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label htmlFor="task-topic">
            Topic <span aria-hidden="true">*</span>
          </label>
          <input
            id="task-topic"
            type="text"
            list="task-topic-suggestions"
            value={values.topic}
            onChange={(event) => updateField("topic", event.target.value)}
            placeholder="e.g. Development"
            aria-describedby={errors.topic ? "topic-error" : undefined}
            aria-invalid={Boolean(errors.topic)}
            required
            disabled={disabled}
          />
          <datalist id="task-topic-suggestions">
            <option value="Design" />
            <option value="Development" />
            <option value="Marketing" />
            <option value="Operations" />
            <option value="Research" />
          </datalist>
          <FieldError id="topic-error" message={errors.topic} />
        </div>

        <div className={styles.formField}>
          <label htmlFor="task-due-date">
            Due date <span aria-hidden="true">*</span>
          </label>
          <input
            id="task-due-date"
            type="date"
            value={values.dueDate}
            onChange={(event) => updateField("dueDate", event.target.value)}
            aria-describedby={errors.dueDate ? "due-date-error" : undefined}
            aria-invalid={Boolean(errors.dueDate)}
            required
            disabled={disabled}
          />
          <FieldError id="due-date-error" message={errors.dueDate} />
        </div>
      </div>

      <fieldset className={styles.statusFieldset} disabled={disabled}>
        <legend>Status</legend>
        <div className={styles.statusOptions}>
          {STATUS_OPTIONS.map((status) => (
            <button
              className={`${styles.statusOption} ${
                values.status === status ? styles.statusOptionSelected : ""
              } ${styles[`statusOption${status.replace("-", "")}`]}`}
              type="button"
              role="radio"
              aria-checked={values.status === status}
              key={status}
              onClick={() => updateField("status", status)}
            >
              <span aria-hidden="true" />
              {status}
            </button>
          ))}
        </div>
        <FieldError id="status-error" message={errors.status} />
      </fieldset>
    </div>
  );
}
