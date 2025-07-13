/*
  Warnings:

  - You are about to drop the column `createdAt` on the `file` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `file` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `file` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `file` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "file_file_type_uploadedAt_idx";

-- AlterTable
ALTER TABLE "file" DROP COLUMN "createdAt",
DROP COLUMN "isArchived",
DROP COLUMN "isPublic",
DROP COLUMN "uploadedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "file_file_type_uploaded_at_idx" ON "file"("file_type", "uploaded_at");
