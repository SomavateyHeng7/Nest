"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, Check, FileText, ImagePlus, Minus, Plus, ShieldCheck, UserCheck } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { dictionaries } from "@/i18n";
import { useI18n } from "@/i18n/client";
import { areas, propertyTypes } from "@/features/listings/lib/destinations";
import { formatUSD, placementFeeTiers } from "@/features/stays/lib/pricing";
import { cn } from "@/shared/lib/utils";
import type { PropertyType } from "@/features/listings/types";

const amenityOptions = [
  "Wifi", "Air conditioning", "Kitchen", "Washer", "Workspace", "Pool", "Gym",
  "Free parking", "Motorbike parking", "Elevator", "24h security", "Balcony", "Garden", "Pet friendly",
];

const billOptions = ["Wifi", "Water", "Electricity", "Cleaning", "Trash collection"];

function Counter({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  const { d } = useI18n();
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <span className="flex items-center gap-3">
        <button type="button" aria-label={d.wizard.fewer(label)} disabled={value <= min} onClick={() => onChange(value - 1)} className="grid size-8 place-items-center rounded-full border border-input disabled:opacity-40">
          <Minus className="size-3.5" />
        </button>
        <span className="w-5 text-center font-semibold tabular">{value}</span>
        <button type="button" aria-label={d.wizard.more(label)} onClick={() => onChange(value + 1)} className="grid size-8 place-items-center rounded-full border border-input">
          <Plus className="size-3.5" />
        </button>
      </span>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        active ? "border-dark-forest bg-dark-forest text-background" : "border-border bg-card hover:border-foreground/30"
      )}
    >
      {children}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

type WriteLang = "en" | "km";

/**
 * One field written in English (required) and optionally Khmer. Tabs switch
 * which language is being edited; a dot marks the languages that are filled.
 */
function BilingualField({
  label,
  hint,
  value,
  onChange,
  placeholders,
  multiline = false,
}: {
  label: string;
  hint?: string;
  value: Record<WriteLang, string>;
  onChange: (value: Record<WriteLang, string>) => void;
  placeholders: Record<WriteLang, string>;
  multiline?: boolean;
}) {
  const { d } = useI18n();
  const w = d.wizard;
  const [lang, setLang] = useState<WriteLang>("en");
  const inputClass =
    "w-full rounded-lg border border-input bg-card px-3 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <div role="tablist" aria-label={w.writeIn} className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
          {(["en", "km"] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={lang === l}
              onClick={() => setLang(l)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                lang === l ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                aria-hidden
                className={cn("size-1.5 rounded-full", value[l].trim() ? "bg-success" : "bg-muted-foreground/30")}
              />
              {l === "en" ? w.langEnglish : w.langKhmer}
              <span className="text-[10px] text-muted-foreground">{l === "en" ? w.required : w.optional}</span>
            </button>
          ))}
        </div>
      </div>
      {multiline ? (
        <textarea
          key={lang}
          lang={lang}
          rows={5}
          value={value[lang]}
          onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
          placeholder={placeholders[lang]}
          className={cn(inputClass, "py-2.5")}
        />
      ) : (
        <input
          key={lang}
          lang={lang}
          value={value[lang]}
          onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
          placeholder={placeholders[lang]}
          className={cn(inputClass, "h-11")}
        />
      )}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

function MoneyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex h-11 items-center rounded-lg border border-input bg-card px-3 focus-within:ring-3 focus-within:ring-ring/50">
      <span className="text-muted-foreground">$</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent px-1.5 text-base font-semibold outline-none tabular"
      />
    </div>
  );
}

