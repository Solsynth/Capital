import {
  AppCacheProvider,
  DocumentHeadTags,
  DocumentHeadTagsProps,
  documentGetInitialProps,
} from '@mui/material-nextjs/v15-pagesRouter'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Html, Head, Main, NextScript, DocumentContext, DocumentProps } from 'next/document'

export default function Document(props: DocumentProps & DocumentHeadTagsProps) {
  return (
    <AppCacheProvider {...props}>
      <Html lang="en">
        <Head>
          <DocumentHeadTags {...props} />
        </Head>
        <body className="antialiased">
          <Main />
          <NextScript />
          <SpeedInsights />
        </body>
      </Html>
    </AppCacheProvider>
  )
}

Document.getInitialProps = async (ctx: DocumentContext) => {
  const finalProps = await documentGetInitialProps(ctx)
  return finalProps
}
