import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AssetTable } from "@/components/tables/AssetTable";
import { AssetFormDialog } from "@/components/dialogs/AssetFormDialog";
import { ServiceHistoryFormDialog } from "@/components/dialogs/ServiceHistoryFormDialog";
import { AmcContractDialog } from "@/components/dialogs/AmcContractDialog";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { useAssetsQuery, useDeactivateAssetMutation } from "@/hooks/useAssetQueries";
import { getApiErrorMessage } from "@/api/axiosClient";
import type { CustomerAsset } from "@/types/asset";

export default function AssetsPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [formDialog, setFormDialog] = useState<{ mode: "create" | "edit"; asset?: CustomerAsset } | null>(null);
  const [assetToDeactivate, setAssetToDeactivate] = useState<CustomerAsset | null>(null);
  const [serviceLogAsset, setServiceLogAsset] = useState<CustomerAsset | null>(null);
  const [amcAsset, setAmcAsset] = useState<CustomerAsset | null>(null);

  const { data, isLoading, isError } = useAssetsQuery({ page, size: pageSize });
  const deactivateMutation = useDeactivateAssetMutation();

  const handleDeactivateConfirm = () => {
    if (!assetToDeactivate) return;
    deactivateMutation.mutate(
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

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Assets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Every RO unit, appliance, or spare part you've sold or service, across all customers.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setFormDialog({ mode: "create" })}>
          Add Asset
        </Button>
      </Box>

      {isError ? (
        <Typography color="error">Failed to load assets. Please try again.</Typography>
      ) : (
        <AssetTable
          assets={data?.content ?? []}
          totalElements={data?.totalElements ?? 0}
          page={page}
          pageSize={pageSize}
          isLoading={isLoading}
          showCustomerColumn
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
          onEdit={(asset) => setFormDialog({ mode: "edit", asset })}
          onDeactivate={(asset) => setAssetToDeactivate(asset)}
          onLogService={(asset) => setServiceLogAsset(asset)}
          onManageAmc={(asset) => setAmcAsset(asset)}
        />
      )}

      <ServiceHistoryFormDialog
        open={!!serviceLogAsset}
        asset={serviceLogAsset ?? undefined}
        onClose={() => setServiceLogAsset(null)}
      />

      <AmcContractDialog open={!!amcAsset} asset={amcAsset} onClose={() => setAmcAsset(null)} />

      {formDialog && (
        <AssetFormDialog
          open
          mode={formDialog.mode}
          asset={formDialog.asset}
          onClose={() => setFormDialog(null)}
        />
      )}

      {assetToDeactivate && (
        <ConfirmDialog
          open
          title="Deactivate asset?"
          description={`"${assetToDeactivate.name}" will be marked inactive.`}
          confirmLabel="Deactivate"
          confirmColor="error"
          loading={deactivateMutation.isPending}
          onConfirm={handleDeactivateConfirm}
          onClose={() => setAssetToDeactivate(null)}
        />
      )}
    </Box>
  );
}
