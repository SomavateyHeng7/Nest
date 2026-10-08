import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="font-heading text-2xl font-semibold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button className="mt-2" nativeButton={false} render={<Link href="/" />}>
        Back to home
      </Button>
    </div>
  );
}
