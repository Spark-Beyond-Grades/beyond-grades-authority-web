const STATUS_CONFIG = {
  DRAFT: {
    bg: "bg-slate-100/80",
    text: "text-slate-600",
    dot: "bg-slate-400",
    border: "border-slate-200/60",
  },
  SCHEDULED: {
    bg: "bg-indigo-50/80",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    border: "border-indigo-200/60",
  },
  OPEN: {
    bg: "bg-emerald-50/80",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200/60",
  },
  CLOSED: {
    bg: "bg-red-50/80",
    text: "text-red-700",
    dot: "bg-red-500",
    border: "border-red-200/60",
  },
};

const DEFAULT_CONFIG = {
  bg: "bg-slate-100/80",
  text: "text-slate-600",
  dot: "bg-slate-400",
  border: "border-slate-200/60",
};

/**
 * Glassmorphic status chip with colored dot indicator.
 */
export default function StatusChip({ status }) {
  const config = STATUS_CONFIG[status] || DEFAULT_CONFIG;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
        backdrop-blur-sm border
        ${config.bg} ${config.text} ${config.border}
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot}`}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}
