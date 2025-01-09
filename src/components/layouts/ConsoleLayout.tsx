import { checkAuthenticatedClient, redirectToLogin } from '@/services/auth'
import { JSX, useEffect } from 'react'
import { DashboardLayout, Navigation } from '@toolpad/core'
import { Stack, Typography } from '@mui/material'
import NextLink from 'next/link'

import AppsIcon from '@mui/icons-material/Apps'

export function ConsoleLayout({ children }: { children: JSX.Element }) {
  useEffect(() => {
    if (!checkAuthenticatedClient()) redirectToLogin()
  }, [])

  const navigation: Navigation = [
    {
      segment: 'console/matrix',
      title: 'Matrix',
      icon: <AppsIcon />,
    },
  ]

  return (
    <DashboardLayout
      navigation={navigation}
      branding={{
        homeUrl: '/console',
      }}
      slots={{
        appTitle(_) {
          return (
            <Stack direction="row" alignItems="center" spacing={2}>
              <NextLink passHref href="/console">
                <Typography variant="h6">Solar Network Console</Typography>
              </NextLink>
            </Stack>
          )
        },
      }}
      sidebarExpandedWidth={300}
      defaultSidebarCollapsed
    >
      {children}
    </DashboardLayout>
  )
}

export function getConsoleStaticProps(original: any) {
  if (original.props.title) {
    original.props.title = 'Console | ' + original.props.title
  }
  original.props.showAppBar = false

  return original
}
