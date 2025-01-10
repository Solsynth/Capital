import { ConsoleLayout, getConsoleStaticProps } from '@/components/layouts/ConsoleLayout'
import { MaProduct } from 'solar-js-sdk'
import { sni } from 'solar-js-sdk'
import { Typography, Container, Box, Button, Grid2 as Grid, Card, CardContent, CardActions } from '@mui/material'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'

export async function getStaticProps() {
  return getConsoleStaticProps({
    props: {
      title: 'Matrix Marketplace',
    },
  })
}

export default function MatrixMarketplace() {
  const [products, setProducts] = useState<MaProduct[]>([])

  async function fetchProducts() {
    const { data: resp } = await sni.get<{ data: MaProduct[] }>('/cgi/ma/products/created', {
      params: {
        take: 10,
      },
    })
    setProducts(resp.data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  async function deleteProduct(id: number) {
    const yes = confirm(`Are you sure you want to delete this product #${id}?`)
    if (!yes) return

    await sni.delete('/cgi/ma/products/' + id)
    window.location.reload()
  }

  return (
    <ConsoleLayout>
      <Container sx={{ py: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography variant="h3" component="h1">
          Matrix Marketplace
        </Typography>

        <Grid container columns={{ xs: 1, sm: 2, md: 3 }} spacing={4}>
          {products.map((p) => (
            <Grid size={1} key={p.id}>
              <Card sx={{ width: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {p.name}
                  </Typography>
                  <Typography variant="body1">{p.description}</Typography>
                </CardContent>
                <CardActions>
                  <NextLink passHref href={`/console/matrix/products/${p.id}`}>
                    <Button size="small">Details</Button>
                  </NextLink>
                  <NextLink passHref href={`/console/matrix/products/${p.id}/edit`}>
                    <Button size="small">Edit</Button>
                  </NextLink>
                  <Button size="small" color="error" onClick={() => deleteProduct(p.id)}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box>
          <NextLink passHref href="/console/matrix/products/new">
            <Button variant="contained">Create a product</Button>
          </NextLink>
        </Box>
      </Container>
    </ConsoleLayout>
  )
}
