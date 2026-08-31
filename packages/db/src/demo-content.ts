/**
 * NAMOYISH KONTENTI — FAQAT LOKAL BAZA UCHUN.
 *
 * Bu skript `seed.ts` dan ATAYLAB ajratilgan: seed production'da ham ishlatilishi
 * mumkin, bu fayl esa hech qachon. Uni faqat qo'lda ishga tushiring:
 *
 *   npm run db:demo
 *
 * Ichidagi yangiliklar hujjat bilan tasdiqlangan yoki neytral mavzularda:
 * ism-sharif, ilmiy natija va o'ylab topilgan sana yo'q.
 */
import { PrismaClient } from '@prisma/client';
import { reindexAllSql } from '@energetika/shared';

const prisma = new PrismaClient();

/** Xato bilan production bazasiga yozib yubormaslik uchun oddiy to'siq. */
function assertLocalDatabase(): void {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL o\'rnatilmagan.');
  }
  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  if (!isLocal && process.env.ALLOW_REMOTE_DEMO_CONTENT !== 'yes') {
    throw new Error(
      'Bu skript faqat lokal baza uchun. DATABASE_URL lokal emas.\n' +
        'Namoyish kontenti production bazasiga yozilmasligi kerak.'
    );
  }
}

type DemoNews = {
  slug: string;
  titleUz: string; titleEn: string; titleRu: string;
  summaryUz: string; summaryEn: string; summaryRu: string;
  contentUz: string; contentEn: string; contentRu: string;
  publishedAt: Date;
};

const news: DemoNews[] = [
  {
    // Manba: FA Prezidiumining 2025-yil 27-fevraldagi 12-son qarori, 10-ilova.
    slug: 'institut-tuzilmasi-tasdiqlandi',
    titleUz: 'Institutning yangi tuzilmasi tasdiqlandi',
    titleEn: 'The new structure of the institute has been approved',
    titleRu: 'Утверждена новая структура института',
    summaryUz:
      "Fanlar akademiyasi Prezidiumining 2025-yil 27-fevraldagi qarori bilan institutning tashkiliy tuzilmasi tasdiqlandi.",
    summaryEn:
      'The organisational structure of the institute was approved by the decision of the Presidium of the Academy of Sciences of 27 February 2025.',
    summaryRu:
      'Организационная структура института утверждена постановлением Президиума Академии наук от 27 февраля 2025 года.',
    contentUz:
      "<p>O'zbekiston Respublikasi Fanlar akademiyasi Prezidiumining 2025-yil 27-fevraldagi 12-son qarori bilan Energetika muammolari institutining tashkiliy tuzilmasi tasdiqlandi.</p>" +
      "<p>Tuzilmaga muvofiq institut tarkibida oltita ilmiy laboratoriya faoliyat yuritadi. Tasdiqlangan tuzilma saytning “Tuzilma” bo'limida to'liq keltirilgan.</p>",
    contentEn:
      '<p>By decision No. 12 of the Presidium of the Academy of Sciences of the Republic of Uzbekistan dated 27 February 2025, the organisational structure of the Institute of Energy Problems was approved.</p>' +
      '<p>Under the approved structure the institute operates six research laboratories. The full structure is published in the “Structure” section of this site.</p>',
    contentRu:
      '<p>Постановлением Президиума Академии наук Республики Узбекистан № 12 от 27 февраля 2025 года утверждена организационная структура Института проблем энергетики.</p>' +
      '<p>Согласно утверждённой структуре в институте работают шесть научных лабораторий. Полная структура приведена в разделе «Структура» настоящего сайта.</p>',
    publishedAt: new Date('2025-02-27T00:00:00Z'),
  },
  {
    slug: 'rasmiy-veb-sayt-ishga-tushdi',
    titleUz: 'Institutning rasmiy veb-sayti ishga tushdi',
    titleEn: 'The official website of the institute has been launched',
    titleRu: 'Запущен официальный веб-сайт института',
    summaryUz:
      "Sayt uch tilda — o'zbek, ingliz va rus tillarida ishlaydi. Unda institut tuzilmasi, laboratoriyalar va aloqa ma'lumotlari joylashtirilgan.",
    summaryEn:
      'The site is available in three languages — Uzbek, English and Russian — and presents the structure of the institute, its laboratories and contact details.',
    summaryRu:
      'Сайт работает на трёх языках — узбекском, английском и русском — и содержит структуру института, лаборатории и контактные данные.',
    contentUz:
      "<p>Energetika muammolari institutining rasmiy veb-sayti ishga tushirildi. Saytda institut tuzilmasi, ilmiy laboratoriyalar ro'yxati, yangiliklar va aloqa ma'lumotlari joylashtirilgan.</p>" +
      "<p>Sayt uch tilda ishlaydi. Yangiliklar va ilmiy nashrlar bo'limlari institut xodimlari tomonidan muntazam to'ldirib boriladi.</p>",
    contentEn:
      '<p>The official website of the Institute of Energy Problems has been launched. It presents the structure of the institute, the list of research laboratories, news and contact information.</p>' +
      '<p>The site works in three languages. The news and publications sections will be updated regularly by the staff of the institute.</p>',
    contentRu:
      '<p>Запущен официальный веб-сайт Института проблем энергетики. На сайте размещены структура института, список научных лабораторий, новости и контактная информация.</p>' +
      '<p>Сайт работает на трёх языках. Разделы новостей и публикаций будут регулярно пополняться сотрудниками института.</p>',
    publishedAt: new Date(),
  },
  {
    slug: 'ilmiy-laboratoriyalar-faoliyat-yonalishlari',
    titleUz: 'Institut laboratoriyalarining faoliyat yo\'nalishlari',
    titleEn: 'Areas of work of the institute’s laboratories',
    titleRu: 'Направления деятельности лабораторий института',
    summaryUz:
      "Institutda energetika xavfsizligi, elektr energetika tizimlari, qayta tiklanuvchi energiya, elektrotexnologiyalar, energiya samaradorligi va intellektual energiya tizimlari bo'yicha oltita laboratoriya ishlaydi.",
    summaryEn:
      'The institute has six laboratories working on energy security, electric power systems, renewable energy, electrotechnologies, energy efficiency and intelligent energy systems.',
    summaryRu:
      'В институте работают шесть лабораторий по направлениям энергетической безопасности, электроэнергетических систем, возобновляемой энергетики, электротехнологий, энергоэффективности и интеллектуальных энергетических систем.',
    contentUz:
      "<p>Tasdiqlangan tuzilmaga muvofiq institutda oltita ilmiy laboratoriya faoliyat yuritadi:</p>" +
      "<ul><li>Energetikaning rivojlanish istiqbollari va energetik xavfsizlik</li>" +
      "<li>Elektr energetika tizimlari va majmualari</li>" +
      "<li>Muqobil va qayta tiklanuvchi energiya manbalaridan kompleks foydalanish</li>" +
      "<li>Elektrotexnologiyalar va energetik uskunalarni ekspluatatsiya qilish</li>" +
      "<li>Energiya samaradorligi va energiya tejash tizimlari</li>" +
      "<li>Intellektual energiya tizimlari, energetik tizimlar va quvvatlarni integratsiyalash</li></ul>" +
      "<p>Har bir laboratoriya haqida batafsil ma'lumot “Laboratoriyalar” bo'limida keltirilgan.</p>",
    contentEn:
      '<p>Under the approved structure the institute operates six research laboratories:</p>' +
      '<ul><li>Energy development prospects and energy security</li>' +
      '<li>Electric power systems and complexes</li>' +
      '<li>Integrated use of alternative and renewable energy sources</li>' +
      '<li>Electrotechnologies and operation of power equipment</li>' +
      '<li>Energy efficiency and energy saving systems</li>' +
      '<li>Intelligent energy systems and integration of power systems and capacities</li></ul>' +
      '<p>Details on each laboratory are given in the “Laboratories” section.</p>',
    contentRu:
      '<p>Согласно утверждённой структуре в институте работают шесть научных лабораторий:</p>' +
      '<ul><li>Перспективы развития энергетики и энергетическая безопасность</li>' +
      '<li>Электроэнергетические системы и комплексы</li>' +
      '<li>Комплексное использование альтернативных и возобновляемых источников энергии</li>' +
      '<li>Электротехнологии и эксплуатация энергетического оборудования</li>' +
      '<li>Энергоэффективность и системы энергосбережения</li>' +
      '<li>Интеллектуальные энергетические системы, интеграция энергосистем и мощностей</li></ul>' +
      '<p>Подробная информация о каждой лаборатории приведена в разделе «Лаборатории».</p>',
    publishedAt: new Date(),
  },
];

