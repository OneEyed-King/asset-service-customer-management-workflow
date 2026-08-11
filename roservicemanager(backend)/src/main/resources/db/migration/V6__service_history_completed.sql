---------------------------------------------------------
-- Migration : V6
-- Purpose   : Not every logged visit ends with the service actually done -
--             a technician can show up and find the customer unavailable,
--             a part missing, etc. Track that outcome instead of assuming
--             every row in service_history was a completed visit.
---------------------------------------------------------

ALTER TABLE service_history
    ADD COLUMN completed BOOLEAN NOT NULL DEFAULT TRUE;
