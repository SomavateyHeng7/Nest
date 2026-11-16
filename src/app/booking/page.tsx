import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getI18n } from "@/i18n/server";

export default async function BookingIndexPage() {
  const { d } = await getI18n();
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="font-heading text-2xl font-semibold text-foreground">{d.bookingIndex.title}</h1>
      <p className="text-sm text-muted-foreground">{d.bookingIndex.body}</p>
      <Button className="mt-2" nativeButton={false} render={<Link href="/" />}>
        {d.bookingIndex.home}
      </Button>
    </div>
  );
}
