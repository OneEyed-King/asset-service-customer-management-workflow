---------------------------------------------------------
-- Migration : V5
-- Purpose   : Recurring service tracking (interval + next-due date) was
--             forced on for every asset, even one-off jobs on equipment
--             the business didn't sell and has no ongoing AMC for. Makes
--             it opt-in per asset instead.
---------------------------------------------------------

ALTER TABLE customer_assets
    ADD COLUMN under_amc BOOLEAN;

-- Backfill: assets we sold were previously assumed to need recurring
-- service (matches the old forced-on behavior), service-only jobs are
-- assumed one-off. Either can be corrected per-asset after this migration -
-- this is just a reasonable starting default, not a hard rule.
UPDATE customer_assets
SET under_amc = (asset_source = 'SOLD')
WHERE under_amc IS NULL;

ALTER TABLE customer_assets
    ALTER COLUMN under_amc SET NOT NULL;

-- service_interval_days only makes sense for assets under recurring
-- service tracking now, so it can no longer be unconditionally required.
ALTER TABLE customer_assets
    ALTER COLUMN service_interval_days DROP NOT NULL;

-- Assets not under AMC shouldn't carry stale interval/next-due data.
UPDATE customer_assets
SET service_interval_days = NULL,
    next_service_date = NULL
WHERE under_amc = false;
