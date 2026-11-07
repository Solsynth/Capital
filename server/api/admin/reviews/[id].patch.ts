import { requireAdmin } from "#server/utils/admin"
import { getReviewById, setReviewReply, updateReview } from "#server/utils/products"

export default defineEventHandler(async (event) => {
  const { session } = await requireAdmin(event)

  const id = getRouterParam(event, "id")
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing review ID" })
  }

  const body = await readBody(event)
  const review = await getReviewById(id)
  if (!review) {
    throw createError({ statusCode: 404, statusMessage: "Review not found" })
  }

  // `reply` is the official team response under the review. Sending it alone
  // must not touch moderation fields, and sending null/empty removes the reply.
  if ("reply" in body) {
    if (body.reply !== null && typeof body.reply !== "string") {
      throw createError({ statusCode: 400, statusMessage: "Reply must be a string or null" })
    }
    if (typeof body.reply === "string" && body.reply.length > 4000) {
      throw createError({ statusCode: 400, statusMessage: "Reply exceeds 4000 characters" })
    }
  }

  if ("reply" in body) {
    await setReviewReply(id, { reply: body.reply, replyBy: session.user.id })
  }

  if ("status" in body || "title" in body || "content" in body) {
    await updateReview(id, {
      status: body.status,
      title: body.title,
      content: body.content,
    })
  }

  return { review: await getReviewById(id) }
})
