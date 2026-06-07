const dbUrl = process.env.DATABASE_URL || ''

export const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')

import * as sqliteSchema from './schema-sqlite'
import * as pgSchema from './schema-pg'

const schema = isPostgres ? pgSchema : sqliteSchema

export const user = schema.user
export const session = schema.session
export const account = schema.account
export const verification = schema.verification
export const userRelations = schema.userRelations
export const sessionRelations = schema.sessionRelations
export const accountRelations = schema.accountRelations
