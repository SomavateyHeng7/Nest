import Link from "next/link";

import { ErrorScreen } from "@/shared/errors/error-screen";
import { ListingCard } from "@/features/listings/components/listing-card";
import { Button } from "@/shared/ui/button";
import { listings } from "@/features/listings/data";
import { getI18n } from "@/i18n/server";

/** A listing id that doesn't exist — usually a home that was paused or rented long-term. */
export default async function ListingNotFound() {
  const { d } = await getI18n();
  const e = d.errors;
  const suggestions = listings.filter((l) => l.city === "Phnom Penh").slice(0, 3);
  return (
    <ErrorScreen
      code={e.notFound.code}
      title={e.listingGone.title}
      body={e.listingGone.body}
      className="max-w-5xl"
      actions={
        <Button className="h-11 px-5" nativeButton={false} render={<Link href="/listing" />}>
          {e.search}
        </Button>
      }
    >
      <div className="grid gap-x-5 gap-y-8 text-left sm:grid-cols-3">
        {suggestions.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </ErrorScreen>
  );
}
