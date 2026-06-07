/*
  Warnings:

  - You are about to drop the column `cod` on the `Curso` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Matricula` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Turma` table. All the data in the column will be lost.
  - Added the required column `code` to the `Curso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Fatura` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Matricula` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Matricula` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Turma` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Turma` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Aluno_cpf_key";

-- DropIndex
DROP INDEX "Aluno_email_key";

-- DropIndex
DROP INDEX "Curso_cod_key";

-- DropIndex
DROP INDEX "Matricula_nome_key";

-- DropIndex
DROP INDEX "Turma_nome_key";

-- AlterTable
ALTER TABLE "Curso" DROP COLUMN "cod",
ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Fatura" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Matricula" DROP COLUMN "nome",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Turma" DROP COLUMN "nome",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fatura" ADD CONSTRAINT "Fatura_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
