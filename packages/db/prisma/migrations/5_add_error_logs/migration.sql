-- Xatoliklar jurnali (08-topshiriq).
-- `fingerprint` unikal: bir xil xato bitta yozuvga guruhlanadi.

CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'error',
    "code" TEXT,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "path" TEXT,
    "method" TEXT,
    "statusCode" INTEGER,
    "userAgent" TEXT,
    "adminId" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "error_logs_fingerprint_key" ON "error_logs"("fingerprint");
CREATE INDEX "error_logs_lastSeenAt_idx" ON "error_logs"("lastSeenAt");
CREATE INDEX "error_logs_isResolved_lastSeenAt_idx" ON "error_logs"("isResolved", "lastSeenAt");
