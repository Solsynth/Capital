export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const fillingNo = (query.filling_no as string || '').trim()

  if (!fillingNo) {
    throw createError({ statusCode: 400, statusMessage: 'filling_no is required' })
  }

  try {
    const pb = getPocketBase()
    const escaped = fillingNo.replace(/"/g, '\\"')

    const results = await pb.collection('icp_sites').getList<RoyIcpSite & { expand?: { identity: RoyIcpIdentity; user: { id: string; name: string; email: string } } }>(1, 1, {
      filter: `filling_no = "${escaped}"`,
      expand: 'identity,user',
    })

    const site = results.items[0]
    if (!site) {
      throw createError({ statusCode: 404, statusMessage: 'Site not found' })
    }

    const config = useRuntimeConfig()
    const pbUrl = config.public.pbUrl as string

    return {
      site: {
        id: site.id,
        filling_no: site.filling_no,
        domain: site.domain,
        name: site.name,
        description: site.description,
        site_url: site.site_url,
        icon: site.icon,
        categories: site.categories,
        approved_at: site.approved_at,
        created: site.created,
        updated: site.updated,
        iconUrl: site.icon && pbUrl
          ? `${pbUrl}/api/files/icp_sites/${site.id}/${site.icon}`
          : null,
        identity: site.expand?.identity
          ? {
              id: site.expand.identity.id,
              name: site.expand.identity.name,
              description: site.expand.identity.description,
              icon: site.expand.identity.icon,
              iconUrl: site.expand.identity.icon && pbUrl
                ? `${pbUrl}/api/files/icp_identities/${site.expand.identity.id}/${site.expand.identity.icon}`
                : null,
            }
          : null,
        owner: site.expand?.user
          ? {
              id: site.expand.user.id,
              name: site.expand.user.name,
              email: site.expand.user.email,
            }
          : null,
      },
    }
  }
  catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Failed to fetch ICP site detail:', e)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch site' })
  }
})
