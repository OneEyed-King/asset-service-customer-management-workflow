---------------------------------------------------------
-- Migration : V7
-- Purpose   : Real money tracking. Two new tables:
--             - amc_contract: an AMC as an actual dated, priced contract
--               instead of just the underAmc boolean on customer_assets.
--             - payment: money actually received from a customer, the
--               start of a real ledger instead of the single paid/partial/
--               unpaid flag on customer_assets.
---------------------------------------------------------

CREATE TABLE amc_contract (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL REFERENCES tenants(id),
    customer_asset_id UUID NOT NULL REFERENCES customer_assets(id),
    plan_name         VARCHAR(150),
    start_date        DATE NOT NULL,
    end_date          DATE NOT NULL,
    price             NUMERIC(12, 2) NOT NULL,
    visits_included   INTEGER,
    status            VARCHAR(20) NOT NULL,
    created_at        TIMESTAMP NOT NULL,
    updated_at        TIMESTAMP NOT NULL
);

CREATE INDEX idx_amc_contract_tenant ON amc_contract (tenant_id);
CREATE INDEX idx_amc_contract_asset ON amc_contract (customer_asset_id);

CREATE TABLE payment (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL REFERENCES tenants(id),
    customer_id       UUID NOT NULL REFERENCES customers(id),
    customer_asset_id UUID REFERENCES customer_assets(id),
    amc_contract_id   UUID REFERENCES amc_contract(id),
    amount            NUMERIC(12, 2) NOT NULL,
    payment_date      DATE NOT NULL,
    method            VARCHAR(20) NOT NULL,
    reference_note    VARCHAR(255),
    recorded_by       UUID REFERENCES users(id),
    created_at        TIMESTAMP NOT NULL,
    updated_at        TIMESTAMP NOT NULL
);

CREATE INDEX idx_payment_tenant ON payment (tenant_id);
CREATE INDEX idx_payment_customer ON payment (customer_id);
