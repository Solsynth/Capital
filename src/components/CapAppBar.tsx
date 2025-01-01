import { useUserStore } from '@/services/user'
import { AppBar, Avatar, Box, IconButton, Toolbar, Typography, useTheme } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircle from '@mui/icons-material/AccountCircle'
import Link from 'next/link'
import { getAttachmentUrl } from '@/services/network'

export function CapAppBar() {
  const userStore = useUserStore()
  const theme = useTheme()

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={0} color={'transparent'}>
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Link href="/" passHref style={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              Capital
            </Typography>
          </Link>

          <Link href={userStore.account ? '/users/me' : '/auth/login'} passHref>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              color="inherit"
            >
              {userStore.account ? (
                <Avatar sx={{ backgroundColor: 'transparent' }} src={getAttachmentUrl(userStore.account.avatar)} />
              ) : (
                <Avatar sx={{ backgroundColor: 'transparent' }}>
                  <AccountCircle sx={{ color: theme.palette.text.primary }} />
                </Avatar>
              )}
            </IconButton>
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
