function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoDateTime(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/.exec(raw);
  const year = match ? Number(match[1]) : NaN;
  const month = match ? Number(match[2]) : NaN;
  const day = match ? Number(match[3]) : NaN;
  const utc = new Date(Date.UTC(year, month - 1, day));
  const realDay = Boolean(match) && utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day;
  const date = new Date(raw);
  if (!realDay || Number.isNaN(date.getTime())) {
    throw new Error("Enter a valid date and time");
  }
  return date.toISOString();
}

module.exports = { toDateTimeLocal, toIsoDateTime };
