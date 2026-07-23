import { Box, Paper, Typography } from "@mui/material";
import type { ComponentType } from "react";
import { Sparkles } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: ComponentType<{ size?: number; color?: string }>;
}

export function ComingSoon({ title, description, icon: Icon = Sparkles }: ComingSoonProps) {
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
        borderStyle: "dashed",
        borderRadius: 4,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          bgcolor: "primary.light",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <Icon size={28} color="#fff" />
      </Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
        {description ?? "This module is under construction and will be available in a future milestone."}
      </Typography>
    </Paper>
  );
}
