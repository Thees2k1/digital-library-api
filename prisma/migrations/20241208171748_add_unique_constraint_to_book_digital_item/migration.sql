/*
  Warnings:

  - A unique constraint covering the columns `[book_id,format]` on the table `book_digital_item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `book_digital_item_book_id_format_key` ON `book_digital_item`(`book_id`, `format`);
