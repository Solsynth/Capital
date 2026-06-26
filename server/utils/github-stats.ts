import { db } from '~~/server/utils/db'
import { githubStats } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'

const STALE_MS = 24 * 60 * 60 * 1000 // 24 hours

// ponytail: in-memory pending set, per-process. Good enough — duplicate fetches across processes are harmless.
const pending = new Set<number>()

export async function getGithubPrCount(githubUserId: number, githubUsername: string): Promise<number> {
  const [row] = await db
    .select()
    .from(githubStats)
    .where(eq(githubStats.githubUserId, githubUserId))
    .limit(1)

  const now = Date.now()
  const fresh = row && (now - new Date(row.updatedAt).getTime()) < STALE_MS

  if (fresh) return row.prCount

  // Queue background update if not already pending
  if (!pending.has(githubUserId)) {
    pending.add(githubUserId)
    refreshGithubPrCount(githubUserId, githubUsername).finally(() => pending.delete(githubUserId))
  }

  // Return stale data if we have it, 0 otherwise
  return row?.prCount ?? 0
}

async function refreshGithubPrCount(githubUserId: number, githubUsername: string): Promise<void> {
  try {
    const resp = await fetch(
      `https://api.github.com/search/issues?q=author:${githubUsername}+org:solsynth+type:pr&per_page=1`
    )
    if (!resp.ok) return

    const data = await resp.json()
    const prCount = data?.total_count ?? 0

    await db
      .insert(githubStats)
      .values({ githubUserId, githubUsername, prCount })
      .onConflictDoUpdate({
        target: githubStats.githubUserId,
        set: { prCount, githubUsername, updatedAt: new Date() },
      })
  } catch {
    // silently fail — stale data is still served
  }
}
