import Link from "next/link";

import { ErrorScreen } from "@/shared/errors/error-screen";
import { Button } from "@/shared/ui/button";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { d } = await getI18n();
  const e = d.errors;
  return (
    <ErrorScreen
      code={e.notFound.code}
      title={e.notFound.title}
      body={e.notFound.body}
      actions={
        <>
          <Button className="h-11 px-5" nativeButton={false} render={<Link href="/listing" />}>
            {e.search}
          </Button>
          <Button variant="outline" className="h-11 px-5" nativeButton={false} render={<Link href="/" />}>
            {e.home}
          </Button>
        </>
      }
    />
  );
}
