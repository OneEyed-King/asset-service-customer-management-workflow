---------------------------------------------------------
-- Migration : V4
-- Purpose   : Add tenant_id to service_history so it follows the same
--             tenant-scoping pattern as users/customers/customer_assets.
--             Unlike V3, no nullable-then-backfill dance is needed here:
--             service_history has existed since V1 but no application
--             code has ever written to it (the ServiceHistory module is
--             new), so the table is guaranteed empty on every existing
--             install - the column can go straight to NOT NULL.
---------------------------------------------------------

ALTER TABLE service_history
    ADD COLUMN tenant_id UUID NOT NULL;

ALTER TABLE service_history
    ADD CONSTRAINT fk_service_history_tenant
        FOREIGN KEY (tenant_id) REFERENCES tenants(id);

CREATE INDEX idx_service_history_tenant
    ON service_history(tenant_id);

CREATE INDEX idx_service_history_tenant_asset
    ON service_history(tenant_id, customer_asset_id);
