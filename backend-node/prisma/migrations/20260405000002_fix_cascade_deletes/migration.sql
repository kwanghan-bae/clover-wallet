-- Follow model: change onDelete from RESTRICT to CASCADE for follower and following relations
-- Note: relationMode = "prisma" means these are enforced at application level, not DB level.
-- Comment self-relation (parent) remains RESTRICT as Prisma requires NoAction/Restrict for self-relations
-- with relationMode = "prisma" on Postgres.

-- No DDL changes needed: relationMode = "prisma" does not emit FK constraints to the database.
-- Referential actions are enforced by Prisma engine at the application layer.
-- This migration records the intent of the schema change (Follow: Restrict -> Cascade).
