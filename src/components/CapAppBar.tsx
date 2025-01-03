import { useUserStore } from '@/services/user'
import {
  AppBar,
  AppBarProps,
  Avatar,
  createTheme,
  IconButton,
  ThemeProvider,
  Toolbar,
  Typography,
  useScrollTrigger,
  useTheme,
} from '@mui/material'
import { getAttachmentUrl } from '@/services/network'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircle from '@mui/icons-material/AccountCircle'
import Link from 'next/link'
import React from 'react'

interface ElevationAppBarProps {
  elevation?: number
  color?: any
  children?: React.ReactElement<{ elevation?: number } & AppBarProps>
}

function ElevationScroll(props: ElevationAppBarProps) {
  if (typeof window === 'undefined') return props.children

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window,
  })

  const commonStyle = {
    transition: 'all',
    transitionDuration: '300ms',
  }

  return props.children
    ? React.cloneElement(props.children, {
        elevation: trigger ? props.elevation : 0,
        sx: trigger
          ? { backgroundColor: props.color, color: 'black', ...commonStyle }
          : { backgroundColor: 'transparent', ...commonStyle },
      })
    : null
}

export function CapAppBar() {
  const userStore = useUserStore()
  const theme = useTheme()

  return (
    <ElevationScroll elevation={2} color="white">
      <AppBar position="sticky" elevation={0} color="transparent">
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
    </ElevationScroll>
  )
}
