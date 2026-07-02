/*
  Warnings:

  - You are about to drop the column `userId` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('Processing', 'Success', 'Failure');

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_userId_fkey";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "userId",
ADD COLUMN     "output" TEXT,
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'Processing';

-- DropTable
DROP TABLE "User";
