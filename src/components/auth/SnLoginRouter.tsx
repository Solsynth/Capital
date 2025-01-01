'use client'

import { SnAuthFactor, SnAuthTicket } from '@/services/auth'
import { sni } from '@/services/network'
import { Collapse, Alert, Box, Button, Typography, ButtonGroup } from '@mui/material'
import { useState } from 'react'

import ErrorIcon from '@mui/icons-material/Error'
import PasswordIcon from '@mui/icons-material/Password'
import EmailIcon from '@mui/icons-material/Email'

export function SnLoginRouter({
  ticket,
  factorList,
  onNext,
}: {
  ticket: SnAuthTicket
  factorList: SnAuthFactor[]
  onNext: (val: SnAuthFactor) => void
}) {
  const factorTypeIcons = [<PasswordIcon />, <EmailIcon />]
  const factorTypeLabels = ['Password', 'Email verification code']

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  async function onSubmit(factor: SnAuthFactor) {
    try {
      setLoading(true)
      await sni.post('/cgi/id/auth/factors/' + factor.id)
      onNext(factor)
    } catch (err: any) {
      setError(err.toString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Collapse in={!!error} sx={{ width: 320 }}>
        <Alert sx={{ mb: 4 }} icon={<ErrorIcon fontSize="inherit" />} severity="error">
          {error}
        </Alert>
      </Collapse>

      <Box sx={{ display: 'flex', flexDirection: 'column', width: 320, gap: 2, textAlign: 'center' }}>
        <ButtonGroup orientation="vertical" aria-label="Vertical button group">
          {factorList.map((factor) => (
            <Button
              sx={{ py: 1 }}
              key={factor.id}
              onClick={() => onSubmit(factor)}
              disabled={loading || ticket.factorTrail?.includes(factor.id)}
              startIcon={factorTypeIcons[factor.type]}
            >
              {factorTypeLabels[factor.type]}
            </Button>
          ))}
        </ButtonGroup>

        <Typography variant="caption" sx={{ opacity: 0.75, mx: 2 }}>
          {ticket.stepRemain} step(s) left
        </Typography>
      </Box>
    </>
  )
}
