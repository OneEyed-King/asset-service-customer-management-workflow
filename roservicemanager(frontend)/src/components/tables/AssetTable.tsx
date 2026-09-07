import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Pencil, PackageX, PackageSearch, ShieldCheck, Wrench } from "lucide-react";
import type { CustomerAsset } from "@/types/asset";

interface AssetTableProps {
  assets: CustomerAsset[];
  totalElements: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  /** Shows the customer name column - omit when the table is already scoped to one customer. */
  showCustomerColumn?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEdit: (asset: CustomerAsset) => void;
  onDeactivate: (asset: CustomerAsset) => void;
  /** Optional - omit to hide the "Log Service" quick action. */
  onLogService?: (asset: CustomerAsset) => void;
  /** Optional - omit to hide the "Manage AMC" quick action. */
  onManageAmc?: (asset: CustomerAsset) => void;
}

function isOverdue(nextServiceDate: string | null | undefined): boolean {
  if (!nextServiceDate) return false;
  return new Date(nextServiceDate) < new Date(new Date().toDateString());
}

const ASSET_TYPE_LABELS: Record<CustomerAsset["assetType"], string> = {
  RO: "RO Purifier",
  CHIMNEY: "Chimney",
  AC: "AC",
  FRIDGE: "Fridge",
  WATER_SOFTENER: "Water Softener",
  SPARE_PART: "Spare Part",
  OTHER: "Other",
};

const PAYMENT_STATUS_COLOR: Record<CustomerAsset["paymentStatus"], "success" | "warning" | "error"> = {
  PAID: "success",
  PARTIAL: "warning",
  UNPAID: "error",
};

export function AssetTable({
  assets,
  totalElements,
  page,
  pageSize,
  isLoading,
  showCustomerColumn = false,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDeactivate,
  onLogService,
  onManageAmc,
}: AssetTableProps) {
  if (!isLoading && assets.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          borderRadius: 4,
        }}
      >
        <PackageSearch size={32} color="#5B6B8C" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
          No assets found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add an asset to start tracking service history and warranties.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "background.default" } }}>
              <TableCell>Asset</TableCell>
              {showCustomerColumn && <TableCell>Customer</TableCell>}
              <TableCell>Brand</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Next Service</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>
                  {asset.name}
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {ASSET_TYPE_LABELS[asset.assetType]}
                  </Typography>
                </TableCell>
                {showCustomerColumn && <TableCell>{asset.customerName}</TableCell>}
                <TableCell>{asset.brand || "—"}</TableCell>
                <TableCell>
                  <Chip size="small" label={asset.paymentStatus} color={PAYMENT_STATUS_COLOR[asset.paymentStatus]} />
                </TableCell>
                <TableCell>
                  {!asset.underAmc ? (
                    <Typography variant="body2" color="text.secondary">
                      Not under AMC
                    </Typography>
                  ) : asset.nextServiceDate ? (
                    <Typography
                      variant="body2"
                      sx={{ color: isOverdue(asset.nextServiceDate) ? "error.main" : "text.primary", fontWeight: isOverdue(asset.nextServiceDate) ? 700 : 400 }}
                    >
                      {asset.nextServiceDate}
                      {isOverdue(asset.nextServiceDate) ? " (overdue)" : ""}
                    </Typography>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                    {onLogService && (
                      <Tooltip title="Log service">
                        <IconButton size="small" onClick={() => onLogService(asset)}>
                          <Wrench size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onManageAmc && (
                      <Tooltip title="Manage AMC contracts">
                        <IconButton size="small" onClick={() => onManageAmc(asset)}>
                          <ShieldCheck size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit asset">
                      <IconButton size="small" onClick={() => onEdit(asset)}>
                        <Pencil size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Deactivate asset">
                      <IconButton size="small" onClick={() => onDeactivate(asset)}>
                        <PackageX size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={(_event, newPage) => onPageChange(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
}
