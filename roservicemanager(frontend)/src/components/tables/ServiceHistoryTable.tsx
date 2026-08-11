import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { Wrench } from "lucide-react";
import type { ServiceHistoryEntry } from "@/types/serviceHistory";

interface ServiceHistoryTableProps {
  entries: ServiceHistoryEntry[];
  totalElements: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  /** Shows the asset column - useful in the customer-level combined view, redundant when already scoped to one asset. */
  showAssetColumn?: boolean;
  /** Shows the customer column - for the tenant-wide Services page, where entries span many customers. */
  showCustomerColumn?: boolean;
  /** Optional - when set, rows become clickable (e.g. jump to that customer's page). */
  onRowClick?: (entry: ServiceHistoryEntry) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ServiceHistoryTable({
  entries,
  totalElements,
  page,
  pageSize,
  isLoading,
  showAssetColumn = false,
  showCustomerColumn = false,
  onRowClick,
  onPageChange,
  onPageSizeChange,
}: ServiceHistoryTableProps) {
  if (!isLoading && entries.length === 0) {
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
        <Wrench size={32} color="#5B6B8C" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
          No service visits logged yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Log a service to start tracking visit history and upcoming due dates.
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
              <TableCell>Service Date</TableCell>
              {showCustomerColumn && <TableCell>Customer</TableCell>}
              {showAssetColumn && <TableCell>Asset</TableCell>}
              <TableCell>Status</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Serviced By</TableCell>
              <TableCell>Next Due</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow
                key={entry.id}
                hover
                onClick={onRowClick ? () => onRowClick(entry) : undefined}
                sx={onRowClick ? { cursor: "pointer" } : undefined}
              >
                <TableCell sx={{ fontWeight: 600 }}>{entry.serviceDate}</TableCell>
                {showCustomerColumn && <TableCell>{entry.customerName}</TableCell>}
                {showAssetColumn && <TableCell>{entry.assetName}</TableCell>}
                <TableCell>
                  <Chip
                    size="small"
                    label={entry.completed ? "Completed" : "Not completed"}
                    color={entry.completed ? "success" : "error"}
                  />
                </TableCell>
                <TableCell>{entry.remarks || "—"}</TableCell>
                <TableCell>{entry.servicedByName || "—"}</TableCell>
                <TableCell>{entry.nextServiceDate || "—"}</TableCell>
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
