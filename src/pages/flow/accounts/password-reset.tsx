import { sni } from '@/services/network'
import { Container, Box, Typography, Alert, Collapse, Button, TextField } from '@mui/material'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import ErrorIcon from '@mui/icons-material/Error'

export type SnResetPasswordForm = {
  password: string
}

export default function AccountPasswordReset() {
  const router = useRouter()

  const { handleSubmit, register } = useForm<SnResetPasswordForm>()

  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function confirm(data: any) {
    try {
      setBusy(true)
      await sni.patch('/cgi/id/users/me/password-reset', {
        code: router.query['code'] as string,
        new_password: data.password,
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
          Reset Password
        </Typography>
        <Typography variant="subtitle2" component="h2">
          Reset your password on Solar Network
        </Typography>

        <Collapse in={!!error} sx={{ width: '100%' }}>
          <Alert sx={{ mt: 4 }} icon={<ErrorIcon fontSize="inherit" />} severity="error">
            {error}
          </Alert>
        </Collapse>

        <form onSubmit={handleSubmit(confirm)}>
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', width: '100%', gap: 2, textAlign: 'center' }}>
            <TextField
              label="New Password"
              type="password"
              autoComplete="new-password"
              {...register('password', { required: true })}
            />

            <Button type="submit" disabled={busy}>
              Next
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  )
}
