/*
  Warnings:

  - You are about to drop the column `read_at` on the `user_read_book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_read_book" DROP COLUMN "read_at",
ADD COLUMN     "current_page" INTEGER DEFAULT 0,
ADD COLUMN     "is_favorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latest_process" SMALLINT DEFAULT 0;
