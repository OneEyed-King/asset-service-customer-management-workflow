/**
 * These match the backend's actual Java enums
 * (com.vc.roservicemanager.common.enums.*) exactly - confirmed by reading
 * the enum source files, not guessed.
 */
export type AssetType = "RO" | "CHIMNEY" | "AC" | "WATER_SOFTENER" | "SPARE_PART" | "OTHER";
export type AssetSource = "SOLD" | "SERVICE_ONLY";
export type PaymentStatus = "PAID" | "PARTIAL" | "UNPAID";

/**
 * Matches backend CustomerAssetDto exactly. Note there is no "active"
 * field (same as Customer), and the backend includes a denormalized
 * `customerName` for display convenience.
 */
export interface CustomerAsset {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  brand: string;
  assetType: AssetType;
  assetSource: AssetSource;
  serialNumber?: string | null;
  purchasePrice?: number | null;
  amountPaid?: number | null;
  paymentStatus: PaymentStatus;
  purchaseDate?: string | null;
  installationDate?: string | null;
  warrantyExpiry?: string | null;
  serviceIntervalDays?: number | null;
  nextServiceDate?: string | null;
  installationLocation?: string | null;
  notes?: string | null;
}

/**
 * Matches backend CustomerAssetRequest exactly.
 */
export interface CustomerAssetRequest {
  customerId: string;
  name: string;
  brand: string;
  assetType: AssetType;
  assetSource: AssetSource;
  serialNumber?: string;
  purchasePrice?: number;
  amountPaid?: number;
  paymentStatus: PaymentStatus;
  purchaseDate?: string;
  installationDate?: string;
  warrantyExpiry?: string;
  serviceIntervalDays?: number;
  nextServiceDate?: string;
  installationLocation?: string;
  notes?: string;
}
