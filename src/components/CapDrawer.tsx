import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  Toolbar,
  Typography,
  Link,
} from '@mui/material'
import { JSX } from 'react'
import Image from 'next/image'

import ExploreIcon from '@mui/icons-material/Explore'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import AppsIcon from '@mui/icons-material/Apps'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

export interface NavLink {
  title: string
  icon?: JSX.Element
  href: string
}

export function CapDrawer({ width, open, onClose }: { width: number; open: boolean; onClose: () => void }) {
  const router = useRouter()

  const functionLinks: NavLink[] = [
    {
      title: 'Explore',
      icon: <ExploreIcon />,
      href: '/posts',
    },
    {
      title: 'Gallery',
      icon: <PhotoLibraryIcon />,
      href: '/attachments',
    },
    {
      title: 'Matrix',
      icon: <AppsIcon />,
      href: '/matrix',
    },
  ]

  const additionalLinks: NavLink[] = [
    {
      title: 'Terms & Conditions',
      href: '/terms',
    },
  ]

  return (
    <Drawer open={open} onClose={onClose}>
      <Box sx={{ width: width }} role="presentation" onClick={onClose}>
        <Toolbar style={{ padding: 0 }}>
          <Box display="flex" gap={2} sx={{ mx: 2 }}>
            <Image
              src="/logo.png"
              width={28}
              height={28}
              alt="company logo"
              style={{ objectFit: 'contain' }}
              className="dark:invert"
            />

            <Box display="flex" flexDirection="column" justifyContent="center">
              <Typography variant="body2" component="h2" fontWeight="bold" lineHeight={1.4}>
                Solsynth LLC
              </Typography>
              <Typography variant="caption" component="h3" lineHeight={1} fontFamily="monospace">
                Capital
              </Typography>
            </Box>
          </Box>
        </Toolbar>
        <Divider />

        <List>
          {functionLinks.map((l) => (
            <NextLink passHref href={l.href} key={l.href}>
              <ListItem disablePadding>
                <ListItemButton selected={router.pathname == l.href}>
                  <ListItemIcon>{l.icon}</ListItemIcon>
                  <ListItemText primary={l.title} />
                </ListItemButton>
              </ListItem>
            </NextLink>
          ))}
        </List>
        <Divider />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', px: 2, py: 1.5 }}>
          {additionalLinks.map((l) => (
            <NextLink passHref href={l.href} key={l.href}>
              <Link variant="body2" color={'textSecondary'} fontSize={13}>
                {l.title}
              </Link>
            </NextLink>
          ))}
        </Box>
      </Box>
    </Drawer>
  )
}
