-- 1. enum
CREATE TYPE "DatasetStatus" AS ENUM ('QUEUED', 'PROCESSING', 'READY', 'ERROR');

-- 2. таблица Dataset
CREATE TABLE "Dataset" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "originalName" TEXT NOT NULL,
    "storedFilePath" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "status" "DatasetStatus" NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- 3. таблица DatasetRow
CREATE TABLE "DatasetRow" (
    "id" SERIAL NOT NULL,
    "datasetId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DatasetRow_pkey" PRIMARY KEY ("id")
);

-- 4. внешка
ALTER TABLE "DatasetRow"
  ADD CONSTRAINT "DatasetRow_datasetId_fkey"
  FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. расширение под поиск
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 6. индексы
CREATE INDEX "DatasetRow_data_gin"
  ON "DatasetRow"
  USING GIN ((data::text) gin_trgm_ops);

CREATE INDEX "DatasetRow_datasetId_id_idx"
  ON "DatasetRow" ("datasetId", "id");
