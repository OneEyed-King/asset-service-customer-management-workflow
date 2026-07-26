---------------------------------------------------------
-- Migration : V3
-- Purpose   : Introduce multi-tenancy. Every business (Tenant) gets its
--             own isolated set of users/customers/customer_assets.
--             Existing data is backfilled into one bootstrap tenant so
--             the current account keeps working exactly as before.
---------------------------------------------------------

---------------------------------------------------------
-- TENANTS
---------------------------------------------------------

CREATE TABLE tenants
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_name VARCHAR(150) NOT NULL,

    plan_tier VARCHAR(20) NOT NULL,

    status VARCHAR(20) NOT NULL,

    seat_limit INTEGER,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL
);

-- Bootstrap tenant: every row that already exists in the system (created
-- before multi-tenancy existed) gets attached to this one tenant, so the
-- existing account keeps working unchanged after this migration runs.
INSERT INTO tenants (id, business_name, plan_tier, status, seat_limit, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Default Business',
    'GROWING',
    'ACTIVE',
    10,
    now(),
    now()
);

---------------------------------------------------------
-- USERS: add tenant_id, backfill, migrate role values
---------------------------------------------------------

ALTER TABLE users
    ADD COLUMN tenant_id UUID;

UPDATE users
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

ALTER TABLE users
    ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE users
    ADD CONSTRAINT fk_users_tenant
        FOREIGN KEY (tenant_id) REFERENCES tenants(id);

CREATE INDEX idx_users_tenant
    ON users(tenant_id);

-- Role enum changed from (OWNER, EMPLOYEE) to (OWNER, ADMIN, TECHNICIAN).
-- Existing EMPLOYEE users become ADMIN (full access) rather than
-- TECHNICIAN (restricted access), since that's the closer match to what
-- EMPLOYEE meant before this change and avoids silently locking anyone
-- out of data they could previously see.
UPDATE users
SET role = 'ADMIN'
WHERE role = 'EMPLOYEE';

---------------------------------------------------------
-- CUSTOMERS: add tenant_id, backfill
---------------------------------------------------------

ALTER TABLE customers
    ADD COLUMN tenant_id UUID;

UPDATE customers
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

ALTER TABLE customers
    ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE customers
    ADD CONSTRAINT fk_customers_tenant
        FOREIGN KEY (tenant_id) REFERENCES tenants(id);

CREATE INDEX idx_customers_tenant
    ON customers(tenant_id);

-- Most customer lookups are "within my tenant, filtered/sorted by name or
-- contact number" - composite indexes serve those directly instead of
-- Postgres having to intersect two separate single-column indexes.
CREATE INDEX idx_customers_tenant_name
    ON customers(tenant_id, name);

CREATE INDEX idx_customers_tenant_contact
    ON customers(tenant_id, contact_number);

---------------------------------------------------------
-- CUSTOMER ASSETS: add tenant_id, backfill
---------------------------------------------------------

ALTER TABLE customer_assets
    ADD COLUMN tenant_id UUID;

UPDATE customer_assets
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

ALTER TABLE customer_assets
    ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE customer_assets
    ADD CONSTRAINT fk_customer_assets_tenant
        FOREIGN KEY (tenant_id) REFERENCES tenants(id);

CREATE INDEX idx_customer_assets_tenant
    ON customer_assets(tenant_id);

CREATE INDEX idx_customer_assets_tenant_customer
    ON customer_assets(tenant_id, customer_id);
