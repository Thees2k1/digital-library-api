/*
  Warnings:

  - The values [unlike] on the enum `likes_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `likes` MODIFY `status` ENUM('liked', 'unliked') NOT NULL DEFAULT 'liked';
