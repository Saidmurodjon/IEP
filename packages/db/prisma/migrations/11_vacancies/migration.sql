-- Bo'sh ish o'rinlari (Vakansiyalar).

CREATE TABLE "vacancies" (
    "id" TEXT NOT NULL,
    "titleUz" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "descriptionUz" TEXT NOT NULL DEFAULT '',
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "descriptionRu" TEXT NOT NULL DEFAULT '',
    "unitId" TEXT,
    "employmentType" TEXT NOT NULL DEFAULT 'full',
    "salaryFrom" INTEGER,
    "salaryTo" INTEGER,
    "deadline" TIMESTAMP(3),
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacancies_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vacancies_isActive_deadline_idx" ON "vacancies"("isActive", "deadline");

ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_unitId_fkey"
  FOREIGN KEY ("unitId") REFERENCES "structure_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
