import { Container, Typography } from '@mui/material'

export default function Home() {
  return (
    <main>
      <Container sx={{ mt: 12 }}>
        <Typography variant="h3" component="h1">
          Welcome to <br />
          the Solsynth Capital.
        </Typography>
      </Container>
    </main>
  )
}
