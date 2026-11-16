import Link from "next/link";

import { ErrorScreen } from "@/shared/errors/error-screen";
import { Button } from "@/shared/ui/button";
import { getI18n } from "@/i18n/server";

/** Rendered (with status 401) when a route calls unauthorized(). */
export default async function Unauthorized() {
  const { d } = await getI18n();
  const e = d.errors;
  return (
    <ErrorScreen
      code={e.unauthorized.code}
      tone="warning"
      title={e.unauthorized.title}
      body={e.unauthorized.body}
      actions={
        <>
          <Button className="h-11 px-5" nativeButton={false} render={<Link href="/login" />}>
            {e.login}
          </Button>
          <Button variant="outline" className="h-11 px-5" nativeButton={false} render={<Link href="/" />}>
            {e.home}
          </Button>
        </>
      }
    />
  );
}
