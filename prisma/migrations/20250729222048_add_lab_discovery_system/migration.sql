/*
  Warnings:

  - You are about to drop the column `notes` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `stlUrl` on the `Case` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CaseStatus" ADD VALUE 'DESIGNING';
ALTER TYPE "CaseStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "CaseStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Case" DROP COLUMN "notes",
DROP COLUMN "stlUrl",
ADD COLUMN     "caseNotes" TEXT,
ADD COLUMN     "statusHistory" JSONB,
ADD COLUMN     "toothNumber" TEXT;

-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "specialties" TEXT[];

-- AlterTable
ALTER TABLE "Lab" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "specialties" TEXT[],
ALTER COLUMN "location" DROP NOT NULL;

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "caseId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteLab" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteLab_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_key" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteLab_clinicId_labId_key" ON "FavoriteLab"("clinicId", "labId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteLab" ADD CONSTRAINT "FavoriteLab_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteLab" ADD CONSTRAINT "FavoriteLab_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;
