import { Box, Container, Divider, Typography } from '@mui/material'

export async function getStaticProps() {
  return {
    props: {
      title: 'Privacy Policy',
    },
  }
}

export default function PrivacyPolicy() {
  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" sx={{ mt: 2, mb: 5 }}>
        Privacy Policy
      </Typography>

      <Divider />

      <Box component="article" sx={{ my: 5, maxWidth: 'unset' }} className="prose prose-lg dark:prose-invert">
        <h2 id="introduction">Introduction</h2>
        <p>
          We take your privacy seriously. This privacy policy outlines the types of personal information we collect, how
          we use it, and the measures we take to protect your data.
        </p>
        <h2 id="information-collection">Information Collection</h2>
        <p>
          We collect personal information only when necessary to provide our services. This may include your name, email
          address, and other relevant details.
        </p>
        <h2 id="use-of-information">Use of Information</h2>
        <p>We use your personal information to:</p>
        <ul>
          <li>Provide and improve our services</li>
          <li>Communicate with you about updates or important information</li>
          <li>Ensure compliance with legal obligations</li>
        </ul>
        <h2 id="data-sharing">Data Sharing</h2>
        <p>We do not sell, trade, or share your personal information with third parties except as required by law.</p>
        <h2 id="data-security">Data Security</h2>
        <p>
          We implement robust security measures to protect your personal information from unauthorized access,
          alteration, disclosure, or destruction.
        </p>
        <h2 id="your-rights">Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request corrections to your personal information</li>
          <li>Request the deletion of your personal information</li>
        </ul>
        <h2 id="contact-us">Contact Us</h2>
        <p>
          If you have any questions or concerns about this privacy policy or our data practices, please contact us at
          lily@solsynth.dev.
        </p>
        <h2 id="changes-to-this-policy">Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. Any changes will be posted on this page, and we will
          notify you of any significant changes.
        </p>
      </Box>
    </Container>
  )
}
