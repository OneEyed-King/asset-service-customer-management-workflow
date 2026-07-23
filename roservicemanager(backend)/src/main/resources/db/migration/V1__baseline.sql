CREATE EXTENSION IF NOT EXISTS "pgcrypto";

---------------------------------------------------------
-- USERS
---------------------------------------------------------

CREATE TABLE users
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username VARCHAR(50) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE,

    contact_number VARCHAR(20),

    role VARCHAR(20) NOT NULL,

    enabled BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_username
    ON users(username);

---------------------------------------------------------
-- CUSTOMERS
---------------------------------------------------------

CREATE TABLE customers
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    contact_number VARCHAR(20) NOT NULL,

    alternate_contact_number VARCHAR(20),

    email VARCHAR(150),

    address TEXT,

    notes TEXT,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_customer_name
    ON customers(name);

CREATE INDEX idx_customer_contact
    ON customers(contact_number);

---------------------------------------------------------
-- CUSTOMER ASSETS
---------------------------------------------------------

CREATE TABLE customer_assets
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id UUID NOT NULL,

    brand VARCHAR(100),

    name VARCHAR(150) NOT NULL,

    asset_type VARCHAR(30) NOT NULL,

    asset_source VARCHAR(30) NOT NULL,

    serial_number VARCHAR(100),

    purchase_price NUMERIC(10,2),

    amount_paid NUMERIC(10,2),

    purchase_date DATE,

    installation_date DATE,

    warranty_expiry DATE,

    service_interval_days INTEGER NOT NULL,

    next_service_date DATE,

    installation_location VARCHAR(150),

    notes TEXT,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_customer_asset_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
);

CREATE INDEX idx_customer_asset_customer
    ON customer_assets(customer_id);

CREATE INDEX idx_customer_asset_next_service
    ON customer_assets(next_service_date);

CREATE INDEX idx_customer_asset_serial
    ON customer_assets(serial_number);

---------------------------------------------------------
-- SERVICE HISTORY
---------------------------------------------------------

CREATE TABLE service_history
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_asset_id UUID NOT NULL,

    service_date DATE NOT NULL,

    remarks TEXT,

    next_service_date DATE,

    serviced_by UUID,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_service_history_asset
        FOREIGN KEY (customer_asset_id)
        REFERENCES customer_assets(id),

    CONSTRAINT fk_service_history_user
        FOREIGN KEY (serviced_by)
        REFERENCES users(id)
);

CREATE INDEX idx_service_history_asset
    ON service_history(customer_asset_id);

---------------------------------------------------------
-- REMINDER LOG
---------------------------------------------------------

CREATE TABLE reminder_log
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_asset_id UUID NOT NULL,

    reminder_date TIMESTAMP NOT NULL,

    recipient VARCHAR(20) NOT NULL,

    status VARCHAR(20) NOT NULL,

    message TEXT,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_reminder_asset
        FOREIGN KEY (customer_asset_id)
        REFERENCES customer_assets(id)
);

CREATE INDEX idx_reminder_date
    ON reminder_log(reminder_date);