import { sni } from '@/services/network'
import { Container, Box, Typography, Alert, Collapse, Button } from '@mui/material'
import { useRouter } from 'next/router'
import { useState } from 'react'

import ErrorIcon from '@mui/icons-material/Error'

import 'animate.css'

export default function AccountConfirm() {
  const router = useRouter()

  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function confirm() {
    try {
      setBusy(true)
      await sni.patch('/cgi/id/users/me/deletion', {
        code: router.query['code'] as string,
      })
      router.push('/')
    } catch (err: any) {
      setError(err.toString())
    } finally {
      setBusy(false)
    }
  }

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
          Delete Account
        </Typography>
        <Typography variant="subtitle2" component="h2">
          Confirm delete your account from Solar Network
        </Typography>

        <Collapse in={!!error} sx={{ width: '100%' }}>
          <Alert sx={{ mt: 4 }} icon={<ErrorIcon fontSize="inherit" />} severity="error">
            {error}
          </Alert>
        </Collapse>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>
            Are you sure you want to delete your account? This action is irreversible. All the resources created by you
            or related to your account will be deleted.
          </Typography>

          <Typography variant="body2">
            If you have changed your mind, you can close this tab at any time, nothing will be affected.
          </Typography>

          <Button sx={{ mt: 3 }} onClick={() => confirm()} disabled={busy}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
