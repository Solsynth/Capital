import { SnAttachment } from '@/services/attachment'
import { getAttachmentUrl } from '@/services/network'
import { QuestionMark } from '@mui/icons-material'
import { Link, Paper, Typography } from '@mui/material'

export function AttachmentItem({ item }: { item: SnAttachment }) {
  switch (item.mimetype.split('/')[0]) {
    case 'image':
      return (
        <Paper>
          <img src={getAttachmentUrl(item.rid)} alt={item.alt} style={{ objectFit: 'cover', borderRadius: '8px' }} />
        </Paper>
      )
    case 'video':
      return (
        <Paper>
          <video src={getAttachmentUrl(item.rid)} controls style={{ borderRadius: '8px' }} />
        </Paper>
      )
    default:
      return (
        <Paper sx={{ width: '100%', height: '100%', p: 5, textAlign: 'center' }}>
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
