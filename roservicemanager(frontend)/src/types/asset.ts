export type AssetType = "RO" | "WATER_PURIFIER" | "SOFTENER" | "OTHER";
export type AssetSource = "SOLD" | "CUSTOMER_OWNED" | "AMC";
export type PaymentStatus = "PAID" | "PARTIAL" | "PENDING";

export interface CustomerAsset {
  id: string;
  customerId: string;
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
  active: boolean;
}

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
