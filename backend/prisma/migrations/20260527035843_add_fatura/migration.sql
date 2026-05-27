-- CreateTable
CREATE TABLE "Fatura" (
    "id" SERIAL NOT NULL,
    "alunoId" INTEGER NOT NULL,
    "matriculaId" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "cobranca" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Fatura_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Fatura" ADD CONSTRAINT "Fatura_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fatura" ADD CONSTRAINT "Fatura_matriculaId_fkey" FOREIGN KEY ("matriculaId") REFERENCES "Matricula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
