---------------------------------------------------------
-- Migration : V2
-- Purpose   : Add payment status to customer assets
-- Author    : Vishal
-- Date      : 2026-07-07
---------------------------------------------------------
---------------------------------------------------------
-- CUSTOMER ASSETS
---------------------------------------------------------

ALTER TABLE customer_assets
ADD COLUMN payment_status VARCHAR(20);

UPDATE customer_assets
SET payment_status = 'UNPAID'
WHERE payment_status IS NULL;

ALTER TABLE customer_assets
ALTER COLUMN payment_status SET NOT NULL;