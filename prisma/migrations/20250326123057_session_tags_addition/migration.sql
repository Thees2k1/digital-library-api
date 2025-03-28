/*
  Warnings:

  - You are about to drop the column `device_info` on the `user_session` table. All the data in the column will be lost.
  - You are about to alter the column `signature` on the `user_session` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(88)`.
  - Added the required column `device` to the `user_session` table without a default value. This is not possible if the table is not empty.
  - Made the column `ip_address` on table `user_session` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_agent` on table `user_session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_session" DROP COLUMN "device_info",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "device" VARCHAR(100) NOT NULL,
ADD COLUMN     "is_revoked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" VARCHAR(100),
ALTER COLUMN "signature" SET DATA TYPE VARCHAR(88),
ALTER COLUMN "ip_address" SET NOT NULL,
ALTER COLUMN "user_agent" SET NOT NULL,
ALTER COLUMN "user_agent" SET DATA TYPE VARCHAR(512);

-- CreateTable
CREATE TABLE "tag" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_tag" (
    "book_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "book_tag_pkey" PRIMARY KEY ("book_id","tag_id")
);

-- CreateIndex
CREATE INDEX "session_expires_at" ON "user_session"("expires_at");

-- CreateIndex
CREATE INDEX "user_device" ON "user_session"("user_id", "user_agent", "device");

-- AddForeignKey
ALTER TABLE "book_tag" ADD CONSTRAINT "book_tag_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_tag" ADD CONSTRAINT "book_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
