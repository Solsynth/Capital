import { JSX } from 'react'

import ConstructionIcon from '@mui/icons-material/Construction'
import FlagIcon from '@mui/icons-material/Flag'

export const SnAccountBadgeMapping: Record<string, { icon: JSX.Element; name: string }> = {
  'company.staff': {
    icon: <ConstructionIcon />,
    name: 'Solsynth Staff',
  },
  'site.migration': {
    icon: <FlagIcon />,
    name: 'Solar Network Natives',
  },
}
