-- Sayt bo'ylab to'liq matnli qidiruv (373-son qaror, 11-band; topshiriq 10, A qism).
--
-- Til sozlamasi 'simple': PostgreSQL da o'zbek tili uchun lug'at yo'q, shuning
-- uchun morfologik tahlil ishlamaydi. 'simple' so'zlarni kichik harfga o'giradi
-- va ajratadi; qidiruv prefiks bo'yicha (`so'z:*`) bajariladi.
--
-- Vektor TRIGGER bilan emas, DASTUR KODIDA yangilanadi
-- (`apps/api/src/lib/search-index.ts`, `reindex()`). Quyidagi UPDATE'lar faqat
-- MAVJUD yozuvlarni to'ldiradi.
--
-- DIQQAT: bu yerdagi ifodalar `search-index.ts` dagi `VECTOR_SQL` bilan bir xil
-- bo'lishi SHART. Mos kelishini `apps/api/src/lib/__tests__/search-index.test.ts`
-- tekshiradi.

-- news
ALTER TABLE "news" ADD COLUMN "searchVector" tsvector;
CREATE INDEX "news_searchVector_idx" ON "news" USING GIN ("searchVector");
UPDATE "news" SET "searchVector" = setweight(to_tsvector('simple', coalesce("titleUz", '') || ' ' || coalesce("titleEn", '') || ' ' || coalesce("titleRu", '')), 'A') || setweight(to_tsvector('simple', coalesce("summaryUz", '') || ' ' || coalesce("summaryEn", '') || ' ' || coalesce("summaryRu", '')), 'B') || setweight(to_tsvector('simple', regexp_replace(coalesce("contentUz", ''), '<[^>]*>', ' ', 'g') || ' ' || regexp_replace(coalesce("contentEn", ''), '<[^>]*>', ' ', 'g') || ' ' || regexp_replace(coalesce("contentRu", ''), '<[^>]*>', ' ', 'g')), 'C');

-- publications
ALTER TABLE "publications" ADD COLUMN "searchVector" tsvector;
CREATE INDEX "publications_searchVector_idx" ON "publications" USING GIN ("searchVector");
UPDATE "publications" SET "searchVector" = setweight(to_tsvector('simple', coalesce("titleUz", '') || ' ' || coalesce("titleEn", '') || ' ' || coalesce("titleRu", '')), 'A') || setweight(to_tsvector('simple', coalesce("authors", '')), 'B') || setweight(to_tsvector('simple', coalesce("journal", '') || ' ' || coalesce("doi", '') || ' ' || coalesce("year"::text, '')), 'C');

-- documents
ALTER TABLE "documents" ADD COLUMN "searchVector" tsvector;
CREATE INDEX "documents_searchVector_idx" ON "documents" USING GIN ("searchVector");
UPDATE "documents" SET "searchVector" = setweight(to_tsvector('simple', coalesce("titleUz", '') || ' ' || coalesce("titleEn", '') || ' ' || coalesce("titleRu", '')), 'A') || setweight(to_tsvector('simple', regexp_replace(coalesce("descriptionUz", ''), '<[^>]*>', ' ', 'g') || ' ' || regexp_replace(coalesce("descriptionEn", ''), '<[^>]*>', ' ', 'g') || ' ' || regexp_replace(coalesce("descriptionRu", ''), '<[^>]*>', ' ', 'g')), 'B') || setweight(to_tsvector('simple', coalesce("documentNumber", '')), 'C');

-- employees
ALTER TABLE "employees" ADD COLUMN "searchVector" tsvector;
CREATE INDEX "employees_searchVector_idx" ON "employees" USING GIN ("searchVector");
UPDATE "employees" SET "searchVector" = setweight(to_tsvector('simple', coalesce("fullNameUz", '') || ' ' || coalesce("fullNameEn", '') || ' ' || coalesce("fullNameRu", '')), 'A') || setweight(to_tsvector('simple', coalesce("positionUz", '') || ' ' || coalesce("positionEn", '') || ' ' || coalesce("positionRu", '')), 'B') || setweight(to_tsvector('simple', coalesce("degreeUz", '') || ' ' || coalesce("degreeEn", '') || ' ' || coalesce("degreeRu", '') || ' ' || coalesce("titleUz", '') || ' ' || coalesce("titleEn", '') || ' ' || coalesce("titleRu", '') || ' ' || coalesce("researchAreaUz", '') || ' ' || coalesce("researchAreaEn", '') || ' ' || coalesce("researchAreaRu", '')), 'C');

-- structure_units
ALTER TABLE "structure_units" ADD COLUMN "searchVector" tsvector;
CREATE INDEX "structure_units_searchVector_idx" ON "structure_units" USING GIN ("searchVector");
UPDATE "structure_units" SET "searchVector" = setweight(to_tsvector('simple', coalesce("nameUz", '') || ' ' || coalesce("nameEn", '') || ' ' || coalesce("nameRu", '')), 'A') || setweight(to_tsvector('simple', regexp_replace(coalesce("descriptionUz", ''), '<[^>]*>', ' ', 'g') || ' ' || regexp_replace(coalesce("descriptionEn", ''), '<[^>]*>', ' ', 'g') || ' ' || regexp_replace(coalesce("descriptionRu", ''), '<[^>]*>', ' ', 'g')), 'B') || setweight(to_tsvector('simple', coalesce("head", '')), 'C');
