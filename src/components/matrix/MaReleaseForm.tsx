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
  Card,
} from '@mui/material'
import { useRouter } from 'next-nprogress-bar'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  MaProduct,
  MaRelease,
  MaReleaseAsset,
  MaReleaseInstaller,
  MaReleaseInstallerPatch,
  MaReleaseRunner,
} from 'solar-js-sdk'
import MonacoEditor from '@monaco-editor/react'

import ErrorIcon from '@mui/icons-material/Error'
import CloseIcon from '@mui/icons-material/Close'

export interface MatrixReleaseForm {
  version: string
  type: number
  channel: string
  title: string
  description: string
  content: string
  assets: Record<string, MaReleaseAsset>
  installers: Record<string, MaReleaseInstaller>
  runners: Record<string, MaReleaseRunner>
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
  defaultValue?: MaRelease
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
    if (defaultValue?.assets) {
      setAssets(Object.keys(defaultValue.assets).map((k) => ({ k, v: defaultValue.assets[k] })))
    }
    if (defaultValue?.installers) {
      setInstallers(Object.keys(defaultValue.installers).map((k) => ({ k, v: defaultValue.installers[k] })))
    }
    if (defaultValue?.runners) {
      setRunners(Object.keys(defaultValue.runners).map((k) => ({ k, v: defaultValue.runners[k] })))
    }
  }, [])

  const router = useRouter()

  const [assets, setAssets] = useState<{ k: string; v: MaReleaseAsset }[]>([])
  const [installers, setInstallers] = useState<{ k: string; v: MaReleaseInstaller }[]>([])
  const [runners, setRunners] = useState<{ k: string; v: MaReleaseRunner }[]>([])

  function addAsset() {
    setAssets((val) => [...val, { k: '', v: { uri: '', contentType: '' } }])
  }

  function addInstaller() {
    setInstallers((val) => [...val, { k: '', v: { workdir: '', script: '', patches: [] } }])
  }

  function addRunner() {
    setRunners((val) => [...val, { k: '', v: { workdir: '', script: '', label: '' } }])
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
      await onSubmit({
        ...data,
        assets: assets.reduce((a, { k, v }) => ({ ...a, [k]: v }), {}),
        installers: installers.reduce((a, { k, v }) => ({ ...a, [k]: v }), {}),
        runners: runners.reduce((a, { k, v }) => ({ ...a, [k]: v }), {}),
      })
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
          <Select
            labelId="release-type"
            label="Type"
            defaultValue={defaultValue?.type}
            {...register('type', { required: true })}
          >
            <MenuItem value={0}>Full Release</MenuItem>
            <MenuItem value={1}>Patch Release</MenuItem>
          </Select>
        </FormControl>

        <TextField label="Title" {...register('title')} />

        <TextField label="Alias" {...register('channel')} />

        <TextField minRows={3} maxRows={3} multiline label="Description" {...register('description')} />

        <TextField minRows={5} multiline label="Content" {...register('content')} />

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5">Assets</Typography>

          {assets.map(({ k, v }, idx) => (
            <Card variant="outlined" key={idx}>
              <Box sx={{ pl: 2, pr: 4, py: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={11}>
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
                  <Grid size={1} sx={{ display: 'grid', placeItems: 'center' }}>
                    <IconButton
                      onClick={() => {
                        setAssets((data) => data.filter((_, index) => index != idx))
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Grid>
                  <Grid size={8}>
                    <TextField
                      label="URI"
                      sx={{ width: '100%' }}
                      value={v.uri}
                      onChange={(val) => {
                        setAssets((data) =>
                          data.map((ele, index) =>
                            index == idx ? { v: { ...ele.v, uri: val.target.value }, k: ele.k } : ele,
                          ),
                        )
                      }}
                    />
                  </Grid>
                  <Grid size={4}>
                    <TextField
                      label="Content Type"
                      sx={{ width: '100%' }}
                      value={v.contentType}
                      onChange={(val) => {
                        setAssets((data) =>
                          data.map((ele, index) =>
                            index == idx ? { v: { ...ele.v, contentType: val.target.value }, k: ele.k } : ele,
                          ),
                        )
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Card>
          ))}

          <Box>
            <Button variant="outlined" onClick={addAsset}>
              Add
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5">Installers</Typography>

          {installers.map(({ k, v }, idx) => (
            <Card variant="outlined" key={idx}>
              <Box sx={{ pl: 2, pr: 4, py: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={4}>
                    <TextField
                      label="Platform"
                      sx={{ width: '100%' }}
                      value={k}
                      onChange={(val) => {
                        setInstallers((data) =>
                          data.map((ele, index) => (index == idx ? { k: val.target.value, v: ele.v } : ele)),
                        )
                      }}
                    />
                  </Grid>
                  <Grid size={7}>
                    <TextField
                      label="Working Directory"
                      sx={{ width: '100%' }}
                      value={v.workdir}
                      onChange={(val) => {
                        setInstallers((data) =>
                          data.map((ele, index) =>
                            index == idx ? { k: ele.k, v: { ...ele.v, workdir: val.target.value } } : ele,
                          ),
                        )
                      }}
                    />
                  </Grid>
                  <Grid size={1} sx={{ display: 'grid', placeItems: 'center' }}>
                    <IconButton
                      onClick={() => {
                        setInstallers((data) => data.filter((_, index) => index != idx))
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="subtitle1" sx={{ mx: 1 }}>
                      Script
                    </Typography>
                    <Card variant="outlined">
                      <MonacoEditor
                        height="140px"
                        width="100%"
                        options={{ minimap: { enabled: false } }}
                        defaultValue={v.script}
                        onChange={(val) =>
                          setInstallers((data) =>
                            data.map((ele, index) => (index == idx ? { v: { ...ele.v, script: val }, k: ele.k } : ele)),
                          )
                        }
                      />
                    </Card>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="subtitle1" sx={{ mx: 1 }}>
                      Patches
                    </Typography>
                    <Card variant="outlined">
                      <MonacoEditor
                        height="140px"
                        width="100%"
                        options={{ minimap: { enabled: false } }}
                        defaultValue={v.patches.map((p) => `${p.action}:${p.glob}`).join('\n')}
                        onChange={(val) =>
                          setInstallers((data) =>
                            data.map((ele, index) =>
                              index == idx
                                ? {
                                    v: {
                                      ...ele.v,
                                      patches: val?.split('\n')?.map((p) => ({
                                        action: p.split(':')[0],
                                        glob: p.split(':')[1],
                                      })) as MaReleaseInstallerPatch[],
                                    },
                                    k: ele.k,
                                  }
                                : ele,
                            ),
                          )
                        }
                      />
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          ))}

          <Box>
            <Button variant="outlined" onClick={addInstaller}>
              Add
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5">Runners</Typography>

          {runners.map(({ k, v }, idx) => (
            <Card variant="outlined" key={idx}>
              <Box sx={{ pl: 2, pr: 4, py: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={4}>
                    <TextField
                      label="Platform"
                      sx={{ width: '100%' }}
                      value={k}
                      onChange={(val) => {
                        setRunners((data) =>
                          data.map((ele, index) => (index == idx ? { k: val.target.value, v: ele.v } : ele)),
                        )
                      }}
                    />
                  </Grid>
                  <Grid size={7}>
                    <TextField
                      label="Working Directory"
                      sx={{ width: '100%' }}
                      value={v.workdir}
                      onChange={(val) => {
                        setRunners((data) =>
                          data.map((ele, index) =>
                            index == idx ? { k: ele.k, v: { ...ele.v, workdir: val.target.value } } : ele,
                          ),
                        )
                      }}
                    />
                  </Grid>
                  <Grid size={1} sx={{ display: 'grid', placeItems: 'center' }}>
                    <IconButton
                      onClick={() => {
                        setRunners((data) => data.filter((_, index) => index != idx))
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Label"
                      sx={{ width: '100%' }}
                      value={v.label}
                      onChange={(val) => {
                        setRunners((data) =>
                          data.map((ele, index) =>
                            index == idx ? { k: ele.k, v: { ...ele.v, label: val.target.value } } : ele,
                          ),
                        )
                      }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="subtitle1" sx={{ mx: 1 }}>
                      Script
                    </Typography>
                    <Card variant="outlined">
                      <MonacoEditor
                        height="280px"
                        width="100%"
                        options={{ minimap: { enabled: false } }}
                        defaultValue={v.script}
                        onChange={(val) =>
                          setRunners((data) =>
                            data.map((ele, index) =>
                              index == idx ? { v: { ...ele.v, script: val ?? '' }, k: ele.k } : ele,
                            ),
                          )
                        }
                      />
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          ))}

          <Box>
            <Button variant="outlined" onClick={addRunner}>
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
