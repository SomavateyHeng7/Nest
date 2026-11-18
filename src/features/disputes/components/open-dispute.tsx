"use client";

import { useState } from "react";
import { LifeBuoy, X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { toast } from "@/shared/ui/toast";
import type { DisputeKind, DisputeParty } from "@/features/admin/data";
import { useDisputes, type NewDispute } from "@/features/disputes/store";
import { useI18n } from "@/i18n/client";

const MIN_CHARS = 20;
const MAX_FILES = 5;
const kinds: DisputeKind[] = ["deposit", "mismatch", "cancellation", "payment"];

/** "Report a problem" on a stay: opens a case Nest staff pick up from the admin Disputes page. */
export function OpenDispute({
  openedBy,
  context,
  variant = "outline",
}: {
  openedBy: DisputeParty;
  context: Pick<NewDispute, "listingId" | "renter" | "owner" | "held" | "stay">;
  variant?: "outline" | "ghost";
}) {
  const { d } = useI18n();
  const x = d.disputes;
  const disputes = useDisputes();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<DisputeKind>("deposit");
  const [summary, setSummary] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [tried, setTried] = useState(false);

  const tooShort = summary.trim().length < MIN_CHARS;

  function submit() {
    setTried(true);
    if (tooShort) return;
    const id = disputes.open({ ...context, openedBy, kind, summary: summary.trim(), evidence: files });
    setOpen(false);
    toast.success(x.opened(id), { description: x.openedBody });
  }

  return (
    <>
      <Button
        variant={variant}
        className="h-9 gap-1.5 px-3"
        onClick={() => {
          setKind("deposit");
          setSummary("");
          setFiles([]);
          setTried(false);
          setOpen(true);
        }}
      >
        <LifeBuoy className="size-4" />
        {x.report}
      </Button>

      <Dialog open={open} onOpenChange={setOpen} title={x.title} description={x.sub} closeLabel={x.close}>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {x.kind}
            <select value={kind} onChange={(e) => setKind(e.target.value as DisputeKind)} className="h-10 rounded-lg border border-input bg-transparent px-2 text-sm font-normal">
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {d.admin.disputes.kind[k]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold">
            {x.summary}
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={5}
              maxLength={2000}
              aria-invalid={tried && tooShort}
              className="rounded-xl border border-input bg-transparent px-3 py-2 text-sm font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <span className={tried && tooShort ? "text-xs font-medium text-destructive" : "text-xs font-normal text-muted-foreground"}>
              {x.summaryHint(MIN_CHARS)}
            </span>
          </label>

          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1 text-sm font-semibold">
              {x.evidence}
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                disabled={files.length >= MAX_FILES}
                onChange={(e) => {
                  const picked = Array.from(e.target.files ?? []).map((f) => f.name);
                  setFiles((list) => [...new Set([...list, ...picked])].slice(0, MAX_FILES));
                  e.target.value = "";
                }}
                className="text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
              />
              <span className="text-xs font-normal text-muted-foreground">{x.evidenceHint}</span>
            </label>
            {files.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {files.map((name) => (
                  <li key={name} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs" lang="en">
                    {name}
                    <button type="button" aria-label={x.removeFile(name)} onClick={() => setFiles((l) => l.filter((n) => n !== name))} className="rounded-full p-0.5 hover:bg-background">
                      <X className="size-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="h-10 px-4" onClick={() => setOpen(false)}>
              {x.cancel}
            </Button>
            <Button className="h-10 px-4" onClick={submit}>
              {x.submit}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
