/**
 * Matches backend AmcContractDto exactly. An AMC as an actual dated,
 * priced contract - independent of CustomerAsset.underAmc, which still
 * just controls whether the asset shows service-interval fields.
 */
export interface AmcContract {
  id: string;
  customerAssetId: string;
  assetName: string;
  customerId: string;
  customerName: string;
  planName: string | null;
  startDate: string;
  endDate: string;
  price: number;
  visitsIncluded: number | null;
  status: "ACTIVE" | "CANCELLED";
  /** Derived on the backend from endDate vs today - true only while status is still ACTIVE. */
  expired: boolean;
}

/**
 * Matches backend CreateAmcContractRequest.
 */
export interface CreateAmcContractRequest {
  customerAssetId: string;
  planName?: string;
  startDate: string;
  endDate: string;
  price: number;
  visitsIncluded?: number;
}
