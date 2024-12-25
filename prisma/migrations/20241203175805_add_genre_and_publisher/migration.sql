/*
  Warnings:

  - You are about to drop the column `publisher` on the `book` table. All the data in the column will be lost.
  - You are about to drop the column `parent_id` on the `category` table. All the data in the column will be lost.
  - You are about to drop the `book_category` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category_id` to the `book` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `book_category` DROP FOREIGN KEY `book_category_book_id_fkey`;

-- DropForeignKey
ALTER TABLE `book_category` DROP FOREIGN KEY `book_category_category_id_fkey`;

-- AlterTable
ALTER TABLE `book` DROP COLUMN `publisher`,
    ADD COLUMN `category_id` BINARY(16) NOT NULL,
    ADD COLUMN `publisher_id` BINARY(16) NULL,
    ADD COLUMN `serie_id` BINARY(16) NULL;

-- AlterTable
ALTER TABLE `category` DROP COLUMN `parent_id`,
    ADD COLUMN `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- DropTable
DROP TABLE `book_category`;

-- CreateTable
CREATE TABLE `publisher` (
    `id` BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID())),
    `name` VARCHAR(128) NOT NULL,
    `cover` VARCHAR(255) NULL,
    `contact_info` VARCHAR(255) NULL,
    `address` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `serie` (
    `id` BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID())),
    `name` VARCHAR(128) NOT NULL,
    `cover` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genre` (
    `id` BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID())),
    `name` VARCHAR(128) NOT NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book_genre` (
    `book_id` BINARY(16) NOT NULL,
    `genre_id` BINARY(16) NOT NULL,

    PRIMARY KEY (`book_id`, `genre_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `book` ADD CONSTRAINT `book_publisher_id_fkey` FOREIGN KEY (`publisher_id`) REFERENCES `publisher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `book` ADD CONSTRAINT `book_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `book` ADD CONSTRAINT `book_serie_id_fkey` FOREIGN KEY (`serie_id`) REFERENCES `serie`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `book_genre` ADD CONSTRAINT `book_genre_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `book_genre` ADD CONSTRAINT `book_genre_genre_id_fkey` FOREIGN KEY (`genre_id`) REFERENCES `genre`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
