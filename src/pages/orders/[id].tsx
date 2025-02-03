import { Box, Typography, Container, Button, TextField, Collapse, Alert } from '@mui/material'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { EventHandler, FormEvent, FormEventHandler, useEffect, useState } from 'react'
import { checkAuthenticatedClient, redirectToLogin, sni } from 'solar-js-sdk'

import ErrorIcon from '@mui/icons-material/Error'
import PriceCheckIcon from '@mui/icons-material/PriceCheck'

type SnOrder = any

export const getServerSideProps = (async (context) => {
  const id = context.params!.id
  try {
    const { data: order } = await sni.get<SnOrder>('/cgi/wa/orders/' + id)
    return { props: { order, title: `Order #${order.id}` } }
  } catch (err) {
    console.error(err)
    return {
      notFound: true,
    }
  }
}) satisfies GetServerSideProps<{ order: SnOrder }>

export default function Post({ order }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useEffect(() => {
    if (!checkAuthenticatedClient()) redirectToLogin()
  }, [])

  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [paid, setPaid] = useState(false)
  const [canceled, setCanceled] = useState(false)

  useEffect(() => {
    if (order?.status === 1) {
      setPaid(true)
    } else if (order?.status === 2) {
      setCanceled(true)
    }
  }, [order])

  async function confirmPayment() {
    try {
      setBusy(true)
      await sni.post('/cgi/wa/orders/' + order.id + '/pay', {
        wallet_password: password,
      })
      setPaid(true)
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
      <Box
        component="form"
        sx={{ width: '100%' }}
        onSubmit={(evt) => {
          evt.preventDefault()
          confirmPayment()
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Order <code>#{order.id.toString().padStart(8, '0')}</code>
        </Typography>
        <Typography variant="body1" component="h2" gutterBottom>
          {order.remark}
        </Typography>

        <Typography variant="body2" fontSize={32} pt={2} fontFamily={'monospace'} gutterBottom>
          {order.amount} SRC
        </Typography>

        <Collapse in={!!error}>
          <Alert sx={{ mt: 3, width: '100%' }} icon={<ErrorIcon fontSize="inherit" />} severity="error">
            {error}
          </Alert>
        </Collapse>

        <Box sx={{ my: 3, flexDirection: 'column', display: 'flex', gap: 2 }}>
          {paid || canceled ? (
            canceled ? (
              <Typography textAlign="center">Canceled, you are not able to pay this order any more</Typography>
            ) : (
              <Typography textAlign="center">Paid, you can return to the seller now</Typography>
            )
          ) : (
            <TextField
              label="Wallet Password"
              variant="outlined"
              type="password"
              onInput={(evt) => setPassword((evt.target as HTMLInputElement).value)}
            />
          )}
          <Button type="submit" variant="contained" startIcon={<PriceCheckIcon />} disabled={busy || paid}>
            Pay
          </Button>
        </Box>

        <Typography variant="caption" sx={{ opacity: 0.75 }}>
          Powered by HyperNet.Wallet
        </Typography>
      </Box>
    </Container>
  )
}
