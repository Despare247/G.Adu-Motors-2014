# Handoff: G. Adu Motors Shop

## Overview
An autoparts e-commerce prototype for G. Adu Motors (Suame Magazine, Kumasi): storefront (3 layout variants), fit-finder, search results, product detail, cart/checkout (MoMo/card/COD/pay-at-shop), order tracking, buyer-seller chat, and a seller/admin dashboard with stock management and price negotiation.

## About the Design Files
The file in this bundle is a **design reference built in HTML** — a working prototype showing intended look, content and interaction, not production code to copy directly. The task is to **recreate this design in your codebase's environment** (React, Vue, etc.) using its existing patterns and libraries, or to choose an appropriate framework if none exists yet.

It is a single component file (`G.Adu Motors Shop.dc.html`) that switches between 8 "screens" via local state — there is no routing, and there is no backend (all data is hardcoded in a `CATALOG` array and in-memory state).

## Fidelity
**High-fidelity.** Colors, type, spacing and component styling are final and should be recreated pixel-for-pixel using the design tokens below. Copy text is final. Interactions (negotiation flow, cart, chat auto-replies) are illustrative of desired behavior, not final business logic — treat quantities like stock levels, ratings, and reply times as placeholder data.

## Design system: this IS already the target UI
This file is already built on the **Modernist** design system (flat, architectural, Archivo type, red-on-white accent, 2px rules, zero corner radius, no shadows on flat surfaces). If you're converting an *older* version of this UI (pre-dating this design system), the migration is:

1. Copy `design-system/styles.css` into your codebase and link it. It defines all tokens as CSS variables (`--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`) and a component layer (`.btn`, `.field`/`.input`, `.card`, `.tag`, `.table`, `.radio`, `.seg`, `.nav`, `.dialog`, `.hr`).
2. Replace any hardcoded hex colors, font names or px spacing in the old UI with the matching `var(--color-*)` / `var(--font-*)` / `var(--space-*)` token — never reintroduce a literal value the tokens already cover.
3. Swap hand-rolled buttons/inputs/tables/tags/cards for the classes above rather than restyling raw elements — view the markup in `G.Adu Motors Shop.dc.html` for exact class usage per component.
4. Un-round every corner (`--radius-md` is `0` by design), remove drop shadows from flat surfaces, and set body text to `var(--font-body)` / headings to `var(--font-heading)` (both resolve to Archivo).
5. Flush-left everything — button labels, hero copy, headings — nothing is centered in this system.
6. Reference `design-system/modernist-readme.md` for the full rationale and do/don't list.

## Screens
1. **Top nav strip** — prototype-only screen switcher + low-data mode toggle (not part of the real product; strip this in production).
2. **Home** — 3 layout variants (A: split fitment counter + grid; B: full-bleed poster hero with embedded fit-finder, stats row, category grid, product grid — the recommended default; C: dense reseller ledger with per-row negotiation).
3. **Fit finder** — 3 parallel routes to the same result set: Make/Model/Year/Part picker, Chassis/VIN decoder, photo lookup.
4. **Results** — left filter rail (condition, yard, rating) + list rows, each with an inline negotiation bar capped at a floor price.
5. **PDP (product detail)** — image + spec table + fitment confirmation banner, sticky buy box with negotiation, seller card, delivery/pickup/warranty/payment summary.
6. **Cart / checkout** — line items with per-item negotiation, fulfilment choice (rider vs. pickup), payment method (MoMo/card/COD/pay-at-shop), sticky order summary.
7. **Order tracking** — step timeline, rider card, WhatsApp deep link, "confirm fit & release payment" action.
8. **Chat** — buyer/seller thread with photo-quote card and accept-to-cart flow.
9. **Admin/seller dashboard** — KPI row, Add-Part form (photo drop, fitment picker, condition, SKU auto-suggest, qty, yard, warranty, price + negotiation floor), orders table, low-stock table, rating breakdown.

## Layout & Components
All spacing, type and color values come from the Modernist token sheet (`design-system/styles.css`) — do not hardcode. Key patterns used throughout:
- Grids via CSS Grid with explicit `grid-template-columns`, not floated/inline layout.
- 1–2px solid dividers (`var(--color-divider)` or `var(--color-text)`) between every major region — no soft shadows for separation.
- `.tag` variants for condition labels (New OEM / Used JP / Aftermarket / Refurbished).
- `.table` for all tabular data (ledger, orders, low-stock, spec sheet).
- Negotiation UI is a repeated pattern: label "Negotiate · floor {value}" + numeric input clamped to `[floor, listPrice]` + "Send offer" button — appears on results rows, PDP, cart rows, and the admin ledger.

