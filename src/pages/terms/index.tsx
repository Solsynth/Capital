import { Box, Button, Card, CardActions, CardContent, Container, Typography } from '@mui/material'
import Link from 'next/link'

export default function Terms() {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
        Terms & Conditions
      </Typography>

      <Typography variant="body1">
        Nothing too special here, just some legal files which make our lawyers happy.{' '}
        <del>Do we really have a lawyer?</del>
      </Typography>

      <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Privacy Policy
            </Typography>

            <Typography variant="body2">Learn about how do we protect your data and privacy.</Typography>
          </CardContent>
          <CardActions>
            <Link href="/terms/privacy-policy" passHref>
              <Button size="small">Read this policy</Button>
            </Link>
          </CardActions>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              User Agreements
            </Typography>

            <Typography variant="body2">
              Learn about how do we dealing the user generated content on Solar Network, distrubution of our products
              and more.
            </Typography>
          </CardContent>
          <CardActions>
            <Link href="/terms/user-agreements" passHref>
              <Button size="small">Read this agreements</Button>
            </Link>
          </CardActions>
        </Card>
      </Box>
    </Container>
  )
}
