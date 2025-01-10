import { ConsoleLayout, getConsoleStaticProps } from '@/components/layouts/ConsoleLayout'
import { Box, Button, Container, Typography } from '@mui/material'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { sni, MaProduct } from 'solar-js-sdk'
import NextLink from 'next/link'

export const getServerSideProps: GetServerSideProps = (async (context) => {
  const id = context.params!.id

  const { data } = await sni.get<MaProduct>('/cgi/ma/products/' + id)

  return getConsoleStaticProps({
    props: {
      title: `Product "${data.name}"`,
      product: data,
    },
  })
}) satisfies GetServerSideProps<{ product: MaProduct }>

export default function ProductDetails({ product }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <ConsoleLayout>
      <Container sx={{ py: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Box maxWidth="sm">
          <Typography variant="h3" component="h1">
            {product.name}
          </Typography>
          <Typography variant="subtitle1">{product.description}</Typography>
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h4" component="h2">
            Releases
          </Typography>

          <NextLink passHref href={`/console/matrix/products/${product.id}/releases/new`}>
            <Button variant="contained">Create a release</Button>
          </NextLink>
        </Box>
      </Container>
    </ConsoleLayout>
  )
}
