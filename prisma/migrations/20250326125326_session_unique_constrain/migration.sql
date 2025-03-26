/*
  Warnings:

  - A unique constraint covering the columns `[user_id,user_agent,device]` on the table `user_session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_agent_device" ON "user_session"("user_id", "user_agent", "device");
