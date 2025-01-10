import { ConsoleLayout, getConsoleStaticProps } from '@/components/layouts/ConsoleLayout'
import { Typography, Container } from '@mui/material'
import { sni } from 'solar-js-sdk'

import MaProductForm, { MatrixProductForm } from '@/components/matrix/MaProductForm'

export async function getStaticProps() {
  return getConsoleStaticProps({
    props: {
      title: 'New Product',
    },
  })
}

export default function ProductNew() {
  async function onSubmit(data: MatrixProductForm) {
    await sni.post('/cgi/ma/products', data)
  }

  return (
    <ConsoleLayout>
      <Container sx={{ py: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography variant="h3" component="h1">
          Create a product
        </Typography>

        <MaProductForm onSubmit={onSubmit} />
      </Container>
    </ConsoleLayout>
  )
}
