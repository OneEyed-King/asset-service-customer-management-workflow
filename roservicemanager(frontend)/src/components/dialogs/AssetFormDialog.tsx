import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { X } from "lucide-react";
import { toast } from "sonner";
import { AssetForm } from "@/components/forms/AssetForm";
import { getApiErrorMessage } from "@/api/axiosClient";
import { useCreateAssetMutation, useUpdateAssetMutation } from "@/hooks/useAssetQueries";
import type { CustomerAsset, CustomerAssetRequest } from "@/types/asset";

interface AssetFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  asset?: CustomerAsset;
  /** Fixes the customer (hides the picker) - used from a customer's own page, or right after creating a new customer. */
  fixedCustomer?: { id: string; name: string };
  onClose: () => void;
  onCreated?: (asset: CustomerAsset) => void;
}

const FORM_ID = "asset-form";

/**
 * Wraps <AssetForm> in a Dialog and owns the create/update API call - same
 * split as CustomerFormDialog.
 */
export function AssetFormDialog({ open, mode, asset, fixedCustomer, onClose, onCreated }: AssetFormDialogProps) {
  const createMutation = useCreateAssetMutation();
  const updateMutation = useUpdateAssetMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (values: CustomerAssetRequest) => {
    if (mode === "edit" && asset) {
      updateMutation.mutate(
        { id: asset.id, payload: values },
        {
          onSuccess: () => {
            toast.success("Asset updated");
            onClose();
          },
          onError: (error) => {
            toast.error(getApiErrorMessage(error, "Could not update asset."));
          },
        }
      );
      return;
    }

    createMutation.mutate(values, {
      onSuccess: (createdAsset) => {
        toast.success("Asset added");
        onCreated?.(createdAsset);
        onClose();
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Could not add asset."));
      },
    });
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {mode === "edit" ? "Edit Asset" : "Add Asset"}
        <IconButton size="small" onClick={onClose} disabled={isSubmitting}>
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <AssetForm
          formId={FORM_ID}
          fixedCustomer={fixedCustomer}
          defaultValues={
            mode === "edit" && asset
              ? {
                  customerId: asset.customerId,
                  name: asset.name,
                  brand: asset.brand ?? undefined,
                  assetType: asset.assetType,
                  assetSource: asset.assetSource,
                  serialNumber: asset.serialNumber ?? undefined,
                  purchasePrice: asset.purchasePrice ?? undefined,
                  amountPaid: asset.amountPaid ?? undefined,
                  paymentStatus: asset.paymentStatus,
                  purchaseDate: asset.purchaseDate ?? undefined,
                  installationDate: asset.installationDate ?? undefined,
                  warrantyExpiry: asset.warrantyExpiry ?? undefined,
                  serviceIntervalDays: asset.serviceIntervalDays ?? undefined,
                  nextServiceDate: asset.nextServiceDate ?? undefined,
                  installationLocation: asset.installationLocation ?? undefined,
                  notes: asset.notes ?? undefined,
                }
              : undefined
          }
          onSubmit={handleSubmit}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting} color="inherit">
          Cancel
        </Button>
        <Button type="submit" form={FORM_ID} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
