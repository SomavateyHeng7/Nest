"use client";

import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";

/**
 * A button for an action that isn't built yet (it needs the backend or a
 * payment provider). Says so in a toast instead of silently doing nothing.
 */
export function ComingSoonButton({
  title,
  description,
  ...props
}: React.ComponentProps<typeof Button> & { title: string; description: string }) {
  return <Button {...props} onClick={() => toast.info(title, { description })} />;
}
