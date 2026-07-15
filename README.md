# G.Adu Motors

Full-stack storefront for **G.Adu Motors** — a Japanese &amp; Korean auto spare parts dealer
in Suame, Kumasi, Ghana. Customers browse a live inventory, negotiate a price per part, and
pay instantly by MTN Mobile Money, Telecel Cash, AT Money or card via Paystack. Admins manage
the inventory and watch orders land in real time.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) + [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) — Postgres, Auth, Row Level Security, Storage, Realtime
- [Paystack Inline JS](https://paystack.com/docs/payments/accept-payments/#popup) — GHS, card + mobile money
- [Tailwind CSS v4](https://tailwindcss.com/), [Motion](https://motion.dev/), [lucide-react](https://lucide.dev/)

## How the pieces fit together

- **`profiles`** — one row per auth user, `role` is `'admin' | 'customer'`. Created
  automatically by a database trigger on signup; nobody can self-promote to admin.
- **`products`** — the catalog. `floor_price` is never sent to the browser for
  non-admins: the public site reads from the `public_products` view (no `floor_price`
  column at all), and offers are checked server-side in `app/api/negotiate`.
- **`orders`** — captures `buyer_name`, `buyer_phone`, `momo_network`, `fulfillment_type`
  (`pickup` | `delivery`), `is_in_kumasi` and `delivery_address` (collected in the
  Purchase Details modal right before checkout), `amount_paid` and `paystack_reference`.
  Written only by the server, only after independently re-verifying the transaction
  against Paystack's API (`app/api/verify-payment`). The client's own claim of "payment
  succeeded" is never trusted directly — this prevents a customer from spoofing a paid
  order. Customers outside Kumasi never reach checkout at all — they're routed straight
  to WhatsApp (`utils/whatsapp.ts`) to arrange inter-city delivery instead.
- **Storage** — product images live in the public `spare-parts` bucket; admins upload
  through the Add New Part form, and deleting a part also removes its file from Storage.
- **Realtime** — the admin dashboard subscribes to `postgres_changes` on `orders`
  (`components/AdminOrderAlerts.tsx`) and flashes a gold-bordered banner the instant a
  row is inserted, no refresh needed.

## Setup

### 1. Create a Supabase project

At [supabase.com](https://supabase.com), create a project, then open
**SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql)
and run it. Optionally also run [`supabase/seed.sql`](supabase/seed.sql) to seed 8 sample parts.

Grab your credentials from **Project Settings → API**:
- Project URL
- `anon` `public` key
- `service_role` `secret` key (server-only — never exposed to the browser)

### 2. Create a Paystack account

At [paystack.com](https://paystack.com), grab your test keys from
**Settings → API Keys & Webhooks**: `pk_test_...` and `sk_test_...`.
Mobile money payouts in Ghana require your Paystack account to be verified for GHS.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the five values (Supabase URL/anon/service-role, Paystack public/secret keys).

### 4. Install and run

```bash
npm install
npm run dev      # http://localhost:3000
```

### 5. Promote yourself to admin

Sign up for an account in the app, then in the Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Log out and back in — the header will now show **Admin Dashboard**.

## Other scripts

```bash
npm run build    # production build
npm run start    # run the production build
npm run lint     # type-check with tsc
```

## Business details

| | |
|---|---|
| **Location** | Suame, Kumasi, Ghana |
| **Phone** | 024 121 5083 |
| **Email** | gadumotors2014@gmail.com |
| **Specialty** | Retail & supply of car spare parts for Japanese and Korean automotive brands |

### Opening hours

| Day | Hours |
|---|---|
| Monday | 8:30 AM – 5:30 PM |
| Tuesday – Friday | 8:00 AM – 5:30 PM |
| Saturday | 9:00 AM – 4:00 PM |
| Sunday | Closed |

## Project structure

```
app/
  page.tsx              Home page (Server Component, fetches public_products)
  layout.tsx             Global chrome: Header, Footer, Paystack <Script>
  login/, signup/         Auth pages
  admin/                  Protected admin dashboard (role-gated client-side)
  api/negotiate/           Server-side floor-price comparison
  api/verify-payment/      Server-side Paystack verification + orders insert
components/               UI components (customer + admin)
utils/
  supabaseClient.ts        Anon-key client (browser + server-safe)
  supabaseAdmin.ts          Service-role client (route handlers only)
  paystack.ts               Inline popup helper
  data.ts                   Static business info (hours, contact, brands)
types/                     Shared TypeScript types
supabase/
  schema.sql                Tables, RLS policies, triggers, storage bucket
  seed.sql                   Optional sample inventory
```
