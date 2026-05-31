export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchQuery = (query.q as string || '').trim()

  try {
    const pb = getPocketBase()

    let filter = 'approved_at != ""'
    if (searchQuery) {
      const escaped = searchQuery.replace(/"/g, '\\"')
      filter += ` && (domain ~ "${escaped}" || name ~ "${escaped}")`
    }

    const sites = await pb.collection('icp_sites').getFullList<RoyIcpSite>({
      sort: '-created',
      filter,
    })

    const config = useRuntimeConfig()
    const pbUrl = config.public.pbUrl as string

    return {
      sites: sites.map(site => ({
        id: site.id,
        filling_no: site.filling_no,
        domain: site.domain,
        name: site.name,
        description: site.description,
        site_url: site.site_url,
        icon: site.icon,
        approved: Boolean(site.approved_at),
        iconUrl: site.icon && pbUrl
          ? `${pbUrl}/api/files/icp_sites/${site.id}/${site.icon}`
          : null,
      })),
    }
  }
  catch (e) {
    console.error('Failed to fetch ICP sites:', e)
    return { sites: [] }
  }
})
