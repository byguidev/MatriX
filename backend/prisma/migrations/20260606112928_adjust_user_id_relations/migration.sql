/*
  Warnings:

  - You are about to drop the column `userId` on the `Fatura` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Matricula` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Turma` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Fatura" DROP CONSTRAINT "Fatura_userId_fkey";

-- DropForeignKey
ALTER TABLE "Matricula" DROP CONSTRAINT "Matricula_userId_fkey";

-- DropForeignKey
ALTER TABLE "Turma" DROP CONSTRAINT "Turma_userId_fkey";

-- AlterTable
ALTER TABLE "Fatura" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Matricula" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Turma" DROP COLUMN "userId";
