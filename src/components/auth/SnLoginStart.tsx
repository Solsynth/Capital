'use client'

import { useState } from 'react'
import { sni } from '@/services/network'
import { ArrowForward } from '@mui/icons-material'
import { Alert, Box, Button, Collapse, Link, TextField, Typography } from '@mui/material'
import { SnAuthFactor, SnAuthResult, SnAuthTicket } from '@/services/auth'
import { useForm } from 'react-hook-form'
import NextLink from 'next/link'

import ErrorIcon from '@mui/icons-material/Error'

export type SnLoginStartForm = {
  username: string
}

export function SnLoginStart({ onNext }: { onNext: (val: SnAuthTicket, fcs: SnAuthFactor[]) => void }) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const { handleSubmit, register } = useForm<SnLoginStartForm>()

  async function onSubmit(data: any) {
    try {
      setLoading(true)
      const resp = await sni.post<SnAuthResult>('/cgi/id/auth', data)
      const factorResp = await sni.get<SnAuthFactor[]>('/cgi/id/auth/factors', {
        params: {
          ticketId: resp.data.ticket.id,
        },
      })
      onNext(resp.data.ticket, factorResp.data)
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
            label="Username"
            helperText="You can also use email address and phone number"
            {...register('username', { required: true })}
          />

          <Button variant="contained" endIcon={<ArrowForward />} disabled={loading} type="submit">
            Next
          </Button>

          <Typography variant="caption" sx={{ opacity: 0.75, mx: 2 }}>
            By continuing means you agree to our{' '}
            <NextLink href="/terms/privacy-policy" passHref>
              <Link component="span">Privacy Policy</Link>
            </NextLink>{' '}
            and{' '}
            <NextLink href="/terms/user-agreements" passHref>
              <Link component="span">User Agreements</Link>
            </NextLink>
          </Typography>
        </Box>
      </form>
    </>
  )
}
