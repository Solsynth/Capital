import { createRelease as dbCreateRelease, getReleaseByVersion, updateRelease } from "#server/utils/products"
import { nanoid } from "nanoid"

const GITHUB_API = "https://api.github.com"

async function getGithubToken(): Promise<string | null> {
  // Prefer PAT for simple releases, fall back to App token if available
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN

  try {
    const { getGithubAppToken } = await import("#server/utils/github")
    return await getGithubAppToken()
  } catch {
    return null
  }
}

function parseRepoString(repo: string): { owner: string; repo: string } | null {
  // Accepts "owner/repo" or full URL "https://github.com/owner/repo"
  const urlMatch = repo.match(/github\.com\/([^\/]+)\/([^\/\s]+)/)
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, "") }

  const simpleMatch = repo.match(/^([^\/]+)\/([^\/\s]+)$/)
  if (simpleMatch) return { owner: simpleMatch[1], repo: simpleMatch[2] }

  return null
}

export interface PublishReleaseOptions {
  slug: string
  version: string
  releasedAt: Date
  title?: string
  changelog?: string
  downloadUrl?: string
  isPrerelease?: boolean
  minimumVersion?: string
  githubRepo?: string
  syncToGithub?: boolean
}

export interface PublishResult {
  release: any
  githubSynced: boolean
  githubUrl?: string
  githubError?: string
}

export async function publishRelease(opts: PublishReleaseOptions): Promise<PublishResult> {
  const id = nanoid()
  let githubSynced = false
  let githubUrl: string | undefined
  let githubError: string | undefined
  let githubReleaseId: string | undefined
  let syncStatus = "pending"

  // Attempt GitHub sync if requested and repo is available
  if (opts.syncToGithub && opts.githubRepo) {
    const parsed = parseRepoString(opts.githubRepo)
    if (parsed) {
      const token = await getGithubToken()
      if (token) {
        try {
          const releaseTag = opts.version.startsWith("v") ? opts.version : `v${opts.version}`
          const resp = await fetch(
            `${GITHUB_API}/repos/${parsed.owner}/${parsed.repo}/releases`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
              },
              body: JSON.stringify({
                tag_name: releaseTag,
                name: opts.title || `v${opts.version}`,
                body: opts.changelog || "",
                draft: false,
                prerelease: opts.isPrerelease ?? false,
              }),
            },
          )

          if (resp.ok) {
            const ghRelease = await resp.json()
            githubReleaseId = String(ghRelease.id)
            githubUrl = ghRelease.html_url
            githubSynced = true
            syncStatus = "synced"
          } else {
            githubError = `GitHub API error: ${resp.status}`
            syncStatus = "failed"
          }
        } catch (e: any) {
          githubError = e.message || "Unknown error"
          syncStatus = "failed"
        }
      } else {
        githubError = "No GitHub token available"
        syncStatus = "failed"
      }
    } else {
      githubError = `Cannot parse repo: ${opts.githubRepo}`
      syncStatus = "failed"
    }
  }

  const release = await dbCreateRelease(id, {
    slug: opts.slug,
    version: opts.version,
    releasedAt: opts.releasedAt,
    title: opts.title,
    changelog: opts.changelog,
    downloadUrl: opts.downloadUrl,
    githubReleaseUrl: githubUrl,
    githubReleaseId,
    isPrerelease: opts.isPrerelease,
    minimumVersion: opts.minimumVersion,
  })

  // If sync failed, update with error status
  if (syncStatus === "failed" && githubError) {
    const updated = await updateRelease(opts.slug, opts.version, {
      githubSyncStatus: "failed",
      githubSyncError: githubError,
    })
    return { release: updated, githubSynced: false, githubError }
  }

  // If sync succeeded, update status
  if (githubSynced) {
    const updated = await updateRelease(opts.slug, opts.version, {
      githubSyncStatus: "synced",
      githubReleaseUrl: githubUrl,
      githubReleaseId,
    })
    return { release: updated, githubSynced: true, githubUrl }
  }

  return { release, githubSynced: false }
}

export async function retryGithubSync(slug: string, version: string, githubRepo: string) {
  const existing = await getReleaseByVersion(slug, version)
  if (!existing) throw new Error("Release not found")

  const parsed = parseRepoString(githubRepo)
  if (!parsed) throw new Error(`Cannot parse repo: ${githubRepo}`)

  const token = await getGithubToken()
  if (!token) throw new Error("No GitHub token available")

  const releaseTag = version.startsWith("v") ? version : `v${version}`
  const resp = await fetch(
    `${GITHUB_API}/repos/${parsed.owner}/${parsed.repo}/releases`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        tag_name: releaseTag,
        name: existing.title || `v${version}`,
        body: existing.changelog || "",
        draft: false,
        prerelease: existing.isPrerelease ?? false,
      }),
    },
  )

  if (!resp.ok) {
    const errorText = await resp.text()
    await updateRelease(slug, version, {
      githubSyncStatus: "failed",
      githubSyncError: `GitHub API ${resp.status}: ${errorText}`,
    })
    throw new Error(`GitHub API error: ${resp.status}`)
  }

  const ghRelease: any = await resp.json()
  const updated = await updateRelease(slug, version, {
    githubSyncStatus: "synced",
    githubReleaseUrl: ghRelease.html_url,
    githubReleaseId: String(ghRelease.id),
    githubSyncError: undefined,
  })

  return updated
}
