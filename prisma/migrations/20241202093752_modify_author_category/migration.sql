/*
  Warnings:

  - You are about to drop the column `category_id` on the `book` table. All the data in the column will be lost.
  - Added the required column `birth_date` to the `author` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `book` DROP FOREIGN KEY `book_category_id_fkey`;

-- AlterTable
ALTER TABLE `author` ADD COLUMN `birth_date` DATE NOT NULL,
    ADD COLUMN `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `death_date` DATE NULL,
    ADD COLUMN `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `book` DROP COLUMN `category_id`;

-- AlterTable
ALTER TABLE `category` ADD COLUMN `cover` VARCHAR(255) NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `parent_id` BINARY(16) NULL;

-- CreateTable
CREATE TABLE `book_category` (
    `book_id` BINARY(16) NOT NULL,
    `category_id` BINARY(16) NOT NULL,

    PRIMARY KEY (`book_id`, `category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `book_category` ADD CONSTRAINT `book_category_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `book_category` ADD CONSTRAINT `book_category_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
