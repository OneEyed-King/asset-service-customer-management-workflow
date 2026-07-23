import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Eye, EyeOff, Droplets } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/api/authApi";
import { getApiErrorMessage } from "@/api/axiosClient";
import { useAuth } from "@/hooks/AuthContext";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const { accessToken } = await authApi.login(values);
      await login(accessToken);
      toast.success("Welcome back!");
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid username or password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #123F91 0%, #1E5FCC 55%, #4C82E0 100%)",
        px: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 420, boxShadow: 8 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={0.5} sx={{ alignItems: "center", mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "16px",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
              }}
            >
              <Droplets color="#fff" size={28} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Asset &amp; Service Manager
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage your customers and assets
            </Typography>
          </Stack>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.5}>
              <TextField
                label="Username"
                fullWidth
                autoFocus
                error={!!errors.username}
                helperText={errors.username?.message}
                {...register("username")}
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register("password")}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isSubmitting}
                sx={{ mt: 1 }}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
