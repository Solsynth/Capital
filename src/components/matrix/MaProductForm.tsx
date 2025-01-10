import { Collapse, Alert, TextField, Button, Box } from '@mui/material'
import { useRouter } from 'next-nprogress-bar'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MaProduct } from 'solar-js-sdk'

import ErrorIcon from '@mui/icons-material/Error'

export interface MatrixProductForm {
  name: string
  alias: string
  description: string
  introduction: string
}

export default function MaProductForm({
  onSubmit,
  onSuccess,
  defaultValue,
}: {
  onSubmit: (data: MatrixProductForm) => Promise<any>
  onSuccess?: () => void
  defaultValue?: MaProduct
}) {
  const { handleSubmit, register } = useForm<MatrixProductForm>({
    defaultValues: {
      name: defaultValue?.name ?? '',
      alias: defaultValue?.alias ?? '',
      description: defaultValue?.description ?? '',
      introduction: defaultValue?.meta?.introduction ?? '',
    },
  })

  const router = useRouter()

  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<boolean>(false)

  function callback() {
    if (onSuccess) {
      onSuccess()
    } else {
      router.push('/console/matrix')
    }
  }

  async function submit(data: MatrixProductForm) {
    try {
      setBusy(true)
      await onSubmit(data)
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

        <TextField label="Name" {...register('name')} />

        <TextField label="Alias" {...register('alias')} />

        <TextField minRows={3} maxRows={3} multiline label="Description" {...register('description')} />

        <TextField minRows={5} multiline label="Introduction" {...register('introduction')} />

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
