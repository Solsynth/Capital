import { ConsoleLayout, getConsoleStaticProps } from '@/components/layouts/ConsoleLayout'
import { Typography, Container } from '@mui/material'

export async function getStaticProps() {
  return getConsoleStaticProps({
    props: {
      title: 'Matrix Marketplace',
    },
  })
}

export default function MatrixMarketplace() {
  return (
    <ConsoleLayout>
      <Container sx={{ py: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Typography variant="h3" component="h1">
          Matrix Marketplace
        </Typography>
      </Container>
    </ConsoleLayout>
  )
}
