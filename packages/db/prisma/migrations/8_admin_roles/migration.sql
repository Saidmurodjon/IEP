-- Admin rollari: SUPER_ADMIN va ADMIN (topshiriq 18-A).
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');

ALTER TABLE "admins" ADD COLUMN "role" "AdminRole" NOT NULL DEFAULT 'ADMIN';
ALTER TABLE "admins" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "admins" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

-- Mavjud barcha adminlar super admin bo'ladi (aks holda hech kim boshqara olmay qoladi).
UPDATE "admins" SET "role" = 'SUPER_ADMIN';
