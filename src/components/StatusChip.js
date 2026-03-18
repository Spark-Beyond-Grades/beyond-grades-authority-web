const STATUS_STYLES = {
  DRAFT: "bg-white border border-slate-200 text-slate-700",
  SCHEDULED: "bg-status-scheduled text-white",
  OPEN: "bg-status-open text-white",
  CLOSED: "bg-status-closed text-white",
};

/**
 * Shared status chip component — replaces three duplicate copies
 * that existed across dashboard, event overview, and published pages.
 */
export default function StatusChip({ status }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center ${
        STATUS_STYLES[status] || "bg-slate-200 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}
