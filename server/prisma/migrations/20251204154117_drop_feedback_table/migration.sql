/*
  Warnings:

  - You are about to drop the `feedback` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_clientId_fkey";

-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_sessionId_fkey";

-- DropTable
DROP TABLE "feedback";