## Interactions & Behavior
- **Negotiation**: floor = list price × a configurable percentage (default 80%, tweakable via `negotiationFloorPct` prop, range 50–95%). Sending an offer posts it into the Chat screen; if the offer is at/below the floor the (simulated) seller auto-accepts after ~900ms, otherwise it says it will check.
- **Cart**: add/remove items; subtotal, delivery fee (GH₵ 35 for rider, free for pickup), VAT-inclusive total computed live.
- **Checkout**: 4 payment methods change the CTA label and, for MoMo, reveal a phone-number confirmation panel.
- **Place order**: navigates to Tracking screen and shows a toast for 5s.
- **Chat**: typed messages get a canned "checking Lane 3" reply after ~900ms; accepting a quote card adds that part to cart and jumps to Cart.
- **Admin — Add Part**: two-column form; Make is free text, Model/Year are selects populated from a `MODELS_BY_MAKE` map keyed on Make; SKU auto-suggests from category+make+model+year but is manually overridable; saving appends to an in-memory `customParts` list and shows a toast for 2.6s.
- **Low-data mode**: toggle in the prototype strip hides the hero photograph and shows a text placeholder instead (bandwidth-conscious pattern worth keeping in production).
- **Responsive**: below 860px, the desktop nav/search collapses and 2-column grids drop to 1 column (see `@media (max-width:860px)` in the file's `<style>`).

## State Management
Everything lives in one component's local state — no external store. For a production rebuild, model at minimum:
- Current screen/route
- Selected vehicle fitment (make, model, year, part filter)
- Cart (list of part IDs + any per-item negotiated price)
- Per-part negotiation offer values (keyed by part ID)
- Checkout selections (fulfilment method, payment method)
- Chat thread messages
- Admin: add-part form fields, saved custom parts, toast state

Data needing a real backend: the parts catalogue, stock levels, orders, seller ratings, chat threads, and order tracking status — all hardcoded/simulated here.

## Design Tokens
Pull exact values from `design-system/styles.css` `:root` block rather than the summary below — this is the quick reference:
- **Color**: ground `--color-bg` (#f3f2f2), ink `--color-text` (#201e1d), single accent `--color-accent` (#ec3013), plus 100–900 tonal ramps for neutral/accent.
- **Type**: `--font-heading` and `--font-body` both resolve to Archivo.
- **Radius**: `--radius-md` = 0 everywhere — no rounded corners.
- **Rules**: 2px solid dividers (`var(--color-divider)`), not hairlines.
- **Shadows**: `--shadow-sm/md/lg`, used sparingly (hover elevation on cards only).

## Assets
- `assets/gadu-poster.jpg` (referenced as `assets/gadu-poster.jpg` in the source, not included in this bundle — supply your own yard/shop photograph) — used in the Home B hero and the finder-screen header logo crop.
- Icons are inline Lucide-style SVGs (stroke icons), matching the design system's icon guidance — recreate with the Lucide icon set in production.
- Photo upload slots (Add Part form) use a drag-and-drop placeholder component (`image-slot.js`) — replace with your real upload widget.

## Files in this bundle
- `G.Adu Motors Shop.dc.html` — the full prototype (markup + state/logic in one file).
- `image-slot.js` — the drag-and-drop photo placeholder component used in the Add Part form.
- `support.js` — runtime shim required only to preview/run the `.dc.html` file in this authoring tool; **do not port this into your app** — it has no equivalent in a real codebase.
- `design-system/styles.css` — the Modernist design system: all color/type/spacing tokens plus the component CSS layer (`.btn`, `.field`, `.table`, `.tag`, `.card`, `.radio`, `.seg`, `.nav`, `.dialog`, `.hr`).
- `design-system/_ds_bundle.js` — pre-built Modernist UI components (only usable inside this authoring tool's runtime — treat as reference markup, don't import into a real app).
- `design-system/modernist-readme.md` — full design system guide (direction, do/don't, color/type rationale).

## Adding to a GitHub repo
Unzip this folder into your repo (e.g. `design/gadu-motors-handoff/`) and commit it as-is — it's reference material, not a build artifact. If you want the prototype itself viewable outside this tool, ask for a self-contained standalone HTML export before pulling it in.
