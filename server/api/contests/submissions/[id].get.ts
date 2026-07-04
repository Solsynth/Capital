import { db } from '~~/server/utils/db'
import { contestSubmission, user as userTable } from '~~/server/db'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const submissionId = event.context.params?.id as string

  const [submission] = await db
    .select({
      id: contestSubmission.id,
      contestId: contestSubmission.contestId,
      status: contestSubmission.status,
      userId: contestSubmission.userId,
      referralCode: contestSubmission.referralCode,
      data: contestSubmission.data,
      reviewNote: contestSubmission.reviewNote,
      reviewedBy: contestSubmission.reviewedBy,
      reviewedAt: contestSubmission.reviewedAt,
      createdAt: contestSubmission.createdAt,
      updatedAt: contestSubmission.updatedAt,
      userName: userTable.name,
      userNick: sql<string>`${userTable.solarProfile}->>'nick'`,
      userSolarName: sql<string>`${userTable.solarProfile}->>'name'`,
      userPicture: sql<string>`coalesce(${userTable.solarProfile}->'profile'->'picture'->>'id', ${userTable.solarProfile}->'profile'->>'picture')`,
      userSolarAccountId: userTable.solarAccountId,
    })
    .from(contestSubmission)
    .leftJoin(userTable, eq(userTable.id, contestSubmission.userId))
    .where(eq(contestSubmission.id, submissionId))
    .limit(1)

  if (!submission) {
    throw createError({ statusCode: 404, statusMessage: 'Submission not found' })
  }

  const auth = event.context.session
  if (submission.status !== 'accepted') {
    if (!auth?.user || (auth.user.id !== submission.userId)) {
      throw createError({ statusCode: 404, statusMessage: 'Submission not found' })
    }
  }

  const avatar = submission.userPicture
    ? `https://api.solian.app/drive/files/${submission.userPicture}`
    : null

  return {
    ...submission,
    author: {
      id: submission.userId,
      name: submission.userNick || submission.userSolarName || submission.userName,
      avatar,
      solarAccountId: submission.userSolarAccountId,
    },
    userName: undefined,
    userNick: undefined,
    userSolarName: undefined,
    userPicture: undefined,
    userSolarAccountId: undefined,
  }
})
