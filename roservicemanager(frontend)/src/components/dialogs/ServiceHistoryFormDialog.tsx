import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import { X } from "lucide-react";
import { toast } from "sonner";
import { ServiceHistoryForm } from "@/components/forms/ServiceHistoryForm";
import { getApiErrorMessage } from "@/api/axiosClient";
import { useCreateServiceHistoryMutation } from "@/hooks/useServiceHistoryQueries";
import type { ServiceableAsset } from "@/types/asset";
import type { ServiceHistoryRequest } from "@/types/serviceHistory";

interface ServiceHistoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Fixed asset - skips the picker (e.g. "Log Service" from an asset row, a due-list row, or a dashboard row). */
  asset?: ServiceableAsset;
  /** Picker mode - shows a "which asset?" dropdown first (e.g. the customer-level Service History tab). */
  pickFromAssets?: ServiceableAsset[];
}

const FORM_ID = "service-history-form";

export function ServiceHistoryFormDialog({ open, onClose, asset, pickFromAssets }: ServiceHistoryFormDialogProps) {
  const [pickedAssetId, setPickedAssetId] = useState("");
  const createMutation = useCreateServiceHistoryMutation();

  const activeAsset = asset ?? pickFromAssets?.find((candidate) => candidate.id === pickedAssetId);

  const handleSubmit = (values: ServiceHistoryRequest) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Service logged");
        setPickedAssetId("");
        onClose();
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Could not log service."));
      },
    });
  };

  const handleClose = () => {
    setPickedAssetId("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={createMutation.isPending ? undefined : handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Log Service{activeAsset ? ` — ${activeAsset.name}` : ""}
        <IconButton size="small" onClick={handleClose} disabled={createMutation.isPending}>
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {!asset && pickFromAssets && (
          <TextField
            select
            fullWidth
            label="Asset"
            value={pickedAssetId}
            onChange={(event) => setPickedAssetId(event.target.value)}
            sx={{ mb: activeAsset ? 2 : 0 }}
            helperText={pickFromAssets.length === 0 ? "This customer has no assets yet." : undefined}
            disabled={pickFromAssets.length === 0}
          >
            {pickFromAssets.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
        )}

        {activeAsset && <ServiceHistoryForm formId={FORM_ID} asset={activeAsset} onSubmit={handleSubmit} />}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={createMutation.isPending} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          form={FORM_ID}
          variant="contained"
          disabled={createMutation.isPending || !activeAsset}
        >
          {createMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
