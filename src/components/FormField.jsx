/** Accessible label + control + inline error. `children` receives the props the control needs. */
export default function FormField({ id, label, required = false, hint, error, counter, children }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>
        {label} {required ? <span className="req" aria-hidden="true">*</span> : <span className="opt">(optional)</span>}
        {required && <span className="sr-only"> required</span>}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? 'true' : undefined, 'aria-required': required || undefined })}
      {hint && <p className="hint" id={`${id}-hint`}>{hint}</p>}
      {counter && <p className="counter" aria-hidden="true">{counter}</p>}
      {error && <p className="error-text" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}
