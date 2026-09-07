import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { AmcContractForm } from "@/components/forms/AmcContractForm";
import { getApiErrorMessage } from "@/api/axiosClient";
import {
  useAmcContractsByAssetQuery,
  useCancelAmcContractMutation,
  useCreateAmcContractMutation,
} from "@/hooks/useAmcQueries";
import type { AmcContract, CreateAmcContractRequest } from "@/types/amc";

interface AmcContractDialogProps {
  open: boolean;
  onClose: () => void;
  asset: { id: string; name: string } | null;
}

const FORM_ID = "amc-contract-form";

function statusChip(contract: AmcContract) {
  if (contract.status === "CANCELLED") {
    return <Chip size="small" label="Cancelled" color="default" />;
  }
  if (contract.expired) {
    return <Chip size="small" label="Expired" color="warning" />;
  }
  return <Chip size="small" label="Active" color="success" />;
}

/**
 * Shows every AMC contract ever written against an asset (current, past,
 * cancelled) plus a form to start a new one - all in one place, since
 * "what did we charge for this AMC and when does it run out" is the kind
 * of thing an owner wants to check without hopping between screens.
 */
export function AmcContractDialog({ open, onClose, asset }: AmcContractDialogProps) {
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useAmcContractsByAssetQuery(asset?.id, { page: 0, size: 20 });
  const createMutation = useCreateAmcContractMutation();
  const cancelMutation = useCancelAmcContractMutation();

  const handleClose = () => {
    setShowForm(false);
    onClose();
  };

  const handleSubmit = (values: CreateAmcContractRequest) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success("AMC contract created");
        setShowForm(false);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Could not create AMC contract."));
      },
    });
  };

  const handleCancel = (contract: AmcContract) => {
    cancelMutation.mutate(contract.id, {
      onSuccess: () => toast.success("Contract cancelled"),
      onError: (error) => toast.error(getApiErrorMessage(error, "Could not cancel contract.")),
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        AMC Contracts{asset ? ` — ${asset.name}` : ""}
        <IconButton size="small" onClick={handleClose}>
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <>
            <Skeleton height={60} />
            <Skeleton height={60} />
          </>
        ) : !data || data.content.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No AMC contracts on record for this asset yet.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
            {data.content.map((contract) => (
              <Paper key={contract.id} variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {contract.planName || "AMC Contract"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {contract.startDate} to {contract.endDate} · ₹{contract.price}
                      {contract.visitsIncluded ? ` · ${contract.visitsIncluded} visits` : " · unlimited visits"}
                    </Typography>
                  </Box>
                  {statusChip(contract)}
                </Box>
                {contract.status === "ACTIVE" && !contract.expired && (
                  <Button
                    size="small"
                    color="error"
                    sx={{ mt: 1 }}
                    disabled={cancelMutation.isPending}
                    onClick={() => handleCancel(contract)}
                  >
                    Cancel contract
                  </Button>
                )}
              </Paper>
            ))}
          </Box>
        )}

        {showForm ? (
          <>
            <Divider sx={{ mb: 2 }} />
            {asset && <AmcContractForm formId={FORM_ID} customerAssetId={asset.id} onSubmit={handleSubmit} />}
          </>
        ) : (
          <Button startIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
            New AMC Contract
          </Button>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Close
        </Button>
        {showForm && (
          <Button type="submit" form={FORM_ID} variant="contained" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Save Contract"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
