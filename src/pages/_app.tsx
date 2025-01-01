import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Roboto } from "next/font/google";
import { CapAppBar } from "@/components/CapAppBar";

const fontRoboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const siteTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3949ab",
    },
    secondary: {
      main: "#1e88e5",
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${fontRoboto.style.fontFamily};
        }
      `}</style>

      <ThemeProvider theme={siteTheme}>
        <CssBaseline />

        <CapAppBar />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
