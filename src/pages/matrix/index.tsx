import { Typography, Container } from '@mui/material'

export default function MatrixMarketplace() {
  return (
    <Container sx={{ py: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Typography variant="h3" component="h1">
        Matrix Marketplace
      </Typography>
    </Container>
  )
}
