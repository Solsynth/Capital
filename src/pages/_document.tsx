import {
  AppCacheProvider,
  DocumentHeadTags,
  DocumentHeadTagsProps,
  documentGetInitialProps,
} from '@mui/material-nextjs/v15-pagesRouter'
import { Html, Head, Main, NextScript, DocumentContext, DocumentProps } from 'next/document'
import { GoogleAnalytics } from '@next/third-parties/google'

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
          <GoogleAnalytics gaId="G-ZFJ7RX0JXF" />
        </body>
      </Html>
    </AppCacheProvider>
  )
}

Document.getInitialProps = async (ctx: DocumentContext) => {
  const finalProps = await documentGetInitialProps(ctx)
  return finalProps
}
