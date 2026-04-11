-- CreateTable
CREATE TABLE "follow" (
    "id" BIGSERIAL NOT NULL,
    "follower_id" BIGINT NOT NULL,
    "following_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "follow_follower_id_idx" ON "follow"("follower_id");

-- CreateIndex
CREATE INDEX "follow_following_id_idx" ON "follow"("following_id");

-- CreateIndex
CREATE UNIQUE INDEX "follow_follower_id_following_id_key" ON "follow"("follower_id", "following_id");
