export type PaymentMethod = "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "OTHER";

/**
 * Matches backend PaymentDto exactly.
 */
export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  customerAssetId: string | null;
  assetName: string | null;
  amcContractId: string | null;
  amcPlanName: string | null;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  referenceNote: string | null;
  recordedById: string | null;
  recordedByName: string | null;
}

/**
 * Matches backend CreatePaymentRequest.
 */
export interface CreatePaymentRequest {
  customerId: string;
  customerAssetId?: string;
  amcContractId?: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  referenceNote?: string;
  recordedById?: string;
}

/**
 * Matches backend CustomerLedgerSummaryDto.
 */
export interface CustomerLedgerSummary {
  customerId: string;
  totalCharges: number;
  totalPaid: number;
  balanceDue: number;
}
