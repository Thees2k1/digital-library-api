/*
  Warnings:

  - A unique constraint covering the columns `[user_id,book_id]` on the table `user_read_book` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "user_favorite_book" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "book_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_book_user_id_book_id_key" ON "user_favorite_book"("user_id", "book_id");

-- CreateIndex
CREATE INDEX "title" ON "book"("title");

-- CreateIndex
CREATE INDEX "author_id" ON "book"("author_id");

-- CreateIndex
CREATE INDEX "publisher_id" ON "book"("publisher_id");

-- CreateIndex
CREATE INDEX "category_id" ON "book"("category_id");

-- CreateIndex
CREATE INDEX "serie_id" ON "book"("serie_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_read_book_user_id_book_id_key" ON "user_read_book"("user_id", "book_id");

-- AddForeignKey
ALTER TABLE "user_favorite_book" ADD CONSTRAINT "user_favorite_book_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_book" ADD CONSTRAINT "user_favorite_book_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
