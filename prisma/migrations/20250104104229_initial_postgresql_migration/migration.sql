-- CreateEnum
CREATE TYPE "item_format" AS ENUM ('pdf', 'epub', 'mp3');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "LikeStatus" AS ENUM ('liked', 'unliked');

-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('published', 'draft', 'archived', 'deleted');

-- CreateEnum
CREATE TYPE "SerieStatus" AS ENUM ('planned', 'ongoing', 'completed', 'archived', 'deleted');

-- CreateTable
CREATE TABLE "author" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "avatar" VARCHAR(255),
    "bio" TEXT,
    "birth_date" DATE NOT NULL,
    "death_date" DATE,
    "country" VARCHAR(100),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_digital_item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "book_id" UUID NOT NULL,
    "format" "item_format" NOT NULL DEFAULT 'pdf',
    "url" VARCHAR(255) NOT NULL,
    "size" INTEGER,
    "md5" VARCHAR(255) NOT NULL,
    "sha256" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_digital_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "author_id" UUID NOT NULL,
    "cover" VARCHAR(255) NOT NULL,
    "publisher_id" UUID,
    "release_date" DATE NOT NULL,
    "description" TEXT,
    "pages" INTEGER NOT NULL,
    "language" VARCHAR(100) NOT NULL,
    "category_id" UUID NOT NULL,
    "status" "BookStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serie_id" UUID,

    CONSTRAINT "book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publisher" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(128) NOT NULL,
    "cover" VARCHAR(255),
    "contact_info" VARCHAR(255),
    "address" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publisher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serie" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(128) NOT NULL,
    "cover" VARCHAR(255),
    "description" TEXT,
    "status" "SerieStatus" NOT NULL DEFAULT 'planned',
    "release_date" DATE NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "serie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(128) NOT NULL,
    "cover" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genre" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_genre" (
    "book_id" UUID NOT NULL,
    "genre_id" UUID NOT NULL,

    CONSTRAINT "book_genre_pkey" PRIMARY KEY ("book_id","genre_id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "avatar" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_identify" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password" VARCHAR(128) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "user_id" UUID NOT NULL,

    CONSTRAINT "user_identify_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "signature" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "device_info" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "book_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL DEFAULT 0,
    "review" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "LikeStatus" NOT NULL DEFAULT 'liked',
    "user_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_read_book" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "book_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "read_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_read_book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "name" ON "author"("name");

-- CreateIndex
CREATE INDEX "book_id" ON "book_digital_item"("book_id");

-- CreateIndex
CREATE UNIQUE INDEX "book_digital_item_book_id_format_key" ON "book_digital_item"("book_id", "format");

-- CreateIndex
CREATE UNIQUE INDEX "user_identify_email_key" ON "user_identify"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_identify_user_id_key" ON "user_identify"("user_id");

-- CreateIndex
CREATE INDEX "identity_user_id" ON "user_identify"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_session_user_id_key" ON "user_session"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_session_signature_key" ON "user_session"("signature");

-- CreateIndex
CREATE INDEX "session_user_id" ON "user_session"("user_id");

-- CreateIndex
CREATE INDEX "userId_bookId" ON "reviews"("user_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_book_id_key" ON "likes"("user_id", "book_id");

-- AddForeignKey
ALTER TABLE "book_digital_item" ADD CONSTRAINT "book_digital_item_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book" ADD CONSTRAINT "book_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book" ADD CONSTRAINT "book_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book" ADD CONSTRAINT "book_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book" ADD CONSTRAINT "book_serie_id_fkey" FOREIGN KEY ("serie_id") REFERENCES "serie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_genre" ADD CONSTRAINT "book_genre_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_genre" ADD CONSTRAINT "book_genre_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_identify" ADD CONSTRAINT "user_identify_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_read_book" ADD CONSTRAINT "user_read_book_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_read_book" ADD CONSTRAINT "user_read_book_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
