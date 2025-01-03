import { SnCheckInRecord } from '@/services/checkIn'
import { getAttachmentUrl, sni } from '@/services/network'
import { SnAccount, SnAccountBadgeMapping } from '@/services/user'
import { Avatar, Box, Card, CardContent, Container, Grid2 as Grid, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts'
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import Image from 'next/image'

export const getServerSideProps = (async (context) => {
  const name = context.params!.name as string
  try {
    const { data: user } = await sni.get<SnAccount>('/cgi/id/users/' + name)
    const { data: checkIn } = await sni.get<{ data: SnCheckInRecord[] }>('/cgi/id/users/' + name + '/check-in', {
      params: { take: 14 },
    })
    return { props: { user, checkIn: checkIn.data } }
  } catch (err) {
    return {
      notFound: true,
    }
  }
}) satisfies GetServerSideProps<{ user: SnAccount; checkIn: SnCheckInRecord[] }>

export default function UserProfile({ user, checkIn }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      {user.banner && (
        <Box sx={{ aspectRatio: 16 / 5, position: 'relative' }}>
          <Image src={getAttachmentUrl(user.banner)} alt="account banner" style={{ objectFit: 'cover' }} fill />
        </Box>
      )}

      <Container sx={{ mt: 4, px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {user && <Avatar src={getAttachmentUrl(user.avatar)} />}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography fontWeight="bold">{user.nick}</Typography>
              <Typography fontFamily="monospace" fontSize={13} lineHeight={1.2}>
                @{user.name}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid size={{ xs: 12, sm: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fortune History
                </Typography>
                <LineChart
                  yAxis={[
                    {
                      data: [1, 2, 3, 4, 5],
                      tickMinStep: 1,
                      tickMaxStep: 1,
                      valueFormatter(value, _) {
                        const resultTierList = ['大凶', '凶', '中平', '吉', '大吉']
                        return resultTierList[value]
                      },
                    },
                  ]}
                  xAxis={[
                    {
                      scaleType: 'band',
                      data: checkIn.map((c) => {
                        const og = new Date(c.createdAt)
                        og.setHours(0, 0, 0, 0)
                        return og
                      }),
                      valueFormatter(value, _) {
                        return new Date(value).toLocaleDateString('en-US', {
                          month: '2-digit',
                          day: '2-digit',
                        })
                      },
                    },
                  ]}
                  series={[
                    {
                      data: checkIn.map((c) => c.resultTier),
                      valueFormatter(value, _) {
                        const resultTierList = ['大凶', '凶', '中平', '吉', '大吉']
                        return resultTierList[value ?? 0]
                      },
                    },
                  ]}
                  height={300}
                  margin={{ top: 16, bottom: 24 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid
            size={{ xs: 12, sm: 12, md: 4 }}
            order={{ xs: -1, sm: -1, md: 1 }}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {user.badges && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Badges
                  </Typography>

                  <Box display="flex" flexDirection="column" gap={0.5}>
                    {user.badges.map((b) => (
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                        {SnAccountBadgeMapping[b.type].icon}
                        <Box>
                          <Typography variant="body2">{SnAccountBadgeMapping[b.type].name}</Typography>
                          {b.metadata.title && <Typography variant="subtitle2">{b.metadata.title}</Typography>}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Information
                </Typography>

                {user.description && (
                  <Typography variant="body1" gutterBottom>
                    {user.description}
                  </Typography>
                )}

                <Typography variant="body2">
                  Born on {new Date(user.profile!.birthday!).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Joined at {new Date(user.createdAt).toLocaleDateString()}
                </Typography>

                <Typography variant="overline" lineHeight={1} fontFamily="monospace">
                  #{user.id.toString().padStart(8, '0')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
