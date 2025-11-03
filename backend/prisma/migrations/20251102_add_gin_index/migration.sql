CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "DatasetRow_data_gin"
  ON "DatasetRow"
  USING GIN ("data");

CREATE INDEX IF NOT EXISTS "DatasetRow_datasetId_id_idx"
  ON "DatasetRow" ("datasetId", "id");
