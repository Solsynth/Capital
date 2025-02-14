import { Box, Container, Divider, Typography } from '@mui/material'

export async function getStaticProps() {
  return {
    props: {
      title: 'User Agreements',
    },
  }
}

export default function PrivacyPolicy() {
  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" sx={{ mt: 2, mb: 5 }}>
        User Agreements
      </Typography>

      <Divider />

      <Box component="article" sx={{ my: 5, maxWidth: 'unset' }} className="prose prose-lg dark:prose-invert">
        <p>
          This Agreement applies to all Solsynth LLC products, including but not limited to Solar Network, Solian,
          DietaryGuard, AceField.
        </p>
        <h2 id="provision-and-discontinuance-of-service">Provision and Discontinuance of Service</h2>
        <p>
          Solsynth LLC will provide equal service to all living things in the world, including grasshoppers. We also
          reserve the right to stop service to any user. We do not require prior notice for discontinuing services to
          some users.
        </p>
        <h2 id="user-generated-content">User Generated Content</h2>
        <p>
          Any content posted on Solar Network (including but not limited to posts, articles, attachments) grants
          Solsynth LLC the right to display it by default. Unless otherwise stated by the user, all rights are reserved
          by the original poster, and reprints should be authorized by the original poster.
        </p>
        <h3 id="reproduction-recognition">Reproduction Recognition</h3>
        <p>
          Unless specifically stated by the poster, all content is subject to the definition of reprint in this section.
        </p>
        <p>
          Republishing means uploading the content of the original post to another platform or to the Solar Network,
          either unchanged or with minor modifications, provided that simultaneous reposting of the post, embedded
          components, and links to the presentation do not constitute republishing. Republishing also requires
          attribution when authorized by the original poster.
        </p>
        <h3 id="freedom-of-speech">Freedom of Speech</h3>
        <p>
          We do not remove user-generated content except in cases of misuse of resources. We will not ask any user to
          remove any content.
        </p>
        <p>
          However, Solsynth LLC reserves the right to restrict and stop the display of content to the public that
          violates community guidelines (e.g., obscenity, violence, gore, anti-social, terrorist organizations, etc.).
        </p>
        <p>
          Although you have 100% freedom of speech on Solar Network. However, please be aware that freedom of speech
          does not mean that you will not be held accountable for what you say.
        </p>
        <h4 id="the-branding-issue">The Impersonating Issue</h4>
        <p>
          You cannot impersonating us (the Solsynth LLC) in anyways. For example like using our logos, our product name,
          or our name. Otherwise we have the right to remove / suspend your account.
        </p>
        <h4 id="restriction-and-discontinuation">Restriction and Discontinuation</h4>
        <ul>
          <li>
            <p>
              Restriction of Display: Discontinuation of related tweets, while retaining the right to access them
              directly through resource identifiers and sharing links.
            </p>
          </li>
          <li>
            <p>Cease display: stop all access to the resource by anyone other than the author.</p>
          </li>
        </ul>
        <h2 id="resource-misuse-prevention-policy">Resource Misuse Prevention Policy</h2>
        <p>
          Although there are no capacity limitations for using Solar Network&#39;s data hosting services, resources
          determined to be abusive will be disenfranchised from some features. Solsynth LLC reserves the right to
          reclaim space on previously uploaded resources for deletion.
        </p>
        <h3 id="determination-of-misuse">Determination of Misuse</h3>
        <ul>
          <li>
            Uploading without using: e.g. uploading excessive attachments in Solar Network&#39;s Interactive Attachment
            Pool and not linking them to posts.
          </li>
          <li>Meaningless Posts: meaningless shuffling or wasting of Solar Network&#39;s storage resources</li>
          <li>
            Misuse: using Solar Network&#39;s public resources as if they were your own dedicated pool (see the
            Wiki&#39;s Dedicated Pools page for details).
          </li>
        </ul>
        <p>The Solsynth Trust &amp; Safety Team is ultimately responsible for determining misuse.</p>
        <h2 id="secondary-releases">Secondary Releases</h2>
        <p>A secondary release is when our assets are downloaded and re-hosted on another site.</p>
        <h3 id="product-secondary-release">Product Secondary Release</h3>
        <p>
          Unless otherwise stated, Solsynth LLC products are not available for secondary distribution, please do not
          download our product builds and upload them twice to another site. Please do not download our product builds
          and upload them to other sites. <strong>Secondary distribution for commercial use is not permitted.</strong>.
        </p>
        <p>
          What you should do is post a link to our product on another site. Or use the embedded component. And indicate
          Solsynth LLC All Rights Reserved.
        </p>
        <p>If you want to build a mirror site of our products, please contact us to waive this rule.</p>
        <h3 id="secondary-distribution-of-source-code">Secondary distribution of source code</h3>
        <p>
          We do not allow any form of redistribution of source code (except for Forks). This includes, but is not
          limited to, mirroring code repositories on GitHub or the Solsynth Code Repository to other Git providers such
          as GitLab, Gitee, and so on.
          <strong>Selling source code twice is not allowed. </strong>
        </p>
        <p>
          For more information on source code usage regulations, please follow the open source license used by the
          project.
        </p>
        <p>If you would like to set up a mirror of our source code, please contact us to waive this policy.</p>
        <hr />
        <p>Solsynth LLC reserves the right of final interpretation of this agreement.</p>
      </Box>
    </Container>
  )
}
