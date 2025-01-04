import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { Roboto } from 'next/font/google'
import { CapAppBar } from '@/components/CapAppBar'
import { useUserStore } from '@/services/user'
import { useEffect } from 'react'

const fontRoboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

const siteTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: '#3949ab',
    },
    secondary: {
      main: '#1e88e5',
    },
  },
})

export default function App({ Component, pageProps }: AppProps) {
  const userStore = useUserStore()

  useEffect(() => {
    userStore.fetchUser()
  }, [])

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
        <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
          <Component {...pageProps} />
        </Box>
      </ThemeProvider>
    </>
  )
}
