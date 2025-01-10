import { ConsoleLayout, getConsoleStaticProps } from '@/components/layouts/ConsoleLayout'
import { Typography, Container, Box } from '@mui/material'
import { MaProduct, sni } from 'solar-js-sdk'

import MaReleaseForm, { MatrixReleaseForm } from '@/components/matrix/MaReleaseForm'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

export const getServerSideProps: GetServerSideProps = (async (context) => {
  const id = context.params!.id

  const { data } = await sni.get<MaProduct>('/cgi/ma/products/' + id)

  return getConsoleStaticProps({
    props: {
      title: `New Release for "${data.name}"`,
      product: data,
    },
  })
}) satisfies GetServerSideProps<{ product: MaProduct }>

export default function ReleaseNew({ product }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  async function onSubmit(data: MatrixReleaseForm) {
    await sni.post(`/cgi/ma/products/${product.id}/releases`, data)
  }

  return (
    <ConsoleLayout>
      <Container sx={{ py: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box>
          <Typography variant="h3" component="h1">
            Create a release
          </Typography>
          <Typography variant="subtitle1">for {product.name}</Typography>
        </Box>

        <MaReleaseForm onSubmit={onSubmit} parent={product} />
      </Container>
    </ConsoleLayout>
  )
}