/**
 * Eski seed'dagi o'ylab topilgan yangilik ("yangi laboratoriya ochildi") —
 * hujjat bilan tasdiqlanmagan voqea, shuning uchun lokal bazadan olib tashlanadi.
 * Bu skript faqat lokal bazada ishlaydi (yuqoridagi tekshiruvga qarang).
 */
const legacySlugs = ['institute-opening-ceremony'];

async function main() {
  assertLocalDatabase();
  console.log('Namoyish kontenti yozilmoqda (faqat lokal baza)...');

  const removed = await prisma.news.deleteMany({ where: { slug: { in: legacySlugs } } });
  if (removed.count > 0) {
    console.log(`✓ Eski demo yangilik o'chirildi (${removed.count} ta)`);
  }

  for (const item of news) {
    const { slug, ...data } = item;
    await prisma.news.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
  }
  console.log(`✓ ${news.length} ta yangilik tayyor (uch tilda)`);

  // Prisma `searchVector` ni to'ldirmaydi — yangiliklar qidiruvda topilishi uchun
  // indeks qo'lda qayta hisoblanadi.
  await prisma.$executeRawUnsafe(reindexAllSql('news'));
  console.log('✓ Qidiruv indeksi yangilandi');

  const total = await prisma.news.count();
  console.log(`\n✅ Bazada jami ${total} ta yangilik bor.`);
  console.log('Ilmiy nashrlar ataylab bo\'sh qoldirildi — soxta nashr kiritilmaydi.');
}

main()
  .catch((err: unknown) => {
    console.error('\n❌ Namoyish kontenti yozilmadi:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
