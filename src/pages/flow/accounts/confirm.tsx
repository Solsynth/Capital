import { sni } from '@/services/network'
import { Container, Box, Typography, CircularProgress, Alert, Collapse } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import ErrorIcon from '@mui/icons-material/Error'

import 'animate.css'

export default function AccountConfirm() {
  const router = useRouter()

  const [error, setError] = useState<string | null>(null)

  async function confirm() {
    try {
      await sni.post('/cgi/id/users/me/confirm', {
        code: router.query['code'] as string,
      })
      router.push('/')
    } catch (err: any) {
      setError(err.toString())
    }
  }

  useEffect(() => {
    confirm()
  }, [])

  return (
    <Container
      sx={{
        display: 'grid',
        placeItems: 'center',
        height: 'calc(100vh - 64px)',
        textAlign: 'center',
      }}
      maxWidth="xs"
    >
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" component="h1">
          Confirm Account
        </Typography>
        <Typography variant="subtitle2" component="h2">
          Confirm your registeration on Solar Network
        </Typography>

        <Collapse in={!!error} sx={{ width: '100%' }}>
          <Alert sx={{ mt: 4 }} icon={<ErrorIcon fontSize="inherit" />} severity="error">
            {error}
          </Alert>
        </Collapse>

        {!error && (
          <Box sx={{ mt: 3 }}>
            <CircularProgress />

            <Typography
              variant="body2"
              sx={{ mt: 3 }}
              className="animate__animated animate__flash animate__infinite"
              style={{ '--animate-duration': '3s' } as any}
            >
              Hold on a moment, we&apos;re working on it...
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  )
}
