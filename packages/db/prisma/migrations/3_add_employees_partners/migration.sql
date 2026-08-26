-- Xodimlar reyestri va hamkor tashkilotlar (06-topshiriq).

CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "fullNameUz" TEXT NOT NULL,
    "fullNameEn" TEXT NOT NULL,
    "fullNameRu" TEXT NOT NULL,
    "positionUz" TEXT NOT NULL,
    "positionEn" TEXT NOT NULL,
    "positionRu" TEXT NOT NULL,
    "degreeUz" TEXT,
    "degreeEn" TEXT,
    "degreeRu" TEXT,
    "titleUz" TEXT,
    "titleEn" TEXT,
    "titleRu" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "photoUrl" TEXT,
    "orcid" TEXT,
    "scopusId" TEXT,
    "researchAreaUz" TEXT,
    "researchAreaEn" TEXT,
    "researchAreaRu" TEXT,
    "officeRoom" TEXT,
    "receptionHoursUz" TEXT,
    "receptionHoursEn" TEXT,
    "receptionHoursRu" TEXT,
    "isManagement" BOOLEAN NOT NULL DEFAULT false,
    "isUnitHead" BOOLEAN NOT NULL DEFAULT false,
    "unitId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "employees_unitId_idx" ON "employees"("unitId");

-- Bo'linma o'chirilsa xodim o'chmaydi, faqat bog'lanish uziladi.
ALTER TABLE "employees" ADD CONSTRAINT "employees_unitId_fkey"
    FOREIGN KEY ("unitId") REFERENCES "structure_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "nameUz" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);
