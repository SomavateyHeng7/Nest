import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getListingById } from "@/data/listings";
import { formatDateRange } from "@/lib/format-date-range";
import type { Reservation } from "@/types/dashboard";

export function ReservationRow({ reservation }: { reservation: Reservation }) {
  const listing = getListingById(reservation.listingId);
  if (!listing) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      <Avatar size="lg">
        <AvatarImage src={reservation.guestAvatarUrl} alt={reservation.guestName} />
        <AvatarFallback>{reservation.guestName.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{reservation.guestName}</p>
          <StatusBadge status={reservation.status} />
        </div>
        <p className="text-sm text-muted-foreground">{listing.title}</p>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(reservation.checkIn, reservation.checkOut)} · {reservation.guests} guest
          {reservation.guests > 1 ? "s" : ""}
        </p>
      </div>

      <p className="shrink-0 text-sm font-medium text-foreground">${reservation.payout}</p>
    </div>
  );
}
