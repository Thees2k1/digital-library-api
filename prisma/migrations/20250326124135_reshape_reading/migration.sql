/*
  Warnings:

  - You are about to drop the column `is_favorite` on the `user_read_book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "author" ADD COLUMN     "popularity_points" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "category" ADD COLUMN     "popularity_points" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "user_read_book" DROP COLUMN "is_favorite",
ADD COLUMN     "is_finished" BOOLEAN NOT NULL DEFAULT false;
