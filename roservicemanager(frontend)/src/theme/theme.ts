import { createTheme } from "@mui/material/styles";

/**
 * REACT CONCEPT: Theme object
 * Material UI (MUI) lets you define a single "theme" object that controls
 * colors, typography, spacing and shape (border radius) for every component
 * in the app. Instead of styling each button/card manually, you configure it
 * once here and every MUI component picks it up automatically.
 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1E5FCC", // primary blue
      light: "#4C82E0",
      dark: "#123F91",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#0B2E6B",
    },
    background: {
      default: "#F4F7FC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A2B4C",
      secondary: "#5B6B8C",
    },
    divider: "#E3E9F5",
    success: {
      main: "#2E9E5B",
    },
    warning: {
      main: "#E0A72E",
    },
    error: {
      main: "#D9483B",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 18,
          paddingRight: 18,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid #E3E9F5",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 2px rgba(16, 30, 54, 0.06)",
        },
      },
    },
  },
});
