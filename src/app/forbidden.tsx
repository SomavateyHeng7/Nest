import Link from "next/link";

import { ErrorScreen } from "@/components/errors/error-screen";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/i18n/server";

/** Rendered (with status 403) when a route calls forbidden(). */
export default async function Forbidden() {
  const { d } = await getI18n();
  const e = d.errors;
  return (
    <ErrorScreen
      code={e.forbidden.code}
      tone="warning"
      title={e.forbidden.title}
      body={e.forbidden.body}
      actions={
        <>
          <Button className="h-11 px-5" nativeButton={false} render={<Link href="/login" />}>
            {e.switchAccount}
          </Button>
          <Button variant="outline" className="h-11 px-5" nativeButton={false} render={<Link href="/" />}>
            {e.home}
          </Button>
        </>
      }
    />
  );
}
