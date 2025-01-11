import { ConsoleLayout, getConsoleStaticProps } from '@/components/layouts/ConsoleLayout'
import { Box, Button, Container, Typography, Grid2 as Grid, Card, CardContent, CardActions } from '@mui/material'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { sni, MaProduct, MaRelease, getAttachmentUrl } from 'solar-js-sdk'
import { useEffect, useState } from 'react'
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
  const [releases, setReleases] = useState<MaRelease[]>([])

  async function fetchReleases() {
    const { data: resp } = await sni.get<{ data: MaRelease[] }>('/cgi/ma/products/' + product.id + '/releases', {
      params: {
        take: 10,
      },
    })

    setReleases(resp.data)
  }

  useEffect(() => {
    fetchReleases()
  }, [])

  async function deleteRelease(id: number) {
    const yes = confirm(`Are you sure you want to delete this release #${id}?`)
    if (!yes) return

    await sni.delete('/cgi/ma/products/' + product.id + '/releases/' + id)
    await fetchReleases()
  }

  return (
    <ConsoleLayout>
      <>
        {product.previews && (
          <img
            src={getAttachmentUrl(product.previews[0])}
            alt={product.name}
            style={{ objectFit: 'cover', aspectRatio: 16 / 5 }}
            className='border-b border-1'
          />
        )}

        <Container sx={{ pt: (product.previews ? 8 : 16), pb: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
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

            <Grid container columns={{ xs: 1, sm: 2, md: 3 }} spacing={2}>
              {releases.map((r: any) => (
                <Grid size={1} key={r.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="caption">{r.version}</Typography>
                      <Typography variant="h5" component="h2">
                        {r.meta.title}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {r.type == 0 ? 'Full Release' : 'Patch Release'}
                      </Typography>

                      <Typography variant="body1">{r.meta.description}</Typography>
                    </CardContent>
                    <CardActions>
                      <NextLink passHref href={`/console/matrix/products/${r.productId}/releases/${r.id}/edit`}>
                        <Button size="small">Edit</Button>
                      </NextLink>
                      <Button size="small" color="error" onClick={() => deleteRelease(r.id)}>
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </>
    </ConsoleLayout>
  )
}
