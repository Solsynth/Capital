import { Alert, Box, Button, CircularProgress, Collapse, Container, styled, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { checkAuthenticatedClient, redirectToLogin, UploadAttachmentTask } from 'solar-js-sdk'

import ErrorIcon from '@mui/icons-material/Error'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

export function getStaticProps() {
  return {
    props: {
      title: 'New Attachment',
    },
  }
}

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

export default function AttachmentNew() {
  useEffect(() => {
    if (!checkAuthenticatedClient()) redirectToLogin()
  }, [])

  const [file, setFile] = useState<File>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!file) return

    try {
      setBusy(true)
      const task = new UploadAttachmentTask(file, 'interactive')
      await task.submit()
    } catch (err: any) {
      setError(err.toString())
    } finally {
      setBusy(false)
    }
  }

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 64px)',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Collapse in={!!error} sx={{ width: '100%' }}>
          <Alert sx={{ mb: 4 }} icon={<ErrorIcon fontSize="inherit" />} severity="error">
            {error}
          </Alert>
        </Collapse>

        {busy ? (
          <CircularProgress />
        ) : (
          <Button component="label" variant="contained" tabIndex={-1} startIcon={<CloudUploadIcon />}>
            Upload files
            <VisuallyHiddenInput
              type="file"
              onChange={(event) => {
                if (event.target.files) setFile(event.target.files[0])
                submit()
              }}
              multiple
            />
          </Button>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontFamily="monospace" fontSize={13}>
            Pool: Interactive
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
