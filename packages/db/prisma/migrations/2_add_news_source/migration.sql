-- Yangilik manbasi: VM ning 2021-yil 15-iyundagi 373-son qarori, 4-band.
-- Boshqa manbadan olingan axborot faqat manba ko'rsatilgan holda joylashtiriladi.
ALTER TABLE "news" ADD COLUMN "sourceName" TEXT;
ALTER TABLE "news" ADD COLUMN "sourceUrl" TEXT;
