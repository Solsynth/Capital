import { ConsoleLayout, getConsoleStaticProps } from '@/components/layouts/ConsoleLayout'
import { Typography, Container, Box, Button, TextField, Collapse, Alert } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { sni } from '@/services/network'

import ErrorIcon from '@mui/icons-material/Error'

export async function getStaticProps() {
  return getConsoleStaticProps({
    props: {
      title: 'Matrix',
    },
  })
}

interface MatrixProductNewForm {
  name: string
  alias: string
  description: string
  introduction: string
}

export default function ProductNew() {
  const { handleSubmit, register } = useForm<MatrixProductNewForm>()

  const router = useRouter()

  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<boolean>(false)

  async function onSubmit(data: any) {
    try {
      setBusy(true)
      await sni.post('/cgi/ma/products', data)
      router.push('/console/matrix')
    } catch (err: any) {
      setError(err.toString())
    } finally {
      setBusy(false)
    }
  }

  return (
    <ConsoleLayout>
      <Container sx={{ py: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography variant="h3" component="h1">
          Create a product
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
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
                Create
              </Button>
              <NextLink passHref href="/console/matrix">
                <Button disabled={busy}>Cancel</Button>
              </NextLink>
            </Box>
          </Box>
        </form>
      </Container>
    </ConsoleLayout>
  )
}
