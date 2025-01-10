import { ConsoleLayout, getConsoleStaticProps } from '@/components/layouts/ConsoleLayout'
import { Typography, Container, Box } from '@mui/material'
import { MaProduct, sni } from 'solar-js-sdk'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import MaProductForm, { MatrixProductForm } from '@/components/matrix/MaProductForm'

export const getServerSideProps: GetServerSideProps = (async (context) => {
  const id = context.params!.id

  const { data } = await sni.get<MaProduct>('/cgi/ma/products/' + id)

  return getConsoleStaticProps({
    props: {
      title: `Edit Product "${data.name}"`,
      product: data,
    },
  })
}) satisfies GetServerSideProps<{ product: MaProduct }>

export default function ProductEdit({ product }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  async function onSubmit(data: MatrixProductForm) {
    await sni.put('/cgi/ma/products/' + product.id, data)
  }

  return (
    <ConsoleLayout>
      <Container sx={{ py: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box>
          <Typography variant="h3" component="h1">
            Edit product
          </Typography>
          <Typography variant="subtitle1">{product.name}</Typography>
        </Box>

        <MaProductForm onSubmit={onSubmit} defaultValue={product} />
      </Container>
    </ConsoleLayout>
  )
}
