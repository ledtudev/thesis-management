/*
  Warnings:

  - You are about to drop the column `addedAt` on the `report_attachment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "report_attachment" DROP COLUMN "addedAt",
ADD COLUMN     "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
