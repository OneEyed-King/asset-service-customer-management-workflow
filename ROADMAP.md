# AssetFlow — Feature Roadmap

A working list of everything a service-business CRM like this plausibly needs, organized by how much it affects revenue and day-to-day operation rather than how easy it is to build. Meant as a discussion draft — priorities, phases, and scope on anything here are all open to change.

## Already built

Auth (JWT, multi-tenant), Customers (CRUD, search), Assets (CRUD, AMC-optional service tracking, purchase/install date validation), Team Members (roles, seat limits), Service History (completed / not-completed outcomes), a Services hub (due & overdue list with inline logging, full visit log), a real Dashboard (headline counts, due list, recent activity), and backend-only tenant/user provisioning for onboarding new businesses.

Not built yet, but already decided: Razorpay/payment gateway (deferred — manual fee collection for now), a frontend signup UI (backend API only, by design).

---

## Phase 1 — Revenue & money tracking

The app currently tracks *what* was serviced but not *what was billed or collected* beyond a single paid/partial/unpaid flag on the asset. That's the biggest gap between "CRM" and "the thing that actually runs the business."

- **AMC as a real contract, not just a checkbox.** Right now `underAmc` is a boolean. A proper AMC needs a start date, end date, price, number of visits included, and a renewal reminder before it lapses — otherwise "under AMC" quietly becomes meaningless once the year is up.
- **Invoicing.** Generate a bill per service visit or AMC renewal — line items, amount, tax, a shareable PDF/link. This is the single feature most directly tied to getting paid faster.
- **Payment ledger.** A real running balance per customer (amount owed, amount paid, payment history) instead of a static status flag on each asset. Needed before Razorpay integration means anything.
- **Quotations/estimates.** For jobs where the customer needs a price before agreeing (a new install, an expensive repair) — send an estimate, convert it to an invoice once approved.
- **GST-compliant invoices.** If any customers are businesses, or you want to look professional to individual customers, proper GST fields (business GSTIN, tax breakdown) matter for India specifically.

## Phase 2 — Communication & reminders

You flagged this yourself: a service CRM that doesn't remind anyone about anything is missing its main point.

- **Due-service reminders to customers** — SMS/WhatsApp/email a few days before (and on) the due date. WhatsApp Business API is probably the highest-value channel for Indian SMB customers specifically.
- **AMC renewal reminders** — separate from service-due reminders; "your AMC is expiring in 15 days" is a distinct, revenue-driving message.
- **Internal job alerts** — notify a technician when they're assigned a job, not just record it after the fact.
- **Notification preferences** — per-customer opt in/out, per-channel (some customers want SMS, not WhatsApp).

## Phase 3 — Field operations (scheduling & technicians)

Today, a "service visit" only exists in the system after it's already happened — there's no concept of scheduling or assigning work in advance.

- **Job scheduling.** Turn a due service into an actual assigned job: pick a technician, a date/time.
- **Job status lifecycle** — assigned → in progress → completed/not completed, instead of just an after-the-fact log entry.
- **Technician's daily view** — "what am I doing today," ideally usable from a phone.
- **Proof of service** — photo upload (before/after), maybe a customer signature or OTP confirmation, useful for AMC contract disputes.
- **Spare parts used per job** — ties into Phase 5's inventory tracking; also useful for costing a job accurately.

## Phase 4 — Reporting & business visibility

Once money and jobs are properly tracked, reporting becomes possible and valuable.

- **Revenue reports** — monthly/yearly, by technician, by service type.
- **AMC renewal pipeline** — who's expiring soon, so you can chase renewals before they lapse (this is basically a sales report, not just an ops one).
- **Technician performance** — jobs completed, not-completed rate, average time.
- **Customer retention/churn view** — who hasn't had a service in a long time, who's stopped renewing.
- **Export to Excel/PDF** for anything above — owners will want to hand numbers to an accountant.

## Phase 5 — Inventory (spare parts/stock)

Relevant once job costing and Phase 3's "parts used per job" exist.

- Spare parts stock levels, per-part cost.
- Low-stock alerts.
- Purchase order / restock tracking.

## Phase 6 — Customer experience

Lower urgency than the above, but this is where a CRM starts feeling like a product customers notice, not just an internal tool.

- **Customer self-service** — a simple portal or WhatsApp-bot flow to request a service, without calling in.
- **Feedback/rating** after a completed visit.
- **Notes/complaints history** — the Notes tab already exists as a stub on the customer page; this is the natural place for it.
- **Referral tracking** — who brought in whom, useful for a word-of-mouth-driven business.

## Phase 7 — Settings, branding, and multi-tenant polish

Needed regardless of whether you ever sell this to other businesses, but essential if you do (e.g. the medical-shop version).

- **Business profile settings** — logo, address, GSTIN, shown on invoices/PDFs.
- **Notification defaults** — reminder lead time, default channel.
- **Role/permission fine-tuning** beyond the current OWNER/ADMIN/TECHNICIAN split, if a business needs it.
- **Tenant self-signup** — if you ever want businesses to sign themselves up instead of you provisioning them via the backend API.
- **White-labeling** — per-tenant branding/theme, relevant to running the medical-shop vertical off the same backend.

## Cross-cutting / technical debt (ongoing, not a phase)

- **Automated tests.** None exist anywhere in the project right now — this is the biggest structural risk as the feature set grows, since every change is currently verified by hand.
- **Database backups.** No backup strategy has been set up yet for whichever server you land on.
- **Audit log** — who changed what, useful once there are multiple staff with write access.
- **Known bug:** assets created before the `active` field fix are stuck invisible in list views — flagged twice, never actioned. Worth a one-off cleanup script regardless of what else gets prioritized.

---

## Suggested sequencing logic

Phases 1 and 2 are the two I'd argue for first, in either order — they're the features most directly tied to either getting paid or retaining customers, which is what actually makes the business money. Phase 3 (scheduling) makes the app more useful operationally but doesn't by itself increase revenue or retention the way 1 and 2 do. Phases 4–6 compound in value once 1–3 exist (a revenue report needs invoices to report on; a customer portal needs scheduling to request into). Phase 7 and the technical debt items are "do before it hurts you," not urgent today but not free to defer indefinitely either — tests especially get more expensive to add the longer they're skipped.
