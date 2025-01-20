import { Alert, AlertTitle, Box, Button, Chip, Container, Grid2 as Grid, Link, Paper, Typography } from '@mui/material'
import { Roboto_Serif } from 'next/font/google'
import NextLink from 'next/link'
import Image from 'next/image'

import StarIcon from '@mui/icons-material/Star'
import ArrowForward from '@mui/icons-material/ArrowForward'
import ArrowDownward from '@mui/icons-material/ArrowDownward'
import LaunchIcon from '@mui/icons-material/Launch'

import ImgSolarNetworkLabeled from '@/assets/products/solar-network/labeled.webp'

const fontSerif = Roboto_Serif({
  subsets: ['latin'],
  weight: ['300'],
  display: 'swap',
  style: 'italic',
})

export default function Home() {
  return (
    <>
      <Container sx={{ py: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <Alert
          variant="filled"
          icon={<span>🎉</span>}
          severity="info"
          action={
            <NextLink href="/events/2025-lunar-countdown" passHref>
              <Button color="inherit" size="small">
                立即前往
              </Button>
            </NextLink>
          }
        >
          <AlertTitle gutterBottom={false}>预祝农历新年</AlertTitle>
          索尔幸茨的 2025 农历新年倒计时现已开启！
        </Alert>

        <Box>
          <Image src="/logo.png" width={128} height={128} alt="company logo" className="mb-2 dark:invert" />
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to <br />
            the Solsynth Capital.
          </Typography>
          <Typography variant="body1" fontSize={20} sx={{ mb: 2 }}>
            A vibrant creating wonderful software and hope the future will be brighter.
          </Typography>

          <Link href="#products">
            Explore our works
            <ArrowDownward sx={{ fontSize: 15, marginLeft: 0.5 }} />
          </Link>
        </Box>

        <Box id="products">
          <Grid container columns={{ xs: 1, sm: 1, md: 2 }} spacing={4}>
            <Grid size={1}>
              <Chip
                label="Featured Project"
                variant="outlined"
                icon={<StarIcon sx={{ fontSize: 18 }} />}
                sx={{ px: 1, mb: 2 }}
              />
              <Typography variant="h4" component="h2">
                Solar Network
              </Typography>
              <Typography variant="body1" fontSize={16} sx={{ mb: 2 }}>
                The next generation social network. But not only a social media.
              </Typography>

              <Typography
                variant="subtitle1"
                fontSize={26}
                fontFamily={fontSerif.style.fontFamily}
                sx={{ mb: 2, width: 'fit-content', fontStyle: 'italic' }}
                className="textmarker-effect active"
              >
                Social Network, Redefined.
              </Typography>

              <NextLink passHref href="/products/solar-network">
                <Link component="span">
                  Explore more you can do with Solar Network
                  <ArrowForward sx={{ fontSize: 15, marginLeft: 0.5 }} />
                </Link>
              </NextLink>
            </Grid>
            <Grid size={1}>
              <Paper sx={{ position: 'relative', aspectRatio: 16 / 10, width: '100%' }}>
                <Image
                  src={ImgSolarNetworkLabeled}
                  alt="solian the app preview"
                  fill
                  style={{ objectFit: 'cover', borderRadius: '8px' }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box id="production">
          <Grid container columns={{ xs: 1, sm: 1, md: 2 }} spacing={4}>
            <Grid size={1}>
              <Image
                src="/product-branding.webp"
                alt="product branding mark"
                width={256}
                height={80}
                style={{ marginLeft: '-20px' }}
                className="dark:invert"
              />
              <Typography variant="h4" component="h2" sx={{ my: 2 }}>
                Made by Solsynth
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                There are a lot of other great projects was made by Solsynth, and most of them are open sourced. You can
                check them on our GitHub organization.
              </Typography>

              <NextLink passHref href="https://www.github.com/Solsynth" target="_blank">
                <Link component="span">
                  Check out our GitHub page
                  <LaunchIcon sx={{ fontSize: 15, marginLeft: 0.5 }} />
                </Link>
              </NextLink>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  )
}
