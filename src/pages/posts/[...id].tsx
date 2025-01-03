import { getAttachmentUrl, sni } from '@/services/network'
import { SnPost } from '@/services/post'
import { Alert, AlertTitle, Avatar, Box, Collapse, Container, IconButton, Link, Typography } from '@mui/material'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { unified } from 'unified'
import Image from 'next/image'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'

import CloseIcon from '@mui/icons-material/Close'

export const getServerSideProps = (async (context) => {
  const id = context.params!.id as string[]
  try {
    const { data: post } = await sni.get<SnPost>('/cgi/co/posts/' + id.join(':'))
    if (post.body.content) {
      const out = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeStringify)
        .process(post.body.content)
      post.body.content = String(out)
    }
    return { props: { post } }
  } catch (err) {
    return {
      notFound: true,
    }
  }
}) satisfies GetServerSideProps<{ post: SnPost }>

export default function Post({ post }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const link = useMemo(() => `https://sn.solsynth.dev/posts/${post.id}`, [post])

  const [openAppHint, setOpenAppHint] = useState<boolean>()

  useEffect(() => {
    if (!localStorage.getItem('sol_hide_app_hint')) {
      setOpenAppHint(true)
    }
  }, [])

  useEffect(() => {
    if (openAppHint === false) {
      localStorage.setItem('sol_hide_app_hint', 'yes')
    }
  }, [openAppHint])

  return (
    <>
      <Collapse in={openAppHint}>
        <Alert
          variant="filled"
          severity="info"
          sx={{ borderRadius: 0, px: 3 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setOpenAppHint(false)
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <AlertTitle gutterBottom={false}>Open in Solian</AlertTitle>
          All feature supported, cross-platform, the official app of Solar Network.{' '}
          <Link href={link} color="#ffffff">
            Launch
          </Link>
        </Alert>
      </Collapse>

      {post.body.thumbnail && (
        <Box sx={{ aspectRatio: 16 / 9, position: 'relative', borderBottom: 1, borderTop: 1, borderColor: 'divider' }}>
          <Image src={getAttachmentUrl(post.body.thumbnail)} alt="post thumbnail" fill />
        </Box>
      )}

      <Container sx={{ mt: 3, pb: 5 }} maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar src={getAttachmentUrl(post.publisher.avatar)} />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography fontWeight="bold">{post.publisher.nick}</Typography>
              <Typography fontFamily="monospace" fontSize={13} lineHeight={1.2}>
                @{post.publisher.name}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 2.5, maxWidth: 'unset' }} component="article" className="prose prose-lg">
          {post.body.content && <div dangerouslySetInnerHTML={{ __html: post.body.content }} />}
        </Box>
      </Container>
    </>
  )
}
