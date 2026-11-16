import { BadgeCheck, CircleCheck, CircleDashed } from "lucide-react";

import { getI18n } from "@/i18n/server";
import type { Verification } from "@/features/listings/types";

const keys = ["identity", "ownership", "inPersonVisit", "photosMatch"] as const;

export async function VerificationPanel({ verification }: { verification: Verification }) {
  const { d, date } = await getI18n();
  const passed = keys.filter((k) => verification[k]).length;

  return (
    <div className="rounded-2xl border border-primary-sage/30 bg-accent/50 p-5">
      <div className="flex items-start gap-3">
        <BadgeCheck className="mt-0.5 size-6 shrink-0 text-primary-sage" />
        <div>
          <p className="font-semibold text-dark-forest">
            {passed === keys.length ? d.verification.title : d.verification.partial(passed, keys.length)}
          </p>
          <p className="text-sm text-muted-foreground">
            {d.verification.lastChecked(date(verification.verifiedOn, "MMMM d, yyyy"))}
          </p>
        </div>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {keys.map((key) => {
          const ok = verification[key];
          const item = d.verification.items[key];
          return (
            <li key={key} className="flex items-start gap-2.5">
              {ok ? (
                <CircleCheck className="mt-0.5 size-4.5 shrink-0 text-success" aria-label={d.verification.passed} />
              ) : (
                <CircleDashed className="mt-0.5 size-4.5 shrink-0 text-muted-foreground" aria-label={d.verification.scheduled} />
              )}
              <span>
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {ok ? item.detail : d.verification.scheduledBody}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
