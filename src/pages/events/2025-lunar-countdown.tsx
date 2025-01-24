import { CountdownTimer } from '@/components/events/CountdownTimer'
import { Box, Container, Typography } from '@mui/material'
import { Noto_Serif_TC } from 'next/font/google'
import { useState } from 'react'

const serifFont = Noto_Serif_TC({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export default function LunarCountdownFor2025() {
  const [isCountdown, setIsCountdown] = useState(true)

  return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
      <Box>
        <Typography style={serifFont.style} sx={{ textAlign: 'center' }}>
          距离
        </Typography>
        <Typography variant="h5" style={serifFont.style} sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          二〇二五乙巳年
        </Typography>
        <Typography style={serifFont.style} sx={{ textAlign: 'center', mb: 3 }}>
          {isCountdown ? '还有' : '已经'}
        </Typography>
        <CountdownTimer
          targetDate={new Date('2025-01-29T00:00:00')}
          onUpdate={({ isCountdown }) => setIsCountdown(isCountdown)}
        />
      </Box>
    </Container>
  )
}
