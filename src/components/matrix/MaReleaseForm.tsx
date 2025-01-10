import {
  Collapse,
  Alert,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Grid2 as Grid,
  IconButton,
} from '@mui/material'
import { useRouter } from 'next-nprogress-bar'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import ErrorIcon from '@mui/icons-material/Error'
import CloseIcon from '@mui/icons-material/Close'
import { MaProduct } from 'solar-js-sdk'
import { version } from 'node:os'

export interface MatrixReleaseForm {
  version: string
  type: number
  channel: string
  title: string
  description: string
  content: string
  assets: Record<string, any>
  attachments: string[]
}

export default function MaReleaseForm({
  onSubmit,
  onSuccess,
  parent,
  defaultValue,
}: {
  onSubmit: (data: MatrixReleaseForm) => Promise<any>
  onSuccess?: () => void
  parent: Partial<MaProduct>
  defaultValue?: any
}) {
  const { handleSubmit, register } = useForm<MatrixReleaseForm>({
    defaultValues: {
      title: defaultValue?.meta.title,
      version: defaultValue?.version,
      type: defaultValue?.type ?? 0,
      channel: defaultValue?.channel,
      description: defaultValue?.meta.description,
      content: defaultValue?.meta.content,
      attachments: defaultValue?.meta.attachments,
    },
  })

  useEffect(() => {
    if (defaultValue) {
      setAssets(Object.keys(defaultValue.assets).map((k) => ({ k, v: defaultValue.assets[k] })))
    }
  }, [])

  const router = useRouter()

  const [assets, setAssets] = useState<{ k: string; v: string }[]>([])

  function addAsset() {
    setAssets((val) => [...val, { k: '', v: '' }])
  }

  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<boolean>(false)

  function callback() {
    if (onSuccess) {
      onSuccess()
    } else {
      router.push(`/console/matrix/products/${parent?.id}`)
    }
  }

  async function submit(data: MatrixReleaseForm) {
    try {
      setBusy(true)
      await onSubmit({ ...data, assets: assets.reduce((a, { k, v }) => ({ ...a, [k]: v }), {}) })
      callback()
    } catch (err: any) {
      setError(err.toString())
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Box display="flex" flexDirection="column" maxWidth="sm" gap={2.5}>
        <Collapse in={!!error} sx={{ width: '100%' }}>
          <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error">
            {error}
          </Alert>
        </Collapse>

        <TextField label="Version" placeholder="Major.Minor.Patch" {...register('version', { required: true })} />

        <FormControl fullWidth>
          <InputLabel id="release-type">Type</InputLabel>
          <Select labelId="release-type" label="Type" {...register('type', { required: true })}>
            <MenuItem value={0}>Full Release</MenuItem>
            <MenuItem value={1}>Patch Release</MenuItem>
          </Select>
        </FormControl>

        <TextField label="Title" {...register('title')} />

        <TextField label="Alias" {...register('channel')} />

        <TextField minRows={3} maxRows={3} multiline label="Description" {...register('description')} />

        <TextField minRows={5} multiline label="Content" {...register('content')} />

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1">Assets</Typography>

          {assets.map(({ k, v }, idx) => (
            <Grid container key={idx} spacing={2}>
              <Grid size={4}>
                <TextField
                  label="Platform"
                  sx={{ width: '100%' }}
                  value={k}
                  onChange={(val) => {
                    setAssets((data) =>
                      data.map((ele, index) => (index == idx ? { k: val.target.value, v: ele.v } : ele)),
                    )
                  }}
                />
              </Grid>
              <Grid size={7}>
                <TextField
                  label="URL"
                  sx={{ width: '100%' }}
                  value={v}
                  onChange={(val) => {
                    setAssets((data) =>
                      data.map((ele, index) => (index == idx ? { v: val.target.value, k: ele.k } : ele)),
                    )
                  }}
                />
              </Grid>
              <Grid size={1} sx={{ display: 'grid', placeItems: 'center' }}>
                <IconButton
                  onClick={() => {
                    setAssets((data) => data.filter((_, index) => index != idx))
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Box>
            <Button variant="outlined" onClick={addAsset}>
              Add
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 5 }} display="flex" gap={2}>
          <Button variant="contained" type="submit" disabled={busy}>
            Submit
          </Button>
          <Button onClick={callback} variant="outlined" disabled={busy}>
            Cancel
          </Button>
        </Box>
      </Box>
    </form>
  )
}
