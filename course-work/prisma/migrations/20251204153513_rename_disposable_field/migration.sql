/*
  Warnings:

  - You are about to drop the column `is_dispisable` on the `membership` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "membership" DROP COLUMN "is_dispisable",
ADD COLUMN     "is_disposable" BOOLEAN NOT NULL DEFAULT false;
