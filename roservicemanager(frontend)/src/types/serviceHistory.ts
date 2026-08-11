/**
 * Matches backend ServiceHistoryDto exactly. One logged visit against a
 * CustomerAsset - e.g. "changed the RO candle on this date, next change
 * due in 30 days".
 */
export interface ServiceHistoryEntry {
  id: string;
  customerAssetId: string;
  assetName: string;
  customerId: string;
  customerName: string;
  serviceDate: string;
  remarks: string | null;
  nextServiceDate: string | null;
  servicedById: string | null;
  servicedByName: string | null;
  completed: boolean;
}

/**
 * Matches backend ServiceHistoryRequest. nextServiceDate, servicedById, and
 * completed are all optional - the backend defaults nextServiceDate to
 * serviceDate + the asset's own serviceIntervalDays when omitted (only for
 * completed visits) and defaults completed to true when omitted.
 */
export interface ServiceHistoryRequest {
  customerAssetId: string;
  serviceDate: string;
  remarks?: string;
  nextServiceDate?: string;
  servicedById?: string;
  completed?: boolean;
}
