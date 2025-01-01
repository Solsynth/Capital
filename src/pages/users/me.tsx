import { checkAuthenticatedClient, redirectToLogin } from '@/services/auth'
import { Container } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function UserItself() {
  useEffect(() => {
    if (!checkAuthenticatedClient()) redirectToLogin()
  }, [])

  return <Container></Container>
}
