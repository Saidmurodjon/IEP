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
    //
    // TODO: institut tasdiqlashi kerak.
    // Quyidagi tavsiflar O'YLAB TOPILMAGAN: har biri Vazirlar Mahkamasi qarorida
    // belgilangan institut faoliyati yo'nalishlaridan (docs/tasks/04-kontent.md,
    // 3-bo'lim) laboratoriya nomiga mos keladiganini olib yozilgan. Aniq loyihalar,
    // natijalar, grantlar va sanalar ATAYLAB yozilmagan — ular hujjatda yo'q.
    // Institut tasdiqlagach yoki o'z matnini bergach almashtiriladi.
    { id: 'lab-energy-security',
      nameUz: "“Energetikaning rivojlanish istiqbollari va energetik xavfsizlik” ilmiy laboratoriyasi",
      nameEn: 'Laboratory for Energy Development Prospects and Energy Security',
      nameRu: 'Лаборатория перспектив развития энергетики и энергетической безопасности',
      type: 'laboratory', parentId: 'deputy-science', staffCount: 3, order: 10,
      descriptionUz: 'Laboratoriya respublikada energetikaning barqaror rivojlanish strategiyasini ishlab chiqish va yoqilg\'i-energetika kompleksini modernizatsiya qilish dasturlarini tayyorlashda ishtirok etadi. Shuningdek mamlakatning energetik xavfsizligini ta\'minlash, favqulodda vaziyatlarda yoqilg\'i-energetika kompleksi obyektlarining barqaror ishlashi masalalari o\'rganiladi.',
      descriptionEn: 'The laboratory takes part in developing the strategy for the sustainable development of the country\'s energy sector and in preparing programmes for the modernisation of the fuel and energy complex. It also studies national energy security and the resilient operation of fuel and energy facilities in emergency situations.',
      descriptionRu: 'Лаборатория участвует в разработке стратегии устойчивого развития энергетики республики и в подготовке программ модернизации топливно-энергетического комплекса. Также изучаются вопросы энергетической безопасности страны и устойчивой работы объектов топливно-энергетического комплекса в чрезвычайных ситуациях.' },
    { id: 'lab-power-systems',
      nameUz: "“Elektr energetika tizimlari va majmualari” ilmiy laboratoriyasi",
      nameEn: 'Laboratory of Electric Power Systems and Complexes',
      nameRu: 'Лаборатория электроэнергетических систем и комплексов',
      type: 'laboratory', parentId: 'deputy-science', staffCount: 3, order: 11,
      descriptionUz: 'Laboratoriya elektr energetika tizimlari va majmualarining ish rejimlarini tadqiq qiladi. Mintaqa davlatlari o\'rtasida yoqilg\'i-energiya manbalaridan birgalikda foydalanish bo\'yicha ilmiy asoslangan tavsiyalar tayyorlashda ishtirok etadi.',
      descriptionEn: 'The laboratory studies the operating regimes of electric power systems and complexes. It contributes to scientifically grounded recommendations on the joint use of fuel and energy resources by the countries of the region.',
      descriptionRu: 'Лаборатория исследует режимы работы электроэнергетических систем и комплексов. Участвует в подготовке научно обоснованных рекомендаций по совместному использованию топливно-энергетических ресурсов странами региона.' },
    { id: 'lab-renewable',
      nameUz: "“Muqobil va qayta tiklanuvchi energiya manbalaridan kompleks foydalanish” ilmiy laboratoriyasi",
      nameEn: 'Laboratory for Integrated Use of Alternative and Renewable Energy Sources',
      nameRu: 'Лаборатория комплексного использования альтернативных и возобновляемых источников энергии',
      type: 'laboratory', parentId: 'deputy-science', staffCount: 4, order: 12,
      descriptionUz: 'Laboratoriya muqobil va qayta tiklanuvchi energiya manbalaridan kompleks foydalanish masalalarini o\'rganadi. Muqobil energiya asosidagi yangi texnologiyalar va energetik uskunalar respublika iqlim sharoitlarida sinovdan o\'tkaziladi.',
      descriptionEn: 'The laboratory studies the integrated use of alternative and renewable energy sources. New technologies and power equipment based on alternative energy are tested under the climatic conditions of the republic.',
      descriptionRu: 'Лаборатория изучает вопросы комплексного использования альтернативных и возобновляемых источников энергии. Новые технологии и энергетическое оборудование на основе альтернативной энергетики испытываются в климатических условиях республики.' },
    { id: 'lab-electrotech',
      nameUz: "“Elektrotexnologiyalar va energetik uskunalarni ekspluatatsiya qilish” ilmiy laboratoriyasi",
      nameEn: 'Laboratory of Electrotechnologies and Operation of Power Equipment',
      nameRu: 'Лаборатория электротехнологий и эксплуатации энергетического оборудования',
      type: 'laboratory', parentId: 'deputy-science', staffCount: 2, order: 13,
      descriptionUz: 'Laboratoriya elektrotexnologiyalar va energetik uskunalarni ekspluatatsiya qilish masalalari bilan shug\'ullanadi. Yangi energetik uskunalarni respublika iqlim sharoitlarida sinovdan o\'tkazish ishlarida ishtirok etadi.',
      descriptionEn: 'The laboratory works on electrotechnologies and the operation of power equipment. It takes part in testing new power equipment under the climatic conditions of the republic.',
      descriptionRu: 'Лаборатория занимается вопросами электротехнологий и эксплуатации энергетического оборудования. Участвует в испытаниях нового энергетического оборудования в климатических условиях республики.' },
    { id: 'lab-efficiency',
      nameUz: "“Energiya samaradorligi va energiya tejash tizimlari” ilmiy laboratoriyasi",
      nameEn: 'Laboratory of Energy Efficiency and Energy Saving Systems',
      nameRu: 'Лаборатория энергоэффективности и систем энергосбережения',
      type: 'laboratory', parentId: 'deputy-science', staffCount: 2, order: 14,
      descriptionUz: 'Laboratoriya iqtisodiyot tarmoqlarida energiya sarfini pasaytirish bo\'yicha kompleks tadqiqotlar olib boradi. Energiya samaradorligini oshirish va energiya tejash tizimlarini joriy etish masalalari o\'rganiladi.',
      descriptionEn: 'The laboratory conducts comprehensive research on reducing energy consumption across sectors of the economy. It studies ways to improve energy efficiency and to introduce energy-saving systems.',
      descriptionRu: 'Лаборатория проводит комплексные исследования по снижению энергопотребления в отраслях экономики. Изучаются вопросы повышения энергоэффективности и внедрения систем энергосбережения.' },
    { id: 'lab-smart-grid',
      nameUz: "“Intellektual energiya tizimlari, energetik tizimlar va quvvatlarni integratsiyalash” ilmiy laboratoriyasi",
      nameEn: 'Laboratory of Intelligent Energy Systems and Integration of Power Systems and Capacities',
      nameRu: 'Лаборатория интеллектуальных энергетических систем, интеграции энергосистем и мощностей',
      type: 'laboratory', parentId: 'deputy-science', staffCount: 3, order: 15,
      descriptionUz: 'Laboratoriya «intellektual tarmoqlar» nazariyasini rivojlantirish va uni energetikaga joriy etish bilan shug\'ullanadi. Energetik tizimlar va quvvatlarni integratsiyalash masalalari tadqiq qilinadi.',
      descriptionEn: 'The laboratory develops the theory of «smart grids» and its application in the energy sector. It studies the integration of power systems and generating capacities.',
      descriptionRu: 'Лаборатория занимается развитием теории «интеллектуальных сетей» и её внедрением в энергетику. Исследуются вопросы интеграции энергосистем и мощностей.' },
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
    // canonical / hreflang havolalari uchun asosiy manzil. Domen ulangach
    // (iep.uz) admin paneldan o'zgartiriladi — kodga yozilmaydi.
    { key: 'site_url', value: 'https://energetika-institute.pages.dev' },
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
    // Murojaat bildirishnomalari uchun pochta. Bo'sh bo'lsa umumiy `email`
    // ishlatiladi. Institut alohida manzil bersa shu yerga kiritiladi.
    { key: 'appeals_email', value: '' },
    // TODO: aniq muddat institut YURISKONSULTIDAN aniqlashtirilishi kerak.
    { key: 'appeals_retention_days', value: '365' },
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
