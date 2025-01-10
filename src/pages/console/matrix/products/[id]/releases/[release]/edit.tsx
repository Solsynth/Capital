import { ConsoleLayout, getConsoleStaticProps } from '@/components/layouts/ConsoleLayout'
import { Typography, Container, Box } from '@mui/material'
import { sni } from 'solar-js-sdk'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import MaReleaseForm, { MatrixReleaseForm } from '@/components/matrix/MaReleaseForm'

export const getServerSideProps: GetServerSideProps = (async (context) => {
  const id = context.params!.id
  const releaseId = context.params!.release

  const { data } = await sni.get<any>('/cgi/ma/products/' + id + '/releases/' + releaseId)

  return getConsoleStaticProps({
    props: {
      title: `Edit Release "${data.name}"`,
      release: data,
    },
  })
}) satisfies GetServerSideProps<{ release: any }>

export default function ProductEdit({ release }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  async function onSubmit(data: MatrixReleaseForm) {
    await sni.put('/cgi/ma/products/' + release.id + '/releases/' + release.productId, data)
  }

  return (
    <ConsoleLayout>
      <Container sx={{ py: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box>
          <Typography variant="h3" component="h1">
            Edit releases
          </Typography>
          <Typography variant="subtitle1">{release.meta.title}</Typography>
        </Box>

        <MaReleaseForm onSubmit={onSubmit} defaultValue={release} parent={{ id: release.productId }} />
      </Container>
    </ConsoleLayout>
  )
}
