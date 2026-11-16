"use client";

import { useState } from "react";
import { BadgeCheck, CircleDashed, Phone, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { adminUsers, type AdminUser, type UserRole } from "@/data/admin";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", ok ? "text-success" : "text-muted-foreground")}>
      {ok ? <BadgeCheck className="size-3.5" /> : <CircleDashed className="size-3.5" />}
      {label}
    </span>
  );
}

export function UsersTable() {
  const { d, date, relative } = useI18n();
  const u = d.admin.users;
  const tt = d.admin.toast;
  const [users, setUsers] = useState(adminUsers);
  const [role, setRole] = useState<UserRole>("owner");
  const [q, setQ] = useState("");

  const patch = (id: string, changes: Partial<AdminUser>) => setUsers((list) => list.map((x) => (x.id === id ? { ...x, ...changes } : x)));

  const needle = q.trim().toLowerCase();
  const shown = users.filter(
    (x) => x.role === role && (!needle || x.name.toLowerCase().includes(needle) || x.phone.replace(/\s/g, "").includes(needle.replace(/\s/g, "")))
  );

  function suspend(user: AdminUser) {
    patch(user.id, { status: "suspended" });
    toast.warning(tt.suspended(user.name), {
      action: { label: d.toast.undo, onClick: () => patch(user.id, { status: "active" }) },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div role="tablist" className="flex rounded-xl bg-muted p-1">
          {(["owner", "renter"] as const).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={role === r}
              onClick={() => setRole(r)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                role === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {u.tabs[r]} <span className="text-xs text-muted-foreground tabular">{users.filter((x) => x.role === r).length}</span>
            </button>
          ))}
        </div>
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={u.search}
            aria-label={u.search}
            className="h-10 w-full rounded-xl border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">{u.cols.name}</th>
              <th className="px-4 py-3 font-medium">{u.cols.verification}</th>
              <th className="px-4 py-3 font-medium">{u.cols.activity}</th>
              <th className="px-4 py-3 font-medium">{u.cols.joined}</th>
              <th className="px-4 py-3 font-medium">{u.cols.status}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {shown.map((x) => (
              <tr key={x.id} className={cn("border-b border-border last:border-0", x.status === "suspended" && "bg-destructive/[0.03]")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={x.avatarUrl} alt={x.name} />
                      <AvatarFallback>{x.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{x.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground tabular">
                        <Phone className="size-3" />
                        {x.phone}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <Check ok={x.phoneVerified} label={u.phone} />
                    <Check ok={x.idVerified} label={u.id} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p>{x.role === "owner" ? u.listings(x.count) : u.stays(x.count)}</p>
                  <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                    {u.lastActive(relative(x.lastActive))}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{date(x.joined, "MMM d, yyyy")}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold",
                      x.status === "active" ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {x.status === "active" ? u.active : u.suspended}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {!x.idVerified && (
                      <Button
                        variant="outline"
                        className="h-8 px-3"
                        onClick={() => {
                          patch(x.id, { idVerified: true });
                          toast.success(tt.idVerified(x.name));
                        }}
                      >
                        {u.verifyId}
                      </Button>
                    )}
                    {x.status === "active" ? (
                      <Button variant="ghost" className="h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => suspend(x)}>
                        {u.suspend}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="h-8 px-3"
                        onClick={() => {
                          patch(x.id, { status: "active" });
                          toast.success(tt.reactivated(x.name));
                        }}
                      >
                        {u.reactivate}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">{u.empty}</p>}
      </div>
    </div>
  );
}
