import { Badge } from "@/components/ui/badge";
import type { ReservationStatus, TripStatus } from "@/types/dashboard";

const labels: Record<TripStatus | ReservationStatus, string> = {
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
};

const variants: Record<TripStatus | ReservationStatus, "secondary" | "outline" | "destructive"> = {
  upcoming: "secondary",
  completed: "outline",
  cancelled: "destructive",
};

export function StatusBadge({ status }: { status: TripStatus | ReservationStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
