import type { ReactNode } from "react";
import { Box, Chip, IconButton, Paper, Skeleton, TablePagination, Tooltip, Typography } from "@mui/material";
import { Wrench } from "lucide-react";

export interface DueServiceItem {
  assetId: string;
  assetName: string;
  customerId: string;
  customerName: string;
  nextServiceDate: string;
  overdue: boolean;
}

interface PaginationProps {
  totalElements: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

interface DueServiceListProps {
  items: DueServiceItem[];
  isLoading: boolean;
  /** Opens the log-service dialog for that row, right where the user already is. */
  onLogService: (item: DueServiceItem) => void;
  emptyMessage?: string;
  /** Omit for a capped, non-paginated preview (e.g. the dashboard's top-10). */
  pagination?: PaginationProps;
}

/**
 * Shared "what needs service" list - same rendering used by the Dashboard's
 * preview and the Services page's full Due & Upcoming tab. Each row's
 * "Log Service" button opens the log dialog inline, so marking something
 * done (or not) never requires leaving the page you're already on.
 */
export function DueServiceList({
  items,
  isLoading,
  onLogService,
  emptyMessage = "Nothing due right now. Assets under AMC with an upcoming service date will show up here.",
  pagination,
}: DueServiceListProps) {
  if (isLoading) {
    return (
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ px: 2.5, pb: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {items.map((item) => (
        <Box
          key={item.assetId}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 2.5,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {item.assetName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {item.customerName}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {item.nextServiceDate}
            </Typography>
            <Chip size="small" label={item.overdue ? "Overdue" : "Due soon"} color={item.overdue ? "error" : "warning"} />
            <Tooltip title="Log service">
              <IconButton size="small" color="primary" onClick={() => onLogService(item)}>
                <Wrench size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ))}
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.totalElements}
          page={pagination.page}
          onPageChange={(_event, newPage) => pagination.onPageChange(newPage)}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={(event) => pagination.onPageSizeChange(Number(event.target.value))}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      )}
    </Box>
  );
}

/**
 * Wraps a list in the same Paper/header chrome used across the app's
 * dashboard-style cards, so callers just supply the title/icon and content.
 */
export function DueServiceListCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Wrench;
  children: ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
      <Box sx={{ p: 2.5, pb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
        <Icon size={18} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );
}
