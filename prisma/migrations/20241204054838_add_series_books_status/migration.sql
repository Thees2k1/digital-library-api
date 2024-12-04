/*
  Warnings:

  - Added the required column `release_date` to the `book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `release_date` to the `serie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `book` ADD COLUMN `release_date` DATE NOT NULL,
    ADD COLUMN `status` ENUM('published', 'draft', 'archived', 'deleted') NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE `serie` ADD COLUMN `release_date` DATE NOT NULL,
    ADD COLUMN `status` ENUM('planned', 'ongoing', 'completed', 'archived', 'deleted') NOT NULL DEFAULT 'planned';
