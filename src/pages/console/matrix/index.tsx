import { ConsoleLayout, getConsoleStaticProps } from '@/components/layouts/ConsoleLayout'
import { MaProduct } from '@/services/matrix/product'
import { sni } from '@/services/network'
import { Typography, Container, Box, Button, Grid2 as Grid, Card, CardActionArea, CardContent } from '@mui/material'
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

  return (
    <ConsoleLayout>
      <Container sx={{ py: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography variant="h3" component="h1">
          Matrix Marketplace
        </Typography>

        <Grid container columns={{ xs: 2, sm: 2, md: 3, lg: 4 }} spacing={4}>
          {products.map((p) => (
            <Grid size={1} key={p.id}>
              <NextLink passHref href="/console/matrix">
                <CardActionArea>
                  <Card sx={{ width: '100%' }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {p.name}
                      </Typography>
                      <Typography variant="body1">{p.description}</Typography>
                    </CardContent>
                  </Card>
                </CardActionArea>
              </NextLink>
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
