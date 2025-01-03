import { checkAuthenticatedClient, redirectToLogin } from '@/services/auth'
import { useUserStore } from '@/services/user'
import { Avatar, Box, Button, Container, Typography } from '@mui/material'
import { getAttachmentUrl } from '@/services/network'
import { useEffect } from 'react'
import Image from 'next/image'

import LogoutIcon from '@mui/icons-material/Logout'
import LaunchIcon from '@mui/icons-material/Launch'
import Link from 'next/link'
import { deleteCookie } from 'cookies-next/client'

export default function UserItself() {
  useEffect(() => {
    if (!checkAuthenticatedClient()) redirectToLogin()
  }, [])

  const userStore = useUserStore()

  function logout() {
    deleteCookie('nex_user_atk')
    deleteCookie('nex_user_rtk')
    window.location.reload()
  }

  return (
    <>
      {userStore.account?.banner && (
        <Box sx={{ aspectRatio: 16 / 5, position: 'relative' }}>
          <Image src={getAttachmentUrl(userStore.account!.banner)} alt="account banner" objectFit="cover" fill />
        </Box>
      )}

      <Container sx={{ mt: 4, px: 2 }}>
        <Typography variant="h5" component="h1">
          Your Solarpass
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {userStore.account && <Avatar src={getAttachmentUrl(userStore.account.avatar)} />}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography fontWeight="bold">{userStore.account?.nick}</Typography>
              <Typography fontFamily="monospace" fontSize={13} lineHeight={1.2}>
                @{userStore.account?.name}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Link passHref href="https://sn.solsynth.dev/account" target="_blank">
            <Button variant="contained" color="primary" startIcon={<LaunchIcon />}>
              Open in Solian
            </Button>
          </Link>
          <Button variant="contained" color="error" startIcon={<LogoutIcon />} onClick={logout}>
            Logout
          </Button>
        </Box>
      </Container>
    </>
  )
}
