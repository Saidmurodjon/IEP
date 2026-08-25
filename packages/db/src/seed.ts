import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@energetika/shared';

const prisma = new PrismaClient();

/** Admin hisobi uchun parolni muhit o'zgaruvchisidan oladi — kodda hard-code qilinmaydi. */
function readAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      'ADMIN_PASSWORD muhit o\'zgaruvchisi o\'rnatilmagan.\n' +
        'Seed default parol qo\'ymaydi. .env fayliga kuchli parol yozing, masalan:\n' +
        '  ADMIN_PASSWORD="$(openssl rand -base64 24)"'
    );
  }
  if (password.length < 10) {
    throw new Error('ADMIN_PASSWORD kamida 10 belgidan iborat bo\'lishi kerak.');
  }
  return password;
}

async function main() {
  console.log('Seeding database...');

  // Create admin
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@energetika.uz';
  const hashedPassword = await hashPassword(readAdminPassword());
  await prisma.admin.upsert({
    where: { email: adminEmail },
    // Parol ADMIN_PASSWORD dan olinadi, shuning uchun qayta seed qilinganda
    // mavjud admin hash'i ham yangi formatga yangilanadi.
    update: { password: hashedPassword },
    create: {
      email: adminEmail,
      name: 'Administrator',
      password: hashedPassword,
    },
  });
  console.log(`✓ Admin tayyor: ${adminEmail} (parol ADMIN_PASSWORD dan olindi)`);

  // Tuzilma — FA Prezidiumining 2025-yil 27-fevraldagi 12-son qarori, 10-ilova.
  // Manba: docs/reference/tuzilma-2025-02-27.jpg. `head` HAMMA joyda null —
  // ism-sharifni institut o'zi kiritadi, o'ylab topilmaydi.
  type Unit = {
    id: string;
    nameUz: string; nameEn: string; nameRu: string;
    type: string;
    parentId: string | null;
    staffCount?: number;
    isAdvisory?: boolean;
    order: number;
    descriptionUz?: string; descriptionEn?: string; descriptionRu?: string;
  };

  const units: Unit[] = [
    // — Boshqaruv —
    { id: 'director', nameUz: 'Direktor', nameEn: 'Director', nameRu: 'Директор',
      type: 'position', parentId: null, order: 0 },
    { id: 'academic-council', nameUz: 'Ilmiy kengash', nameEn: 'Academic Council', nameRu: 'Учёный совет',
      type: 'council', parentId: 'director', isAdvisory: true, order: 1 },
    { id: 'scientific-secretary', nameUz: 'Ilmiy kotib', nameEn: 'Scientific Secretary', nameRu: 'Учёный секретарь',
      type: 'position', parentId: 'director', order: 2 },
    { id: 'deputy-science', nameUz: "Ilm-fan bo'yicha direktor o'rinbosari",
      nameEn: 'Deputy Director for Science', nameRu: 'Заместитель директора по науке',
      type: 'position', parentId: 'director', order: 3 },
    { id: 'deputy-general', nameUz: "Umumiy masalalar bo'yicha direktor o'rinbosari",
      nameEn: 'Deputy Director for General Affairs', nameRu: 'Заместитель директора по общим вопросам',
      type: 'position', parentId: 'director', order: 4 },

    // — 6 ilmiy laboratoriya (Ilm-fan o'rinbosari ostida) —
    { id: 'lab-energy-security',
      nameUz: "“Energetikaning rivojlanish istiqbollari va energetik xavfsizlik” ilmiy laboratoriyasi",
      nameEn: 'Laboratory for Energy Development Prospects and Energy Security',
      nameRu: 'Лаборатория перспектив развития энергетики и энергетической безопасности',
      type: 'laboratory', parentId: 'deputy-science', staffCount: 3, order: 10 },
    { id: 'lab-power-systems',
      nameUz: "“Elektr energetika tizimlari va majmualari” ilmiy laboratoriyasi",
      nameEn: 'Laboratory of Electric Power Systems and Complexes',
      nameRu: 'Лаборатория электроэнергетических систем и комплексов',
      type: 'laboratory', parentId: 'deputy-science', staffCount: 3, order: 11 },
    { id: 'lab-renewable',
      nameUz: "“Muqobil va qayta tiklanuvchi energiya manbalaridan kompleks foydalanish” ilmiy laboratoriyasi",
      nameEn: 'Laboratory for Integrated Use of Alternative and Renewable Energy Sources',
      nameRu: 'Лаборатория комплексного использования альтернативных и возобновляемых источников энергии',
      type: 'laboratory', parentId: 'deputy-science', staffCount: 4, order: 12 },
    { id: 'lab-electrotech',
      nameUz: "“Elektrotexnologiyalar va energetik uskunalarni ekspluatatsiya qilish” ilmiy laboratoriyasi",
      nameEn: 'Laboratory of Electrotechnologies and Operation of Power Equipment',
      nameRu: 'Лаборатория электротехнологий и эксплуатации энергетического оборудования',
      type: 'laboratory', parentId: 'deputy-science', staffCount: 2, order: 13 },
    { id: 'lab-efficiency',
      nameUz: "“Energiya samaradorligi va energiya tejash tizimlari” ilmiy laboratoriyasi",
      nameEn: 'Laboratory of Energy Efficiency and Energy Saving Systems',
      nameRu: 'Лаборатория энергоэффективности и систем энергосбережения',
      type: 'laboratory', parentId: 'deputy-science', staffCount: 2, order: 14 },
    { id: 'lab-smart-grid',
      nameUz: "“Intellektual energiya tizimlari, energetik tizimlar va quvvatlarni integratsiyalash” ilmiy laboratoriyasi",
      nameEn: 'Laboratory of Intelligent Energy Systems and Integration of Power Systems and Capacities',
      nameRu: 'Лаборатория интеллектуальных энергетических систем, интеграции энергосистем и мощностей',
      type: 'laboratory', parentId: 'deputy-science', staffCount: 3, order: 15 },
    { id: 'integration-center',
      nameUz: 'Integratsiya-resurs markazi mutaxassisi',
      nameEn: 'Integration and Resource Centre Specialist',
      nameRu: 'Специалист интеграционно-ресурсного центра',
      type: 'position', parentId: 'deputy-science', staffCount: 1, order: 16 },

    // — Ma'muriy bo'linmalar —
    { id: 'finance-dept', nameUz: 'Moliya-iqtisodiyot bo\'limi',
      nameEn: 'Finance and Economics Department', nameRu: 'Финансово-экономический отдел',
      type: 'department', parentId: 'director', staffCount: 3, order: 20 },
    { id: 'legal-counsel', nameUz: 'Bosh yuriskonsult',
      nameEn: 'Chief Legal Counsel', nameRu: 'Главный юрисконсульт',
      type: 'position', parentId: 'director', staffCount: 1, order: 21 },
    { id: 'hr-chancellery', nameUz: 'Xodimlar bo\'yicha inspektor va devonxona',
      nameEn: 'HR Inspector and Chancellery', nameRu: 'Инспектор по кадрам и канцелярия',
      type: 'position', parentId: 'director', staffCount: 2, order: 22 },
    { id: 'ict-specialist', nameUz: 'AKT bo\'yicha mutaxassis',
      nameEn: 'ICT Specialist', nameRu: 'Специалист по ИКТ',
      type: 'position', parentId: 'director', staffCount: 1, order: 23 },
    { id: 'engineering-service', nameUz: 'Injener-texnik va xo\'jalik xizmati',
      nameEn: 'Engineering and Maintenance Service', nameRu: 'Инженерно-техническая и хозяйственная служба',
      type: 'service', parentId: 'deputy-general', order: 24,
      descriptionUz: 'Ilmiy-yordamchi va yordamchi xodimlar soni qonunchilik hujjatlariga muvofiq normativlar bo\'yicha belgilanadi.',
      descriptionEn: 'The number of research-support and support staff is set according to the norms established by law.',
      descriptionRu: 'Численность научно-вспомогательного и вспомогательного персонала определяется по нормативам согласно законодательству.' },
  ];

  // Eski demo yozuvlarni olib tashlash (taxminiy tuzilma — hujjatda yo'q).
  // DIQQAT: bu DELETE. Production'da ehtiyot bo'ling (CLAUDE.md 8-qoida).
  const legacyIds = [
    'dept-energy-systems', 'dept-renewable', 'dept-efficiency', 'dept-solar',
    'dept-wind', 'dept-grid',
  ];
  await prisma.structureUnit.deleteMany({ where: { id: { in: legacyIds } } });

  // Ota-birlik avval yaratilishi kerak (FK) — `units` massivi shu tartibda tuzilgan.
  for (const u of units) {
    const data = {
      nameUz: u.nameUz, nameEn: u.nameEn, nameRu: u.nameRu,
      descriptionUz: u.descriptionUz ?? '', descriptionEn: u.descriptionEn ?? '', descriptionRu: u.descriptionRu ?? '',
      head: null,
      type: u.type,
      staffCount: u.staffCount ?? null,
      isAdvisory: u.isAdvisory ?? false,
      order: u.order,
      parentId: u.parentId,
    };
    await prisma.structureUnit.upsert({
      where: { id: u.id },
      update: data,
      create: { id: u.id, ...data },
    });
  }
  console.log(`✓ Structure units created (${units.length} ta, hujjatga muvofiq)`);

  // Seed site settings
  const settings = [
    { key: 'site_name_uz', value: 'Energetika muammolari instituti' },
    { key: 'site_name_en', value: 'Institute of Energy Problems' },
    { key: 'site_name_ru', value: 'Институт проблем энергетики' },
    // Manzil va pochta — foydalanuvchi tomonidan tasdiqlangan haqiqiy qiymatlar.
    { key: 'address_uz', value: 'Toshkent shahri, Mirzo Ulug\'bek tumani, Do\'rmon yo\'li ko\'chasi, 40-uy' },
    { key: 'address_en', value: '40 Dormon Yoli Street, Mirzo Ulugbek district, Tashkent' },
    { key: 'address_ru', value: 'г. Ташкент, Мирзо-Улугбекский район, ул. Дурмон йули, 40' },
    { key: 'email', value: 'energy@academy.uz' },
    // Telefon va ish vaqti hali tasdiqlanmagan — BO'SH qoladi. Frontend bo'sh
    // qiymatda o'sha qatorni umuman ko'rsatmaydi. Aniqlangach admin panel orqali
    // kiritiladi; bu yerga taxminiy raqam yozilmaydi.
    { key: 'phone', value: '' },
    { key: 'working_hours', value: '' },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✓ Site settings seeded');

  console.log('\n✅ Seeding complete!');
}

main()
  .catch((err: unknown) => {
    console.error('\n❌ Seed bajarilmadi:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
