import { format } from "date-fns";

export function formatDateRange(checkIn: string, checkOut: string) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  return sameMonth
    ? `${format(start, "MMM d")} – ${format(end, "d, yyyy")}`
    : `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
}
