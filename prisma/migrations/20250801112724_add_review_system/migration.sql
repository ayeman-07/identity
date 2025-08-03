/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[caseId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `caseId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_labId_fkey";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "createdAt",
DROP COLUMN "message",
ADD COLUMN     "caseId" TEXT NOT NULL,
ADD COLUMN     "clinicId" TEXT NOT NULL,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Review_caseId_key" ON "Review"("caseId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_labId_fkey" FOREIGN KEY ("labId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
