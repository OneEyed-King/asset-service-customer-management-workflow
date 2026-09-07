import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Chip, CircularProgress, Paper, Tab, Tabs, Typography } from "@mui/material";
import { ArrowLeft, Mail, MapPin, Pencil, Phone, Plus, PackageSearch, Wrench, Wallet, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { useCustomerQuery } from "@/hooks/useCustomerQueries";
import { useAssetsByCustomerQuery, useDeactivateAssetMutation } from "@/hooks/useAssetQueries";
import { useServiceHistoryByCustomerQuery } from "@/hooks/useServiceHistoryQueries";
import { CustomerFormDialog } from "@/components/dialogs/CustomerFormDialog";
import { AssetFormDialog } from "@/components/dialogs/AssetFormDialog";
import { ServiceHistoryFormDialog } from "@/components/dialogs/ServiceHistoryFormDialog";
import { AmcContractDialog } from "@/components/dialogs/AmcContractDialog";
import { PaymentFormDialog } from "@/components/dialogs/PaymentFormDialog";
import { AssetTable } from "@/components/tables/AssetTable";
import { ServiceHistoryTable } from "@/components/tables/ServiceHistoryTable";
import { CustomerLedgerCard } from "@/components/common/CustomerLedgerCard";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { ComingSoon } from "@/components/common/ComingSoon";
import { getApiErrorMessage } from "@/api/axiosClient";
import type { CustomerAsset } from "@/types/asset";

const TABS = [
  { label: "Assets", icon: PackageSearch },
  { label: "Service History", icon: Wrench },
  { label: "Payments", icon: Wallet },
  { label: "Notes", icon: StickyNote },
] as const;

export default function CustomerDetailsPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [assetPage, setAssetPage] = useState(0);
  const [assetPageSize, setAssetPageSize] = useState(10);
  const [assetFormDialog, setAssetFormDialog] = useState<{ mode: "create" | "edit"; asset?: CustomerAsset } | null>(
    null
  );
  const [assetToDeactivate, setAssetToDeactivate] = useState<CustomerAsset | null>(null);
  const [serviceLogAsset, setServiceLogAsset] = useState<CustomerAsset | null>(null);
  const [serviceHistoryDialogOpen, setServiceHistoryDialogOpen] = useState(false);
  const [serviceHistoryPage, setServiceHistoryPage] = useState(0);
  const [serviceHistoryPageSize, setServiceHistoryPageSize] = useState(10);
  const [amcAsset, setAmcAsset] = useState<CustomerAsset | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const { data: customer, isLoading, isError } = useCustomerQuery(customerId);
  const { data: assetsPageData, isLoading: isLoadingAssets, isError: isAssetsError } = useAssetsByCustomerQuery(
    customerId,
    { page: assetPage, size: assetPageSize }
  );
  // Separate, larger fetch of the same customer's assets just to populate
  // the "which asset was this?" picker in the Service History tab -
  // independent of the Assets tab's own (smaller) pagination.
  const { data: allAssetsForPicker } = useAssetsByCustomerQuery(customerId, { page: 0, size: 100 });
  const {
    data: serviceHistoryPageData,
    isLoading: isLoadingServiceHistory,
    isError: isServiceHistoryError,
  } = useServiceHistoryByCustomerQuery(customerId, { page: serviceHistoryPage, size: serviceHistoryPageSize });
  const deactivateAssetMutation = useDeactivateAssetMutation();

  const handleDeactivateAssetConfirm = () => {
    if (!assetToDeactivate) return;
    deactivateAssetMutation.mutate(
      { id: assetToDeactivate.id, customerId: assetToDeactivate.customerId },
      {
        onSuccess: () => {
          toast.success(`${assetToDeactivate.name} deactivated`);
          setAssetToDeactivate(null);
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, "Could not deactivate asset."));
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !customer) {
    return (
      <Box>
        <Typography color="error">Could not load this customer.</Typography>
        <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/customers")} sx={{ mt: 2 }}>
          Back to Customers
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={() => navigate("/customers")}
        sx={{ mb: 2 }}
        color="inherit"
      >
        Back to Customers
      </Button>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {customer.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Phone size={14} color="#5B6B8C" />
                <Typography variant="body2" color="text.secondary">
                  {customer.contactNumber}
                  {customer.alternateContactNumber ? ` / ${customer.alternateContactNumber}` : ""}
                </Typography>
              </Box>
              {customer.email && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Mail size={14} color="#5B6B8C" />
                  <Typography variant="body2" color="text.secondary">
                    {customer.email}
                  </Typography>
                </Box>
              )}
              {customer.address && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <MapPin size={14} color="#5B6B8C" />
                  <Typography variant="body2" color="text.secondary">
                    {customer.address}
                  </Typography>
                </Box>
              )}
            </Box>
            {customer.notes && (
              <Chip label={customer.notes} size="small" sx={{ mt: 1.5, bgcolor: "primary.light", color: "primary.contrastText" }} />
            )}
          </Box>
          <Button
            variant="outlined"
            startIcon={<Pencil size={16} />}
            onClick={() => setEditDialogOpen(true)}
          >
            Edit Customer
          </Button>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={(_event, value) => setActiveTab(value)}
          sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.label} label={tab.label} icon={<tab.icon size={16} />} iconPosition="start" sx={{ minHeight: 56 }} />
          ))}
        </Tabs>
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Plus size={16} />}
                  onClick={() => setAssetFormDialog({ mode: "create" })}
                >
                  Add Asset
                </Button>
              </Box>
              {isAssetsError ? (
                <Typography color="error">Failed to load assets. Please try again.</Typography>
              ) : (
                <AssetTable
                  assets={assetsPageData?.content ?? []}
                  totalElements={assetsPageData?.totalElements ?? 0}
                  page={assetPage}
                  pageSize={assetPageSize}
                  isLoading={isLoadingAssets}
                  onPageChange={setAssetPage}
                  onPageSizeChange={(size) => {
                    setAssetPageSize(size);
                    setAssetPage(0);
                  }}
                  onEdit={(asset) => setAssetFormDialog({ mode: "edit", asset })}
                  onDeactivate={(asset) => setAssetToDeactivate(asset)}
                  onLogService={(asset) => setServiceLogAsset(asset)}
                  onManageAmc={(asset) => setAmcAsset(asset)}
                />
              )}
            </Box>
          )}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Plus size={16} />}
                  onClick={() => setServiceHistoryDialogOpen(true)}
                  disabled={(allAssetsForPicker?.content.length ?? 0) === 0}
                >
                  Log Service
                </Button>
              </Box>
              {(allAssetsForPicker?.content.length ?? 0) === 0 && !isLoadingAssets && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add an asset for this customer first, then you can log service visits against it.
                </Typography>
              )}
              {isServiceHistoryError ? (
                <Typography color="error">Failed to load service history. Please try again.</Typography>
              ) : (
                <ServiceHistoryTable
                  entries={serviceHistoryPageData?.content ?? []}
                  totalElements={serviceHistoryPageData?.totalElements ?? 0}
                  page={serviceHistoryPage}
                  pageSize={serviceHistoryPageSize}
                  isLoading={isLoadingServiceHistory}
                  showAssetColumn
                  onPageChange={setServiceHistoryPage}
                  onPageSizeChange={(size) => {
                    setServiceHistoryPageSize(size);
                    setServiceHistoryPage(0);
                  }}
                />
              )}
            </Box>
          )}
          {activeTab === 2 && (
            <CustomerLedgerCard customerId={customer.id} onRecordPayment={() => setPaymentDialogOpen(true)} />
          )}
          {activeTab === 3 && <ComingSoon title="Notes Coming Soon" icon={StickyNote} />}
        </Box>
      </Paper>

      <CustomerFormDialog
        open={editDialogOpen}
        mode="edit"
        customer={customer}
        onClose={() => setEditDialogOpen(false)}
      />

      {assetFormDialog && (
        <AssetFormDialog
          open
          mode={assetFormDialog.mode}
          asset={assetFormDialog.asset}
          fixedCustomer={{ id: customer.id, name: customer.name }}
          onClose={() => setAssetFormDialog(null)}
        />
      )}

      {assetToDeactivate && (
        <ConfirmDialog
          open
          title="Deactivate asset?"
          description={`"${assetToDeactivate.name}" will be marked inactive.`}
          confirmLabel="Deactivate"
          confirmColor="error"
          loading={deactivateAssetMutation.isPending}
          onConfirm={handleDeactivateAssetConfirm}
          onClose={() => setAssetToDeactivate(null)}
        />
      )}

      <ServiceHistoryFormDialog
        open={!!serviceLogAsset}
        asset={serviceLogAsset ?? undefined}
        onClose={() => setServiceLogAsset(null)}
      />

      <ServiceHistoryFormDialog
        open={serviceHistoryDialogOpen}
        pickFromAssets={allAssetsForPicker?.content ?? []}
        onClose={() => setServiceHistoryDialogOpen(false)}
      />

      <AmcContractDialog open={!!amcAsset} asset={amcAsset} onClose={() => setAmcAsset(null)} />

      <PaymentFormDialog
        open={paymentDialogOpen}
        customer={{ id: customer.id, name: customer.name }}
        assetOptions={allAssetsForPicker?.content ?? []}
        onClose={() => setPaymentDialogOpen(false)}
      />
    </Box>
  );
}
