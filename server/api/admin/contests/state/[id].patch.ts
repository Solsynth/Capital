import { db } from '~~/server/utils/db'
import { contestState } from '~~/server/db'
import { requireAdmin } from '~~/server/utils/admin'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { session } = await requireAdmin(event)

  const contestId = event.context.params?.id as string
  const body = await readBody(event)

  const existing = await db
    .select({ contestId: contestState.contestId })
    .from(contestState)
    .where(eq(contestState.contestId, contestId))
    .limit(1)

  const updates: Record<string, any> = {}
  if (body.status !== undefined) updates.status = body.status
  if (body.phase !== undefined) updates.phase = body.phase
  if (body.submission_enabled !== undefined) updates.submissionEnabled = body.submission_enabled
  if (body.voting_enabled !== undefined) updates.votingEnabled = body.voting_enabled
  if (body.start_date !== undefined) updates.startDate = body.start_date ? new Date(body.start_date) : null
  if (body.end_date !== undefined) updates.endDate = body.end_date ? new Date(body.end_date) : null
  if (body.dev_ends_at !== undefined) updates.devEndsAt = body.dev_ends_at ? new Date(body.dev_ends_at) : null
  if (body.voting_ends_at !== undefined) updates.votingEndsAt = body.voting_ends_at ? new Date(body.voting_ends_at) : null
  if (body.result_published_at !== undefined) updates.resultPublishedAt = body.result_published_at ? new Date(body.result_published_at) : null

  if (existing.length === 0) {
    await db.insert(contestState).values({
      contestId,
      status: body.status || 'upcoming',
      phase: body.phase || 'dev',
      submissionEnabled: body.submission_enabled ?? true,
      votingEnabled: body.voting_enabled ?? false,
      startDate: body.start_date ? new Date(body.start_date) : null,
      endDate: body.end_date ? new Date(body.end_date) : null,
      devEndsAt: body.dev_ends_at ? new Date(body.dev_ends_at) : null,
      votingEndsAt: body.voting_ends_at ? new Date(body.voting_ends_at) : null,
      resultPublishedAt: body.result_published_at ? new Date(body.result_published_at) : null,
    })
  }
  else {
    await db.update(contestState)
      .set(updates)
      .where(eq(contestState.contestId, contestId))
  }

  const state = await db
    .select()
    .from(contestState)
    .where(eq(contestState.contestId, contestId))
    .limit(1)
    .then(rows => rows[0])

  return { success: true, state }
})
