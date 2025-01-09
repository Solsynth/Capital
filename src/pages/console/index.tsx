import { ConsoleLayout, getConsoleStaticProps } from '@/components/layouts/ConsoleLayout'
import { Typography, Container, Box, Grid2 as Grid, Card, CardContent, CardActionArea } from '@mui/material'
import NextLink from 'next/link'

import DynamicFormIcon from '@mui/icons-material/DynamicForm'
import AppsIcon from '@mui/icons-material/Apps'

export function getStaticProps() {
  return getConsoleStaticProps({
    props: {
      title: 'Welcome',
    },
  })
}

export default function ConsoleLanding() {
  return (
    <ConsoleLayout>
      <Container sx={{ py: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Box>
          <DynamicFormIcon sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="subtitle2">Welcome to the</Typography>
          <Typography variant="h3" component="h1">
            Console
          </Typography>
          <Typography variant="subtitle1">of the Solar Network</Typography>
        </Box>

        <Grid container columns={{ xs: 2, sm: 2, md: 3, lg: 4 }} spacing={4}>
          <Grid size={1}>
            <NextLink passHref href="/console/matrix">
              <CardActionArea>
                <Card sx={{ width: '100%' }} onClick={() => {}}>
                  <CardContent>
                    <AppsIcon sx={{ fontSize: 32, mb: 1.5 }} />
                    <Typography variant="h5" gutterBottom>
                      Matrix
                    </Typography>
                    <Typography variant="body1">
                      Publish and versioning your application with Matrix Marketplace.
                    </Typography>
                  </CardContent>
                </Card>
              </CardActionArea>
            </NextLink>
          </Grid>
        </Grid>
      </Container>
    </ConsoleLayout>
  )
}
