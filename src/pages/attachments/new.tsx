import {
  styled,
  Button,
  Container,
  Card,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  LinearProgress,
  Typography,
  Alert,
  Collapse,
} from '@mui/material'
import { MultipartProgress, SnAttachment, UploadAttachmentTask } from 'solar-js-sdk'
import { useState } from 'react'

import ErrorIcon from '@mui/icons-material/Error'
import CloseIcon from '@mui/icons-material/Close'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PlayIcon from '@mui/icons-material/PlayArrow'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

interface FileUploadTask {
  file: File
  attachment?: SnAttachment
}

export default function AttachmentNew() {
  const [files, setFiles] = useState<FileUploadTask[]>([])

  const [busy, setBusy] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [task, setTask] = useState<FileUploadTask>()
  const [taskProgress, setTaskProgress] = useState<MultipartProgress>()

  const [pool, setPool] = useState<string>('interactive')

  async function upload() {
    if (files.length == 0) return

    setBusy(true)

    for (let idx = 0; idx < files.length; idx++) {
      if (files[idx].attachment) continue

      try {
        const task = new UploadAttachmentTask(files[idx].file, pool)
        setTask(files[idx])
        task.onProgress = (progress) => setTaskProgress(progress)
        task.onError = (err) => setError(err)
        const attachment = await task.submit()
        setFiles((files) => files.map((f, i) => (i == idx ? { ...f, attachment } : f)))
      } catch (err: any) {
        setError(err.toString())
        setBusy(false)
        return
      }
    }

    setBusy(false)
  }

  return (
    <Container
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      maxWidth="xs"
    >
      <Box sx={{ width: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component="label"
            role={undefined}
            variant={files.length == 0 ? 'contained' : 'text'}
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
          >
            Pick files
            <VisuallyHiddenInput
              type="file"
              onChange={(event) =>
                setFiles(
                  Array.from(event.target.files ?? []).map((f) => ({
                    file: f,
                  })),
                )
              }
              multiple
            />
          </Button>
          {files.length > 0 && (
            <Button
              color="success"
              variant="contained"
              startIcon={<PlayIcon />}
              disabled={busy}
              onClick={() => upload()}
            >
              Upload
            </Button>
          )}
        </Box>

        <Collapse in={!!error} sx={{ width: '100%' }}>
          <Alert sx={{ mb: 5 }} icon={<ErrorIcon fontSize="inherit" />} severity="error">
            {error}
          </Alert>
        </Collapse>

        {taskProgress && (
          <Box sx={{ mt: 5, width: '100%', textAlign: 'center' }}>
            <Typography variant="body2" gutterBottom>
              {task?.file.name ?? 'Waiting...'}
            </Typography>
            <LinearProgress
              value={taskProgress?.value ? taskProgress.value * 100 : 0}
              sx={{ borderRadius: 4 }}
              variant="determinate"
            />
          </Box>
        )}

        {files.length > 0 && (
          <Box sx={{ mt: 5, width: '100%' }}>
            <Card variant="outlined">
              <List>
                {files?.map((f, idx) => (
                  <ListItem
                    dense
                    key={idx}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        disabled={busy}
                        sx={{ marginRight: 1 }}
                        onClick={() => setFiles((files) => files.filter((_, i) => i != idx))}
                      >
                        <CloseIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={f.file.name} secondary={f.attachment?.rid} />
                  </ListItem>
                ))}
              </List>
            </Card>
          </Box>
        )}

        <FormControl fullWidth sx={{ mt: 5 }}>
          <InputLabel id="attachment-pool">Attachment Pool</InputLabel>
          <Select
            labelId="attachment-pool"
            value={pool}
            disabled={busy}
            label="Attachment Pool"
            onChange={(evt) => setPool(evt.target.value)}
          >
            <MenuItem value={'interactive'}>Interactive</MenuItem>
            <MenuItem value={'messaging'}>Messaging</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Container>
  )
}
