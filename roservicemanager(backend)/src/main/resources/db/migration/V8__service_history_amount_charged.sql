---------------------------------------------------------
-- Migration : V8
-- Purpose   : Off-schedule/complaint visits need somewhere to record what
--             was actually charged - a service visit with no AMC contract
--             behind it previously had no way to become a "charge" on the
--             customer ledger at all. Nullable, since a routine AMC visit
--             covered by the contract price usually isn't charged again.
---------------------------------------------------------

ALTER TABLE service_history
    ADD COLUMN amount_charged NUMERIC(12, 2);
