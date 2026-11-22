# Nest

Flexible residential rentals in Cambodia, from a few days to a few months. Renters find, compare and book verified homes; owners list, manage availability and track income; Nest staff verify listings and handle trust and safety.

> **This is a front-end prototype.** There is no database, login or payment provider yet. All data is sample data in `src/features/*/data.ts`, and anything a person does in the app (saved homes, booking requests, reviews, disputes, moderation decisions) is kept in that browser's `localStorage`. See [What is real and what is sample](#what-is-real-and-what-is-sample).

## Run it

Requires Node 20+ and [pnpm](https://pnpm.io) 9.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm lint
pnpm test       # pricing, availability and search-parameter tests
```

This project uses a newer Next.js (16) than most documentation online. Before changing framework-level code, read the matching guide in `node_modules/next/dist/docs/` (see `AGENTS.md`).

### Environment variables

All optional.

| Variable | What it does |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin used for metadata, the sitemap and robots.txt. Set it in production. Defaults to `http://localhost:3000`. |
| `KHR_PER_USD` | Pins the riel-per-dollar rate used to show prices in KHR. If unset, the rate comes from a free market feed (cached 12 hours) and falls back to 4,100. |
| `NEXT_PUBLIC_MAP_TILE_URL`, `NEXT_PUBLIC_MAP_ATTRIBUTION` | Map tiles. Defaults to public OpenStreetMap, which is only meant for light use. Use a tile provider before launch. |
| `MAINTENANCE_MODE` | Set to `true` to serve the maintenance page (HTTP 503) for every page. |
| `MAINTENANCE_RETRY_AFTER` | Seconds for the `Retry-After` header during maintenance. Defaults to 1800. |

## What is in it

**Renters** (`/`, `/listing`, `/compare`, `/booking`, `/renter`, `/messages`)
- Search with filters kept in the URL: city, district, move-in date, stay length, type, budget, bedrooms, bills included, fully verified, furnished and guest rating, pets allowed, step-free access and quiet street. Sort by price, availability or rating. List and map views.
- Compare homes side by side and share a comparison by link. Save homes, see recently viewed homes, and share a listing by Telegram, WhatsApp, Line or link. Request viewings.
- A "Good to know" section on each listing: pets, step-free access, noise, flooding and power cuts (reported by the owner).
- Messages warn before a phone number, link or chat handle is sent, because payments made off Nest aren't protected.
- Book for any length of stay, with a transparent quote. Renters pay no Nest fees.
- Review a finished stay (overall score plus accuracy, cleanliness, communication). Report a review.
- Open a dispute from a stay, then follow staff replies and add messages or evidence.

**Owners** (`/host`, `/host/new`, `/host/calendar`, `/earning`, `/owners`)
- Dashboard with booking requests, extension requests (approve or decline), viewings, earnings and a placement-fee calculator.
- A progress tracker for each listing's verification.
- Listing wizard. Enter prices in dollars or riel.
- Availability calendar.
- Reply publicly to reviews. Upload a rejected verification document again. Open or follow a dispute.

**Staff** (`/admin`)
- Host applications, listing verification (documents plus an in-person visit), bookings and users.
- **Verification documents:** each file shows its type, size and scheduled deletion date. Opening one is written to the audit log first. Documents can be approved, rejected with a reason, or deleted.
- **Disputes:** cases with money held by Nest, evidence, a 72-hour first-reply timer, internal notes, and outcomes (full or partial refund, release to the owner, dismiss).
- **Reviews:** moderation queue for new and reported reviews.
- **Audit log:** append-only record of every staff action, filterable by category, search and date range, with per-record history, CSV export and a warning when one person opens many private documents in an hour.

**Everywhere**
- English and Khmer (`src/i18n/dictionaries`). Every user-facing string lives there.
- USD and KHR display toggle. Prices are stored and charged in USD. Riel is a display conversion rounded to the nearest 100៛.
- Light, dark and system themes. Responsive down to phone width.

## What is real and what is sample

| Area | Today | Needs a backend for |
| --- | --- | --- |
| Accounts | A hardcoded demo user (`src/features/account/current-user.ts`). `/admin`, `/host` and `/renter` have no access control. | Sign-in, roles, staff permissions. |
| Listings, bookings, users | Static sample data. | Real records, availability, search. |
| Reviews, disputes, document status, audit entries | Sample data plus changes saved in the browser's `localStorage`, shared by the renter, owner and admin pages of the same browser. | Sharing between people and devices, an insert-only audit table, notifications. |
| Uploaded files (evidence, ID documents) | Only file names and sizes are kept. Nothing is uploaded or stored. | Private storage with signed URLs and automatic deletion. |
| Payments | Not built. The checkout and payment pages describe the flow. | KHQR or ABA payments, escrow, refunds, payouts. |
| Exchange rate | Live from a free feed, with a fixed fallback. | A daily official rate if you want one. |

To reset the demo, clear this site's data in the browser (the `nest.*` keys in `localStorage`).

## How the code is organised

```
src/app/            routes (App Router)
src/features/       one folder per area: listings, booking, stays, reviews, disputes,
                    owner, renter, admin, compare, messaging, viewings, support, account
src/i18n/           dictionaries (en, km), formatting, currency and exchange rate
src/shared/         layout, ui components, small libraries (including the persisted store)
```

- Prices are USD everywhere in code. Use `money()` from `useI18n()` (client) or `getI18n()` (server) to display them, never format currency by hand.
- Data that several screens share and that people change (reviews, disputes, verification) goes through `createPersistedStore` in `src/shared/lib/persisted-store.ts`. Swapping it for server calls is the intended path to a real backend.
- Staff actions call `useAudit().log(...)`. New actions are added in `src/features/admin/audit.tsx` and labelled in both dictionaries.

## Docs

`docs/pitch.txt` is the program application: the problem, the solution, the business model and progress.
