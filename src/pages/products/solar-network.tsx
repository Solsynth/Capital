import {
  Link,
  Container,
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material'
import { JSX } from 'react'
import { Roboto_Serif } from 'next/font/google'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Image from 'next/image'
import NextLink from 'next/link'

import ArrowDownward from '@mui/icons-material/ArrowDownward'
import DownloadIcon from '@mui/icons-material/Download'
import LaunchIcon from '@mui/icons-material/Launch'
import AppleIcon from '@mui/icons-material/Apple'
import AndroidIcon from '@mui/icons-material/Android'
import WindowIcon from '@mui/icons-material/Window'
import WebIcon from '@mui/icons-material/Public'
import CodeIcon from '@mui/icons-material/Code'

import ImgSolarNetworkIcon from '@/assets/products/solar-network/icon.png'
import ImgSolarNetworkAlpha from '@/assets/products/solar-network/alpha.webp'

import 'animate.css'
import { useTranslation } from 'next-i18next'

interface DownloadableAsset {
  icon: JSX.Element
  title: string
  href: string
  open?: boolean
}

interface AskableQuestion {
  question: string
  answer: string
}

const fontSerif = Roboto_Serif({
  subsets: ['latin'],
  weight: ['300'],
  display: 'swap',
  style: 'italic',
})

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      title: 'Solar Network',
      ...(await serverSideTranslations(locale, ['common', 'product-solar-network'])),
    },
  }
}

export default function ProductSolarNetwork() {
  const { t: ct } = useTranslation('common')
  const { t } = useTranslation('product-solar-network')

  const downloadableAssets: DownloadableAsset[] = [
    {
      icon: <AppleIcon />,
      title: ct('downloadAppleStore'),
      href: 'https://apps.apple.com/us/app/solian/id6499032345?itscg=30200&itsct=apps_box_link&mttnsubad=6499032345',
    },
    {
      icon: <AppleIcon />,
      title: ct('downloadAppleTestflight'),
      href: 'https://testflight.apple.com/join/YJ0lmN6O',
    },
    {
      icon: <AndroidIcon />,
      title: ct('downloadAndroid'),
      href: 'https://files.solsynth.dev/production01/solian/app-arm64-v8a-release.apk',
    },
    {
      icon: <WindowIcon />,
      title: ct('downloadWindows'),
      href: 'https://files.solsynth.dev/production01/solian/windows-x86_64-release.zip',
    },
    {
      icon: <WebIcon />,
      title: ct('downloadWeb'),
      href: 'https://sn.solsynth.dev',
      open: true,
    },
    {
      icon: <CodeIcon />,
      title: ct('downloadSourceCode'),
      href: 'https://github.com/Solsynth/HyperNet.Surface',
    },
  ]

  const askableQuestions: AskableQuestion[] = [
    {
      question: t('faq1'),
      answer: t('faq1a'),
    },
    {
      question: t('faq2'),
      answer: t('faq2a'),
    },
    {
      question: t('faq3'),
      answer: t('faq3a'),
    },
    {
      question: t('faq4'),
      answer: t('faq4a'),
    },
  ]

  return (
    <Container sx={{ py: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Image
          src={ImgSolarNetworkIcon}
          width={128}
          height={128}
          style={{ objectFit: 'cover' }}
          className="shadow-xl rounded-2xl mx-auto mb-8 border border-1 border-gray-200 dark:invert"
          alt="solar network icon"
        />
        <Box position="relative" width="fit-content" className="animate__animated animate__fadeInUp">
          <Typography variant="h4" component="h1">
            {t('appName')}
          </Typography>
          <Box
            position="absolute"
            top={-14}
            right={-24}
            sx={{ rotate: '30deg' }}
            className="animate__animated animate__pulse animate__infinite"
          >
            <Chip
              label="2.2"
              variant="outlined"
              sx={{ fontFamily: 'monospace', backgroundColor: 'background.default', fontSize: 12 }}
            />
          </Box>
        </Box>
        <Typography variant="subtitle1" component="h1" className="animate__animated animate__fadeInUp">
          {t('appDescription')}
        </Typography>

        <Typography
          variant="subtitle1"
          fontSize={26}
          fontFamily={fontSerif.style.fontFamily}
          sx={{ mt: 2.5, width: 'fit-content', fontStyle: 'italic' }}
          className="textmarker-effect animate__animated animate__fadeInUp"
        >
          {t('appSlogan')}
        </Typography>

        <Link href="#download" sx={{ my: 2.5 }}>
          {ct('actionDownload')} <DownloadIcon sx={{ fontSize: 15, marginLeft: 0.5 }} />
        </Link>

        <Box position="relative" width="100%" sx={{ aspectRatio: 16 / 10, mt: 5 }}>
          <Image src={ImgSolarNetworkAlpha} fill alt="solar network screenshot" style={{ objectFit: 'cover' }} />
        </Box>
      </Box>

      <Box id="download">
        <Typography variant="h5" component="h2" textAlign="center" sx={{ mb: 5 }}>
          {ct('actionDownload')}
        </Typography>

        <Table sx={{ maxWidth: '800px', marginX: 'auto' }} aria-label="download table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>{ct('downloadPlatform')}</TableCell>
              <TableCell align="right">{ct('downloadDistribution')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {downloadableAssets.map((a) => (
              <TableRow key={a.href}>
                <TableCell>{a.icon}</TableCell>
                <TableCell>{a.title}</TableCell>
                <TableCell align="right">
                  <NextLink passHref href={a.href} target="_blank">
                    {a.open ? (
                      <Link component="span">
                        {ct('actionOpen')}
                        <LaunchIcon sx={{ fontSize: 15, marginLeft: 0.5 }} />
                      </Link>
                    ) : (
                      <Link component="span">
                        {ct('actionDownload')}
                        <DownloadIcon sx={{ fontSize: 15, marginLeft: 0.5 }} />
                      </Link>
                    )}
                  </NextLink>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box id="faq">
        <Typography variant="h5" component="h2" textAlign="center" sx={{ mb: 5 }}>
          {ct('faq')}
        </Typography>

        <Box sx={{ maxWidth: '800px', marginX: 'auto' }}>
          {askableQuestions.map((q) => (
            <Accordion key={q.question}>
              <AccordionSummary expandIcon={<ArrowDownward />} aria-controls="panel1-content" id="panel1-header">
                <Typography component="span">{q.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">{q.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
    </Container>
  )
}
