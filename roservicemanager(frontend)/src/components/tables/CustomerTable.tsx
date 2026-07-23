import {
  Box,
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
import { Pencil, UserX, Users } from "lucide-react";
import type { Customer } from "@/types/customer";

interface CustomerTableProps {
  customers: Customer[];
  totalElements: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRowClick: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDeactivate: (customer: Customer) => void;
}

export function CustomerTable({
  customers,
  totalElements,
  page,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  onEdit,
  onDeactivate,
}: CustomerTableProps) {
  if (!isLoading && customers.length === 0) {
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
        <Users size={32} color="#5B6B8C" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
          No customers found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try a different search, or add your first customer.
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
              <TableCell>Name</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow
                key={customer.id}
                hover
                onClick={() => onRowClick(customer)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{customer.name}</TableCell>
                <TableCell>{customer.contactNumber}</TableCell>
                <TableCell>{customer.email || "—"}</TableCell>
                <TableCell>{customer.address || "—"}</TableCell>
                <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                    <Tooltip title="Edit customer">
                      <IconButton size="small" onClick={() => onEdit(customer)}>
                        <Pencil size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Deactivate customer">
                      <IconButton size="small" onClick={() => onDeactivate(customer)}>
                        <UserX size={16} />
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
