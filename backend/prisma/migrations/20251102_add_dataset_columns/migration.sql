ALTER TABLE "Dataset"
  ADD COLUMN IF NOT EXISTS "storedFilePath" text,
  ADD COLUMN IF NOT EXISTS "progress" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "errorText" text;
