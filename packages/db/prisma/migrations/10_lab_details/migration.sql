-- Laboratoriya sahifasidagi barcha ma'lumot admin paneldan kiritiladi.
ALTER TABLE "structure_units"
  ADD COLUMN "contentUz" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "contentEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "contentRu" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "directionsUz" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "directionsEn" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "directionsRu" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "imageUrl" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "room" TEXT,
  ADD COLUMN "foundedYear" INTEGER;
