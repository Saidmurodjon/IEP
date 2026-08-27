-- Murojaatlar tizimi (09-topshiriq).
-- VM ning 2021-yil 15-iyundagi 373-son qarori, 11-band.

ALTER TABLE "contact_messages" ADD COLUMN "ticketNumber" TEXT;
ALTER TABLE "contact_messages" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'new';
ALTER TABLE "contact_messages" ADD COLUMN "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "contact_messages" ADD COLUMN "answeredAt" TIMESTAMP(3);
ALTER TABLE "contact_messages" ADD COLUMN "answerNote" TEXT;
ALTER TABLE "contact_messages" ADD COLUMN "notifiedAt" TIMESTAMP(3);

-- Mavjud yozuvlar: `read = true` bo'lganlari ko'rib chiqilgan deb hisoblanadi.
UPDATE "contact_messages" SET "status" = 'in_review' WHERE "read" = true;
UPDATE "contact_messages" SET "status" = 'new' WHERE "read" = false;

-- Mavjud yozuvlarga raqam beriladi: kelgan vaqti bo'yicha, yil kesimida ketma-ket.
WITH numbered AS (
  SELECT
    "id",
    'M-' || TO_CHAR("createdAt", 'YYYY') || '-' ||
      LPAD(ROW_NUMBER() OVER (PARTITION BY DATE_PART('year', "createdAt") ORDER BY "createdAt")::text, 4, '0') AS ticket
  FROM "contact_messages"
)
UPDATE "contact_messages" m
SET "ticketNumber" = n.ticket
FROM numbered n
WHERE m."id" = n."id";

ALTER TABLE "contact_messages" ALTER COLUMN "ticketNumber" SET NOT NULL;
CREATE UNIQUE INDEX "contact_messages_ticketNumber_key" ON "contact_messages"("ticketNumber");
CREATE INDEX "contact_messages_status_createdAt_idx" ON "contact_messages"("status", "createdAt");

-- `read` o'rniga `status` ishlatiladi.
ALTER TABLE "contact_messages" DROP COLUMN "read";
