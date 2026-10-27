-- Xodim endi ikki joyga biriktiriladi: asosiy bo'lim (unitId) va laboratoriya (labId).
ALTER TABLE "employees" ADD COLUMN "labId" TEXT;

CREATE INDEX "employees_labId_idx" ON "employees"("labId");

ALTER TABLE "employees" ADD CONSTRAINT "employees_labId_fkey"
  FOREIGN KEY ("labId") REFERENCES "structure_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Laboratoriyaga biriktirilgan xodimlar labId ga ko'chiriladi (ma'lumot yo'qolmaydi).
UPDATE "employees" e SET "labId" = e."unitId", "unitId" = NULL
FROM "structure_units" u
WHERE u."id" = e."unitId" AND u."type" = 'laboratory';
