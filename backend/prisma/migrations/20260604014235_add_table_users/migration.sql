/*
  Warnings:

  - You are about to drop the column `dataPagamento` on the `Fatura` table. All the data in the column will be lost.
  - You are about to drop the `IndicadorFaturaMensal` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Fatura" DROP COLUMN "dataPagamento";

-- DropTable
DROP TABLE "IndicadorFaturaMensal";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
