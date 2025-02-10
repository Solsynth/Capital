import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Collapse,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material'
import { GetServerSideProps } from 'next'
import { checkAuthenticatedClient, getAttachmentUrl, redirectToLogin, sni, useUserStore } from 'solar-js-sdk'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'

import PublicIcon from '@mui/icons-material/Public'
import ErrorIcon from '@mui/icons-material/Error'

export const getServerSideProps = (async (context) => {
  const id = context.params!.id as string[]
  try {
    const { data: realm } = await sni.get<any>('/cgi/id/realms/' + id)
    return { props: { realm, title: `Realm ${realm.name} / Solar Network` } }
  } catch (err) {
    console.error(err)
    return {
      notFound: true,
    }
  }
}) satisfies GetServerSideProps<{ realm: any }>

export default function Realm({ realm }: any) {
  useEffect(() => {
    if (!checkAuthenticatedClient()) redirectToLogin()
  }, [])

  const user = useUserStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joined, setJoined] = useState(false)

  const [publicChannels, setPublicChannels] = useState<any[]>([])
  const [checkedChannels, setCheckedChannels] = useState<string[]>([])

  const searchParams = useSearchParams()

  const isShare = useMemo(() => searchParams.has('share'), [searchParams])

  function handleCheckChannel(value: string) {
    const currentIndex = checkedChannels.indexOf(value)
    const newChecked = [...checkedChannels]

    if (currentIndex === -1) {
      newChecked.push(value)
    } else {
      newChecked.splice(currentIndex, 1)
    }

    setCheckedChannels(newChecked)
  }

  async function fetchPublicChannels() {
    try {
      const { data: channels } = await sni.get<any>('/cgi/im/channels/' + realm.alias)
      setPublicChannels(channels)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchPublicChannels()
  }, [realm])

  async function joinRealm() {
    setLoading(true)
    try {
      await sni.post('/cgi/id/realms/' + realm.id + '/members', {
        related: user.account!.name,
      })
      setLoading(false)
      await joinChannels()
      setJoined(true)
    } catch (err: any) {
      console.error(err)
      setError(err.toString())
    } finally {
      setLoading(false)
    }
  }

  async function joinChannels() {
    try {
      for (const chan of checkedChannels) {
        await sni.post('/cgi/im/channels/' + realm.alias + '/' + chan + '/members', {
          related: user.account!.name,
        })
      }
    } catch (err: any) {
      console.error(err)
      setError(err.toString())
    }
  }

  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        height: '100vh',
        paddingTop: '64px',
        marginTop: '-64px',
        backgroundImage: `url(${getAttachmentUrl(realm.banner ?? '')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container maxWidth="xs">
        <Card
          variant="outlined"
          className="backdrop-blur-lg"
          sx={{ backgroundColor: 'rgba(255, 255, 255, .2)', borderRadius: '16px' }}
        >
          <CardContent sx={{ px: 5, pt: 5, pb: 12 }}>
            <Avatar className="shadow-md" sx={{ width: 64, height: 64 }} src={getAttachmentUrl(realm.avatar ?? '')} />
            <Typography sx={{ mt: 3 }} variant="h5">
              {realm.name}
            </Typography>
            <Typography fontSize={13} fontFamily="monospace">
              @{realm.alias}
            </Typography>
            <Typography sx={{ mt: 3 }}>{realm.description}</Typography>

            {isShare ? (
              <Box mt={3} mx="auto" width={256}>
                <QRCodeSVG
                  title="Realm QR Code"
                  value={'https://solsynth.dev/realms/' + realm.alias}
                  level="H"
                  bgColor="#00000000"
                  fgColor={theme.palette.text.primary}
                  size={256}
                />

                <Typography textAlign="center" mt={2}>
                  Scan the QR Code above to join
                </Typography>
              </Box>
            ) : (
              <>
                {publicChannels.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography fontSize={14} mx={1} sx={{ opacity: 0.75, mb: 0.5, textAlign: 'center' }}>
                      Public channels in this realm you can join
                    </Typography>
                    <List sx={{ width: '100%', p: 0, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, .2)' }}>
                      {publicChannels.map((value) => {
                        const labelId = `checkbox-list-label-${value}`

                        return (
                          <ListItem key={value.id} disablePadding>
                            <ListItemButton
                              sx={{ borderRadius: '8px' }}
                              onClick={() => handleCheckChannel(value.alias)}
                              dense
                            >
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={checkedChannels.includes(value.alias)}
                                  tabIndex={-1}
                                  disableRipple
                                  inputProps={{ 'aria-labelledby': labelId }}
                                />
                              </ListItemIcon>
                              <ListItemText id={labelId} primary={value.name} />
                            </ListItemButton>
                          </ListItem>
                        )
                      })}
                    </List>
                  </Box>
                )}

                {realm.isCommunity && (
                  <Box sx={{ mt: 3 }}>
                    <Box display="flex" sx={{ opacity: 0.75 }}>
                      <PublicIcon />
                      <Typography sx={{ ml: 1 }} variant="body2">
                        A community realm, you can join it as you wish.
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Collapse in={!!error} sx={{ width: '100%' }}>
                  <Alert sx={{ mt: 3 }} icon={<ErrorIcon fontSize="inherit" />} severity="error">
                    {error}
                  </Alert>
                </Collapse>

                {joined ? (
                  <Alert severity="info" sx={{ mt: 2.5 }}>
                    Joined, check it out in the app
                  </Alert>
                ) : (
                  <Button fullWidth variant="contained" disabled={loading} sx={{ mt: 3 }} onClick={joinRealm}>
                    Join
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
