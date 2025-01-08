import { AttachmentItem } from '@/components/attachments/AttachmentItem'
import { SnAttachment, listAttachment } from '@/services/attachment'
import { getAttachmentUrl, sni } from '@/services/network'
import { SnPost } from '@/services/post'
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Grid2 as Grid,
  Link,
  Pagination,
  Paper,
  Typography,
} from '@mui/material'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkBreaks from 'remark-breaks'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

type SnPostWithAttachments = SnPost & { attachments: SnAttachment[] }

export const getServerSideProps = (async (context) => {
  let page: number = parseInt(context.query.page as string)
  if (isNaN(page)) page = 1

  const countPerPage = 10

  try {
    const { data: resp } = await sni.get<{ data: SnPost[]; count: number }>('/cgi/co/posts', {
      params: {
        take: countPerPage,
        offset: (page - 1) * countPerPage,
      },
    })

    const posts: SnPostWithAttachments[] = resp.data as SnPostWithAttachments[]
    for (let idx = 0; idx < posts.length; idx++) {
      const post = posts[idx]
      if (post.body.content) {
        let processor: any = unified().use(remarkParse)
        if (post.type != 'article') {
          processor = processor.use(remarkBreaks)
        }
        post.body.content = post.body.content.replace(
          /!\[.*?\]\(solink:\/\/attachments\/([\w-]+)\)/g,
          '![alt](https://api.sn.solsynth.dev/cgi/uc/attachments/$1)',
        )
        const out = await processor
          .use(remarkRehype)
          .use(rehypeSanitize)
          .use(rehypeStringify)
          .process(post.body.content)
        post.body.rawContent = post.body.content
        post.body.content = String(out)
      }
      if (post.body.attachments) {
        post.attachments = await listAttachment(post.body.attachments)
        if (post.type == 'article') {
          post.attachments = post.attachments.filter((a) => !a.mimetype.startsWith('image'))
        }
      }
      posts[idx] = post
    }

    return { props: { posts, page, pages: Math.ceil(resp.count / countPerPage) } }
  } catch (err) {
    console.error(err)
    return {
      notFound: true,
    }
  }
}) satisfies GetServerSideProps<{ posts: SnPostWithAttachments[]; page: number; pages: number }>

export default function PostList({ posts, page, pages }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()

  return (
    <Container sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }} maxWidth="md">
      {posts.map((p) => (
        <Paper key={p.id} sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar src={getAttachmentUrl(p.publisher.avatar)} />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography fontWeight="bold">{p.publisher.nick}</Typography>
                <Typography fontFamily="monospace" fontSize={13} lineHeight={1.2}>
                  @{p.publisher.name}
                </Typography>
              </Box>
            </Box>
          </Box>

          <NextLink href={`/posts/${p.id}`} passHref>
            <Box>
              <Box sx={{ mt: 1.5, mb: 1 }} display="flex" flexDirection="column" gap={0.5}>
                {(p.body.title || p.body.content) && (
                  <Box>
                    {p.body.title && <Typography variant="h6">{p.body.title}</Typography>}
                    {p.body.description && <Typography variant="subtitle1">{p.body.description}</Typography>}
                  </Box>
                )}
                <Box display="flex" gap={2} sx={{ opacity: 0.8 }}>
                  <Typography variant="body2">
                    Published at {new Date(p.publishedAt ?? p.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ maxWidth: 'unset' }} className="prose prose-md dark:prose-invert">
                {p.body.content && <div dangerouslySetInnerHTML={{ __html: p.body.content }} />}
              </Box>
            </Box>
          </NextLink>

          {p.attachments && (
            <Grid
              container
              spacing={2}
              columns={{
                xs: 1,
                sm: Math.min(2, p.attachments.length),
                md: Math.min(3, p.attachments.length),
                lg: Math.min(4, p.attachments.length),
              }}
            >
              {p.attachments.map((a) => (
                <Grid size={1} key={a.id}>
                  <AttachmentItem item={a} />
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      ))}

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
        <Pagination count={pages} page={page} onChange={(_, page) => router.push('/posts?page=' + page)} />
        <NextLink passHref href="/posts/feed" target="_blank" prefetch={false}>
          <Link fontSize={13}>RSS Feed</Link>
        </NextLink>
      </Box>
    </Container>
  )
}
