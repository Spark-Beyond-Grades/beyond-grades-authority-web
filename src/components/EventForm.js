const EVENT_TYPES = [
  { value: "CLUB", label: "Club" },
  { value: "PROJECT", label: "Project" },
  { value: "FEST", label: "Fest" },
  { value: "COMMITTEE", label: "Committee" },
  { value: "OTHER", label: "Other" },
];

/**
 * Core event form fields: name, type, description, feedback window dates.
 */
export default function EventForm({
  name,
  setName,
  type,
  setType,
  description,
  setDescription,
  openAt,
  setOpenAt,
  closeAtTentative,
  setCloseAtTentative,
  isEditable,
}) {
  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50 transition-shadow";

  return (
    <div className="grid gap-5">
      {/* Event Name */}
      <div>
        <label className="block text-sm font-medium text-brand-text">
          Event Name
        </label>
        <input
          disabled={!isEditable}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="e.g., IIC Recruitment Drive 2026"
        />
      </div>

      {/* Event Type */}
      <div>
        <label className="block text-sm font-medium text-brand-text">
          Event Type
        </label>
        <select
          disabled={!isEditable}
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={inputClass}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-brand-text">
          Description (optional)
        </label>
        <textarea
          disabled={!isEditable}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className={inputClass}
          placeholder="Short context about this event..."
        />
      </div>

      {/* Feedback Window */}
      <div className="pt-2">
        <h2 className="text-base font-semibold text-brand-text">
          Feedback Window
        </h2>
        <p className="text-sm text-brand-muted mt-1">
          Set when feedback collection opens and closes. (Stored in UTC;
          you&apos;ll enter in local time.)
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-text">
              Feedback Opening Date &amp; Time
            </label>
            <input
              disabled={!isEditable}
              type="datetime-local"
              value={openAt}
              onChange={(e) => setOpenAt(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text">
              Feedback Closing Date &amp; Time
            </label>
            <input
              disabled={!isEditable}
              type="datetime-local"
              value={closeAtTentative}
              onChange={(e) => setCloseAtTentative(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
