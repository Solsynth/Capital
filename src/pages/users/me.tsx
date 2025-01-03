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
      {userStore.account?.banner && (
        <Box sx={{ aspectRatio: 16 / 5, position: 'relative' }}>
          <Image src={getAttachmentUrl(userStore.account!.banner)} alt="account banner" objectFit="cover" fill />
        </Box>
      )}

      <Container sx={{ mt: 4, px: 2 }}>
        <Typography variant="h5" component="h1">
          Your Solarpass
        </Typography>
      </Container>
    </>
  )
}
