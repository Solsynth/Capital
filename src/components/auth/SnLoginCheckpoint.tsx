'use client'

import { setTokenCookies, SnAuthFactor, SnAuthResult, SnAuthTicket } from 'solar-js-sdk'
import { sni } from 'solar-js-sdk'
import { ArrowForward } from '@mui/icons-material'
import { Collapse, Alert, Box, TextField, Button } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import ErrorIcon from '@mui/icons-material/Error'

export interface SnLoginCheckpointForm {
  password: string
}

export function SnLoginCheckpoint({
  ticket,
  factor,
  onNext,
}: {
  ticket: SnAuthTicket
  factor: SnAuthFactor
  onNext: (val: SnAuthTicket, done: boolean) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const { handleSubmit, register } = useForm<SnLoginCheckpointForm>()

  async function onSubmit(data: any) {
    try {
      setLoading(true)
      const resp = await sni.patch<SnAuthResult>('/cgi/id/auth', {
        ticket_id: ticket.id,
        factor_id: factor.id,
        code: data.password,
      })

      if (resp.data.isFinished) {
        const tokenResp = await sni.post('/cgi/id/auth/token', {
          grant_type: 'grant_token',
          code: resp.data.ticket.grantToken!,
        })
        const atk: string = tokenResp.data['accessToken']
        const rtk: string = tokenResp.data['refreshToken']
        setTokenCookies(atk, rtk)
        console.log('[Authenticator] User has been logged in. Result atk: ', atk)
      }

      onNext(resp.data.ticket, resp.data.isFinished)
    } catch (err: any) {
      setError(err.toString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Collapse in={!!error} sx={{ width: '100%' }}>
        <Alert sx={{ mb: 4 }} icon={<ErrorIcon fontSize="inherit" />} severity="error">
          {error}
        </Alert>
      </Collapse>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2, textAlign: 'center' }}>
          <TextField
            label={factor.type == 0 ? 'Password' : 'Verification code'}
            type="password"
            {...register('password', { required: true })}
          />

          <Button variant="contained" endIcon={<ArrowForward />} disabled={loading} type="submit">
            Next
          </Button>
        </Box>
      </form>
    </>
  )
}
