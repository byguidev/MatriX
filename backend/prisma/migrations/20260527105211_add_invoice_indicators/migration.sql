-- AlterTable
ALTER TABLE "Fatura" ADD COLUMN "dataPagamento" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "IndicadorFaturaMensal" (
    "id" SERIAL NOT NULL,
    "ano" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "faturasAbertas" INTEGER NOT NULL,
    "faturasPagas" INTEGER NOT NULL,
    "rendimentoLiquido" DECIMAL(10,2) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndicadorFaturaMensal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IndicadorFaturaMensal_ano_mes_key" ON "IndicadorFaturaMensal"("ano", "mes");

-- Backfill paid date for invoices already marked as paid
UPDATE "Fatura"
SET "dataPagamento" = "dataEmissao"
WHERE "status" = 'PAGA' AND "dataPagamento" IS NULL;
