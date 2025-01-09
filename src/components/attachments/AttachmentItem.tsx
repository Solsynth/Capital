import { SnAttachment } from 'solar-js-sdk'
import { getAttachmentUrl } from 'solar-js-sdk'
import { QuestionMark } from '@mui/icons-material'
import { Link, Paper, Typography } from '@mui/material'
import { ComponentProps } from 'react'

export function AttachmentItem({
  item,
  borderRadius,
  ...rest
}: { item: SnAttachment; borderRadius?: string } & ComponentProps<'div'>) {
  switch (item.mimetype.split('/')[0]) {
    case 'image':
      return (
        <Paper {...rest}>
          <img
            src={getAttachmentUrl(item.rid)}
            alt={item.alt}
            style={{ objectFit: 'cover', borderRadius: borderRadius ?? '8px' }}
          />
        </Paper>
      )
    case 'video':
      return (
        <Paper {...rest}>
          <video src={getAttachmentUrl(item.rid)} controls style={{ borderRadius: borderRadius ?? '8px' }} />
        </Paper>
      )
    default:
      return (
        <Paper sx={{ width: '100%', height: '100%', p: 5, textAlign: 'center' }} {...rest}>
          <QuestionMark sx={{ mb: 2 }} />
          <Typography>Unknown</Typography>
          <Typography gutterBottom>{item.name}</Typography>
          <Typography fontFamily="monospace" gutterBottom>
            {item.mimetype}
          </Typography>
          <Link href={getAttachmentUrl(item.rid)} target="_blank" rel="noreferrer" fontSize={13}>
            Open in browser
          </Link>
        </Paper>
      )
  }
}
