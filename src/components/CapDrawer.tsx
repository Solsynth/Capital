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
} from '@mui/material'
import { JSX } from 'react'
import Image from 'next/image'

import FeedIcon from '@mui/icons-material/Feed'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import InfoIcon from '@mui/icons-material/Info'
import PolicyIcon from '@mui/icons-material/Policy'
import Link from 'next/link'

interface NavLink {
  title: string
  icon: JSX.Element
  href: string
}

export function CapDrawer({ width, open, onClose }: { width: number; open: boolean; onClose: () => void }) {
  const functionLinks: NavLink[] = [
    {
      title: 'Posts',
      icon: <FeedIcon />,
      href: '/posts',
    },
    {
      title: 'Gallery',
      icon: <PhotoLibraryIcon />,
      href: '/attachments',
    },
  ]

  const additionalLinks: NavLink[] = [
    {
      title: 'About',
      icon: <InfoIcon />,
      href: '/about',
    },
    {
      title: 'Terms & Conditions',
      icon: <PolicyIcon />,
      href: '/terms',
    },
  ]

  return (
    <Drawer open={open} onClose={onClose}>
      <Box sx={{ width: width }} role="presentation" onClick={onClose}>
        <Toolbar style={{ padding: 0 }}>
          <Box display="flex" gap={2} sx={{ mx: 2 }}>
            <Image src="/logo.png" width={28} height={28} alt="company logo" style={{ objectFit: 'contain' }} />

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
            <Link passHref href={l.href} key={l.href}>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>{l.icon}</ListItemIcon>
                  <ListItemText primary={l.title} />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
        </List>
        <Divider />
        <List dense>
          {additionalLinks.map((l) => (
            <Link passHref href={l.href} key={l.href}>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>{l.icon}</ListItemIcon>
                  <ListItemText primary={l.title} />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}
