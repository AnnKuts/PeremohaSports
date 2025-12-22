/*
  Warnings:

  - Changed the type of `name` on the `class_type` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "room" DROP CONSTRAINT "room_gym_id_fkey";

-- DropForeignKey
ALTER TABLE "trainer_placement" DROP CONSTRAINT "trainer_placement_gym_id_fkey";

-- AlterTable
ALTER TABLE "class_type" DROP COLUMN "name",
ADD COLUMN     "name" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gym"("gym_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trainer_placement" ADD CONSTRAINT "trainer_placement_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gym"("gym_id") ON DELETE CASCADE ON UPDATE NO ACTION;
