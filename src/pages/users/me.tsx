import { checkAuthenticatedClient, redirectToLogin } from '@/services/auth'
import { useUserStore } from '@/services/user'
import { Avatar, Box, Container, Typography } from '@mui/material'
import { getAttachmentUrl } from '@/services/network'
import { useEffect } from 'react'
import Image from 'next/image'

export default function UserItself() {
  useEffect(() => {
    if (!checkAuthenticatedClient()) redirectToLogin()
  }, [])

  const userStore = useUserStore()

  return (
    <>
      {userStore.account && (
        <Box sx={{ aspectRatio: 16 / 5, position: 'relative' }}>
          <Image src={getAttachmentUrl(userStore.account!.banner)} alt="account banner" objectFit="cover" fill />
        </Box>
      )}

      <Container sx={{ mt: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {userStore.account && <Avatar src={getAttachmentUrl(userStore.account!.avatar)} />}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography fontWeight="bold">{userStore.account?.nick}</Typography>
              <Typography fontFamily="monospace" fontSize={13}>
                @{userStore.account?.name}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 5 }}></Box>
      </Container>
    </>
  )
}
