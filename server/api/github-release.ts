export default defineEventHandler(async () => {
  try {
    const data = await $fetch('https://api.github.com/repos/Solsynth/Solian/releases/latest', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    })

    return {
      tag: data.tag_name,
      name: data.name,
      body: data.body,
      url: data.html_url,
      date: data.published_at,
    }
  }
  catch {
    return null
  }
})
