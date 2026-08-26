-- Fayl ombori, hujjatlar va yangilik qoralamasi (07-topshiriq).

CREATE TABLE "media_files" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "ownerType" TEXT,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "media_files_key_key" ON "media_files"("key");
CREATE INDEX "media_files_ownerType_ownerId_idx" ON "media_files"("ownerType", "ownerId");

CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "titleUz" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "descriptionUz" TEXT,
    "descriptionEn" TEXT,
    "descriptionRu" TEXT,
    "fileKey" TEXT NOT NULL,
    "documentNumber" TEXT,
    "documentDate" TIMESTAMP(3),
    "category" TEXT NOT NULL DEFAULT 'other',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- Mavjud yangiliklar nashr etilgan holatda qoladi.
ALTER TABLE "news" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;
