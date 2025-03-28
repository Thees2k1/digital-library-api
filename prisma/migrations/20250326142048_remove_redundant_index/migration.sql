-- DropIndex
DROP INDEX "user_device";

-- RenameIndex
ALTER INDEX "session_expires_at" RENAME TO "expires_at";
