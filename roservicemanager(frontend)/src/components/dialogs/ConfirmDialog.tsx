import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "primary" | "error" | "warning";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Generic yes/no confirmation dialog reused anywhere the app needs a
 * "are you sure?" step (deactivating a customer, deleting an asset, etc.)
 * instead of writing a one-off dialog per action.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "primary",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} disabled={loading} color={confirmColor} variant="contained">
          {loading ? "Please wait..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