export function ListingWizard() {
  const { d, t } = useI18n();
  const w = d.wizard;
  const steps = w.steps;
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const [type, setType] = useState<PropertyType>("condo");
  const [city, setCity] = useState("Phnom Penh");
  const [district, setDistrict] = useState("BKK1");
  const [title, setTitle] = useState<Record<WriteLang, string>>({ en: "", km: "" });
  const [description, setDescription] = useState<Record<WriteLang, string>>({ en: "", km: "" });
  const [bedrooms, setBedrooms] = useState(1);
  const [baths, setBaths] = useState(1);
  const [size, setSize] = useState(50);
  const [furnished, setFurnished] = useState(true);
  const [amenities, setAmenities] = useState<string[]>(["Wifi", "Air conditioning"]);
  const [photos, setPhotos] = useState(0);
  const [nightly, setNightly] = useState(35);
  const [weekly, setWeekly] = useState(200);
  const [monthly, setMonthly] = useState(600);
  const [deposit, setDeposit] = useState(600);
  const [minNights, setMinNights] = useState(7);
  const [maxMonths, setMaxMonths] = useState(12);
  const [bills, setBills] = useState<string[]>(["Wifi", "Water"]);
  const [docs, setDocs] = useState({ id: false, ownership: false });
  const [visit, setVisit] = useState("");

  const toggleIn = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const districts = areas.find((a) => a.city === city)?.districts ?? [];

  const canContinue = [
    Boolean(title.en.trim()),
    size > 0,
    photos >= 5,
    monthly > 0 && nightly > 0,
    docs.id && docs.ownership && Boolean(visit),
  ][step];

  if (done) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-accent text-primary-sage">
          <Check className="size-7" />
        </span>
        <h2 className="font-heading text-3xl font-semibold text-dark-forest">{w.doneTitle}</h2>
        <p className="text-muted-foreground">{w.doneBody(visit)}</p>
        <div className="mt-2 flex gap-3">
          <Button className="h-10 px-4" nativeButton={false} render={<Link href="/host" />}>
            {w.toDashboard}
          </Button>
          <Button variant="outline" className="h-10 px-4" nativeButton={false} render={<Link href="/host/calendar" />}>
            {w.setAvailability}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <ol className="flex gap-2 overflow-x-auto scrollbar-none lg:flex-col">
        {steps.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => setStep(i)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                i === step ? "bg-card text-foreground ring-1 ring-border" : "text-muted-foreground",
                i < step && "hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full text-xs",
                  i < step ? "bg-primary-sage text-white" : i === step ? "bg-dark-forest text-background" : "bg-muted"
                )}
              >
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </span>
              {s}
            </button>
          </li>
        ))}
      </ol>

      <div className="max-w-2xl">
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-dark-forest">{w.whatTitle}</h2>
              <p className="text-sm text-muted-foreground">{w.whatSub}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((pt) => (
                <Pill key={pt} active={type === pt} onClick={() => setType(pt)}>
                  {d.propertyType[pt]}
                </Pill>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={w.city}>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setDistrict(areas.find((a) => a.city === e.target.value)?.districts[0] ?? "");
                  }}
                  className="h-11 rounded-lg border border-input bg-card px-3 text-sm"
                >
                  {areas.map((a) => (
                    <option key={a.city} value={a.city}>
                      {t(a.city)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={w.area}>
                <select value={district} onChange={(e) => setDistrict(e.target.value)} className="h-11 rounded-lg border border-input bg-card px-3 text-sm">
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {t(dist)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <BilingualField
              label={w.listingTitle}
              hint={w.listingTitleHint}
              value={title}
              onChange={setTitle}
              placeholders={{ en: w.titlePlaceholder(dictionaries.en.propertyType[type], district), km: w.titlePlaceholderKm }}
            />
            <BilingualField
              label={w.description}
              hint={w.bilingualHint}
              value={description}
              onChange={setDescription}
              placeholders={{ en: w.descriptionPlaceholder, km: w.descriptionPlaceholderKm }}
              multiline
            />
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <h2 className="font-heading text-2xl font-semibold text-dark-forest">{w.basics}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Counter label={w.bedrooms} value={bedrooms} onChange={setBedrooms} />
              <Counter label={w.bathrooms} value={baths} onChange={setBaths} min={1} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={w.size}>
                <Input type="number" min={1} value={size} onChange={(e) => setSize(Number(e.target.value))} className="h-11 bg-card" />
              </Field>
              <Field label={w.furnishing}>
                <div className="flex gap-2">
                  <Pill active={furnished} onClick={() => setFurnished(true)}>{w.furnished}</Pill>
                  <Pill active={!furnished} onClick={() => setFurnished(false)}>{w.unfurnished}</Pill>
                </div>
              </Field>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">{w.amenities}</span>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map((a) => (
                  <Pill key={a} active={amenities.includes(a)} onClick={() => toggleIn(amenities, setAmenities, a)}>
                    {t(a)}
                  </Pill>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-dark-forest">{w.photosTitle}</h2>
              <p className="text-sm text-muted-foreground">{w.photosSub}</p>
            </div>
            <button
              type="button"
              onClick={() => setPhotos((p) => Math.min(12, p + 3))}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-12 text-center hover:border-primary-sage/60"
            >
              <ImagePlus className="size-8 text-primary-sage" />
              <span className="font-medium">{w.drop}</span>
              <span className="text-xs text-muted-foreground">{w.dropHint}</span>
            </button>
            {photos > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {Array.from({ length: photos }).map((_, i) => (
                  <div key={i} className="relative aspect-4/3 rounded-xl bg-[linear-gradient(135deg,var(--accent),var(--muted))]">
                    {i === 0 && (
                      <span className="absolute top-2 left-2 rounded-full bg-background px-2 py-0.5 text-[11px] font-semibold">{w.cover}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground tabular">{w.photoCount(photos)}</p>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-dark-forest">{w.pricingTitle}</h2>
              <p className="text-sm text-muted-foreground">{w.pricingSub}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={w.perNight} hint={w.under1w}><MoneyInput value={nightly} onChange={setNightly} /></Field>
              <Field label={w.perWeek} hint={w.w13}><MoneyInput value={weekly} onChange={setWeekly} /></Field>
              <Field label={w.perMonth} hint={w.m1plus}><MoneyInput value={monthly} onChange={setMonthly} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={w.deposit}><MoneyInput value={deposit} onChange={setDeposit} /></Field>
              <Field label={w.minNights}>
                <Input type="number" min={1} value={minNights} onChange={(e) => setMinNights(Number(e.target.value))} className="h-11 bg-card" />
              </Field>
              <Field label={w.maxMonths}>
                <Input type="number" min={1} max={12} value={maxMonths} onChange={(e) => setMaxMonths(Number(e.target.value))} className="h-11 bg-card" />
              </Field>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">{w.included}</span>
              <div className="flex flex-wrap gap-2">
                {billOptions.map((b) => (
                  <Pill key={b} active={bills.includes(b)} onClick={() => toggleIn(bills, setBills, b)}>
                    {t(b)}
                  </Pill>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-accent/50 p-5">
              <p className="text-sm font-semibold">{w.feeTitle}</p>
              <p className="text-xs text-muted-foreground">{w.feeSub}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {placementFeeTiers.map((tier) => (
                  <div key={tier.minMonths} className="rounded-xl bg-card px-3.5 py-3">
                    <p className="text-xs text-muted-foreground">{d.income.tierStay(d.fees.tierLabel(tier.minMonths, tier.maxMonths))}</p>
                    <p className="font-semibold tabular">{formatUSD(monthly * tier.rate)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-dark-forest">{w.verifyTitle}</h2>
              <p className="text-sm text-muted-foreground">{w.verifySub}</p>
            </div>
            {[
              { key: "id" as const, icon: UserCheck, title: w.docId, body: w.docIdBody },
              { key: "ownership" as const, icon: FileText, title: w.docOwnership, body: w.docOwnershipBody },
            ].map(({ key, icon: Icon, title: t, body }) => (
              <div key={key} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                <Icon className="size-6 shrink-0 text-primary-sage" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t}</p>
                  <p className="text-xs text-muted-foreground">{body}</p>
                </div>
                {docs[key] ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-success">
                    <Check className="size-4" /> {d.common.uploaded}
                  </span>
                ) : (
                  <Button variant="outline" className="h-9 px-3" onClick={() => setDocs((d) => ({ ...d, [key]: true }))}>
                    {d.common.upload}
                  </Button>
                )}
              </div>
            ))}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-4">
                <CalendarCheck className="size-6 shrink-0 text-primary-sage" />
                <div>
                  <p className="text-sm font-semibold">{w.visitTitle}</p>
                  <p className="text-xs text-muted-foreground">{w.visitBody}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {w.slots.map((slot) => (
                  <Pill key={slot} active={visit === slot} onClick={() => setVisit(slot)}>
                    {slot}
                  </Pill>
                ))}
              </div>
            </div>
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary-sage" />
              {w.freeNote}
            </p>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" className="h-10 px-4" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            {d.common.back}
          </Button>
          {step < steps.length - 1 ? (
            <Button className="h-10 px-6" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
              {d.common.continue}
            </Button>
          ) : (
            <Button className="h-10 bg-accent-terracotta px-6 text-white hover:bg-terracotta-strong" disabled={!canContinue} onClick={() => setDone(true)}>
              {w.submit}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
