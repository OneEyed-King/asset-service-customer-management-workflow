# AssetFlow — Service Manager for RO & Appliance Service Businesses

## What it is

A multi-tenant SaaS platform for small and mid-size service businesses (RO/water purifier dealers, AC service, appliance AMC providers) to manage customers, the assets/appliances they've sold or service, technician teams, and (soon) the full service-call and payment lifecycle — replacing the spreadsheets, WhatsApp groups, and paper job cards most of these businesses run on today.

Each business signs up as its own isolated tenant. Within a tenant, an **Owner** manages billing and the team; **Admins** get full visibility into customers, assets, and sales; **Technicians** see only their assigned jobs and the customer/asset info needed to do them.

The core workflow: add a customer, record what you sold or serviced for them as an asset (RO unit, AC, etc.) with its warranty and service-interval info, and manage your team's access to that data by role — with service-call scheduling, payments, and self-serve signup on the roadmap next.

## Pricing

Flat monthly seat pricing, no per-feature add-on fees:

| Plan | Team members | Price |
|---|---|---|
| Small | 1–2 | ₹499/mo |
| Growing | 5–10 | ₹1,499/mo |
| Multi-branch | 20+ | ₹4,999/mo |
| Enterprise | Custom | Custom |

The Owner counts as one seat and freely allocates the rest between Admins and Technicians — no separate "admin seat" vs "technician seat" SKUs to manage.

## Competitive landscape

This is a real, active market in India — not a gap nobody's building for. The main players:

- **ServeWell CRM** — the closest direct competitor (RO/AMC-specific, 500+ customers, 5+ years in market). Priced ₹540–₹1,125/month *equivalent*, but billed as a single **annual** payment, not monthly — and the base price only covers the core CRM. Features many businesses would consider standard (WhatsApp service alerts, customer feedback collection, service photo upload, multi-technician call assignment, corporate bulk-AMC handling) are separate **paid add-ons**, each billed and tracked individually. User count is capped at 35 regardless of plan.
- **Service CRM India** — similar AMC/RO feature set, claims 10,000+ clients; pricing isn't published, sold through direct sales contact.
- **TrackoField / Fieldproxy** — broader field-service/workforce-tracking tools (GPS tracking, general dispatch), not built around the RO/AMC service-and-spares workflow specifically; pricing is quote-based or flat per-organization regardless of industry fit.

## Our edge

1. **Transparent, predictable pricing** — one flat monthly number per plan, billed monthly (not an annual-only lock-in), no per-add-on nickel-and-diming for things like WhatsApp alerts or photo uploads.
2. **Seat-based, not artificially capped** — team size scales with the plan instead of hitting a hard 35-user ceiling regardless of what you're paying.
3. **Multi-tenant from day one** — the data model was built with real tenant isolation from the start, not bolted onto a single-business system later. That's a foundation competitors built years before multi-tenancy mattered to them.
4. **Purpose-built workflow, not generic field service** — the customer→asset→service link is core to the data model, matching how an RO/AMC business actually thinks about a job, rather than a generic multi-industry field-service tool retrofitted with an RO label.
5. **Modern, fast web app** — React/TypeScript frontend, not the older PHP-era admin panels most incumbents in this space are still running.

The honest caveat: ServeWell in particular has a five-year head start, hundreds of customers, and a much deeper feature set (spares tracking, GPS, HR, quotations, WhatsApp/email automation, corporate AMC handling) that this product doesn't have yet. The bet is that pricing transparency, a cleaner core workflow, and a modern stack are enough of a wedge to compete on — not that we out-feature them on day one.
