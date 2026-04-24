import { TimeClockEntry } from "@/stores/useTimeClockStore";

export function getOpenTimeClockEntry(entries: TimeClockEntry[], userId: string) {
  return entries.find((entry) => entry.userId === userId && entry.clockOut === null) ?? null;
}

export function getEntryDurationMs(entry: TimeClockEntry, referenceDate = new Date()) {
  const start = new Date(entry.clockIn).getTime();
  const end = entry.clockOut ? new Date(entry.clockOut).getTime() : referenceDate.getTime();

  return Math.max(end - start, 0);
}

function isSameDate(dateValue: string, referenceDate = new Date()) {
  const date = new Date(dateValue);

  return (
    date.getDate() === referenceDate.getDate() &&
    date.getMonth() === referenceDate.getMonth() &&
    date.getFullYear() === referenceDate.getFullYear()
  );
}

export function getTodayTimeEntries(
  entries: TimeClockEntry[],
  userId: string,
  referenceDate = new Date(),
) {
  return entries.filter((entry) => entry.userId === userId && isSameDate(entry.clockIn, referenceDate));
}

export function getTodayWorkedMs(
  entries: TimeClockEntry[],
  userId: string,
  referenceDate = new Date(),
) {
  return getTodayTimeEntries(entries, userId, referenceDate).reduce(
    (total, entry) => total + getEntryDurationMs(entry, referenceDate),
    0,
  );
}

export function formatDuration(ms: number) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours && !minutes) {
    return "0min";
  }

  if (!hours) {
    return `${minutes}min`;
  }

  if (!minutes) {
    return `${hours}h`;
  }

  return `${hours}h ${String(minutes).padStart(2, "0")}min`;
}

export function formatTime(dateValue: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}
