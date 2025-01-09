import { sni } from 'solar-js-sdk'
import { Container, Box, Typography, Alert, Collapse, Button, CircularProgress, Card, CardContent } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { checkAuthenticatedClient, redirectToLogin, SnAuthTicket } from 'solar-js-sdk'

import ErrorIcon from '@mui/icons-material/Error'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'

export default function AccountAuthorize() {
  useEffect(() => {
    if (!checkAuthenticatedClient()) redirectToLogin()
  }, [])

  const router = useRouter()

  const [thirdClient, setThirdClient] = useState<any>(null)

  const [error, setError] = useState<string | null>(null)
  const [reverting, setReverting] = useState(false)
  const [busy, setBusy] = useState(false)

  function doCallback(ticket: SnAuthTicket) {
    const url = `${router.query['redirect_uri']}?code=${ticket.grantToken}&state=${router.query['state']}`
    window.open(url, '_self')
  }

  async function fetch() {
    try {
      setReverting(true)
      const resp = await sni.get<{ ticket: SnAuthTicket; client: any }>(
        '/cgi/id/auth/o/authorize' + window.location.search,
        {},
      )
      if (resp.data.ticket) {
        return doCallback(resp.data.ticket)
      }
      setThirdClient(resp.data.client)
    } catch (err: any) {
      setError(err.toString())
    } finally {
      setReverting(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [])

  async function confirm() {
    try {
      setBusy(true)
      const resp = await sni.post<{ ticket: SnAuthTicket }>('/cgi/id/auth/o/authorize' + window.location.search)
      return doCallback(resp.data.ticket)
    } catch (err: any) {
      setError(err.toString())
    } finally {
      setBusy(false)
    }
  }

  function decline() {
    if (window.history.length > 0) {
      window.history.back()
    } else {
      window.close()
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
          Connect with Solarpass
        </Typography>
        <Typography variant="subtitle2" component="h2">
          Connect third-party services with Solar Network
        </Typography>

        <Collapse in={!!error} sx={{ width: '100%' }}>
          <Alert sx={{ mt: 4 }} icon={<ErrorIcon fontSize="inherit" />} severity="error">
            {error}
          </Alert>
        </Collapse>

        {reverting && (
          <Box sx={{ mt: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!reverting && (
          <Box sx={{ mt: 3 }}>
            <Card variant="outlined" sx={{ width: '100%' }}>
              <CardContent sx={{ textAlign: 'left', px: 2.5 }}>
                <Typography variant="h6">{thirdClient?.name}</Typography>
                <Typography variant="body2">{thirdClient?.description}</Typography>
              </CardContent>
            </Card>

            <Box display="flex" justifyContent="space-between">
              <Button sx={{ mt: 3 }} startIcon={<CloseIcon />} onClick={() => decline()} disabled={busy} color="error">
                Decline
              </Button>
              <Button
                sx={{ mt: 3 }}
                startIcon={<CheckIcon />}
                onClick={() => confirm()}
                disabled={busy}
                color="success"
              >
                Approve
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  )
}
