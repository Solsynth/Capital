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
} from '@mui/material'
import { JSX } from 'react'

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
      title: 'Term & Conditions',
      icon: <PolicyIcon />,
      href: '/terms',
    },
  ]

  return (
    <Drawer open={open} onClose={onClose}>
      <Box sx={{ width: width }} role="presentation" onClick={onClose}>
        <Toolbar>Solsynth LLC</Toolbar>
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
