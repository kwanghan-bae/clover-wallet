-- AlterTable
ALTER TABLE "comment" ADD COLUMN "parent_id" BIGINT;

-- CreateIndex
CREATE INDEX "idx_comment_parent_id" ON "comment"("parent_id");
