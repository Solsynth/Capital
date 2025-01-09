import { AttachmentItem } from '@/components/attachments/AttachmentItem'
import { SnAttachment } from 'solar-js-sdk'
import { sni } from 'solar-js-sdk'
import { Box, ImageList, ImageListItem, Pagination, useMediaQuery, useTheme } from '@mui/material'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'

export const getServerSideProps: GetServerSideProps = async (context) => {
  let page: number = parseInt(context.query.page as string)
  if (isNaN(page)) page = 1

  const countPerPage = 20

  const { data: resp } = await sni.get<{ data: SnAttachment[]; count: number }>('/cgi/uc/attachments', {
    params: {
      take: countPerPage,
      offset: (page - 1) * countPerPage,
    },
  })

  const attachments = resp.data

  return { props: { attachments, page, pages: Math.ceil(resp.count / countPerPage) } }
}

export default function AttachmentsPage({
  attachments,
  page,
  pages,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const theme = useTheme()
  const breakpoints = useMediaQuery(theme.breakpoints.up('md'))

  return (
    <Box>
      <ImageList variant="masonry" cols={breakpoints ? 3 : 2} gap={8} sx={{ mx: 2 }}>
        {attachments.map((item: SnAttachment) => (
          <ImageListItem key={item.rid}>
            <AttachmentItem item={item} borderRadius="0" />
          </ImageListItem>
        ))}
      </ImageList>

      <Box
        sx={{
          mx: 'auto',
          mb: 5,
          mt: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          placeItems: 'center',
          gap: 1.5,
          textAlign: 'center',
        }}
      >
        <Pagination count={pages} page={page} onChange={(_, page) => router.push('/attachments?page=' + page)} />
      </Box>
    </Box>
  )
}
