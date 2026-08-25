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

  // Seed structure
  const directorUnit = await prisma.structureUnit.upsert({
    where: { id: 'director' },
    update: {},
    create: {
      id: 'director',
      nameUz: 'Institut direktori',
      nameEn: 'Director of the Institute',
      nameRu: 'Директор института',
      descriptionUz: 'Institutni boshqarish va rivojlantirish',
      descriptionEn: 'Managing and developing the institute',
      descriptionRu: 'Управление и развитие института',
      head: 'prof. Mirzayev A.K.',
      type: 'department',
      order: 0,
    },
  });

  const departments = [
    {
      id: 'dept-energy-systems',
      nameUz: 'Energetika tizimlari laboratoriyasi',
      nameEn: 'Energy Systems Laboratory',
      nameRu: 'Лаборатория энергетических систем',
      type: 'laboratory',
      order: 1,
    },
    {
      id: 'dept-renewable',
      nameUz: 'Qayta tiklanuvchi energiya manbalari bo\'limi',
      nameEn: 'Renewable Energy Sources Department',
      nameRu: 'Отдел возобновляемых источников энергии',
      type: 'department',
      order: 2,
    },
    {
      id: 'dept-efficiency',
      nameUz: 'Energiya samaradorligi markazi',
      nameEn: 'Energy Efficiency Center',
      nameRu: 'Центр энергоэффективности',
      type: 'center',
      order: 3,
    },
    {
      id: 'dept-solar',
      nameUz: 'Quyosh energetikasi laboratoriyasi',
      nameEn: 'Solar Energy Laboratory',
      nameRu: 'Лаборатория солнечной энергетики',
      type: 'laboratory',
      order: 4,
    },
  ];

  for (const dept of departments) {
    await prisma.structureUnit.upsert({
      where: { id: dept.id },
      update: {},
      create: {
        ...dept,
        descriptionUz: '',
        descriptionEn: '',
        descriptionRu: '',
        parentId: directorUnit.id,
      },
    });
  }
  console.log('✓ Structure units created');

  // Seed sample news
  await prisma.news.upsert({
    where: { slug: 'institute-opening-ceremony' },
    update: {},
    create: {
      slug: 'institute-opening-ceremony',
      titleUz: 'Institutda yangi laboratoriya ochildi',
      titleEn: 'New Laboratory Opened at the Institute',
      titleRu: 'В институте открылась новая лаборатория',
      summaryUz: 'Energetika muammolari institutida zamonaviy quyosh energetikasi laboratoriyasi ochildi.',
      summaryEn: 'A modern solar energy laboratory has been opened at the Institute of Energy Problems.',
      summaryRu: 'В Институте проблем энергетики открылась современная лаборатория солнечной энергетики.',
      contentUz: '<p>Bugun institutimizda zamonaviy quyosh energetikasi laboratoriyasi tantanali ravishda ochildi. Bu laboratoriya O\'zbekistonda quyosh energiyasidan foydalanishni rivojlantirishga katta hissa qo\'shadi.</p>',
      contentEn: '<p>Today, a modern solar energy laboratory was solemnly opened at our institute. This laboratory will make a significant contribution to the development of solar energy use in Uzbekistan.</p>',
      contentRu: '<p>Сегодня в нашем институте торжественно открылась современная лаборатория солнечной энергетики. Эта лаборатория внесет значительный вклад в развитие использования солнечной энергии в Узбекистане.</p>',
      publishedAt: new Date(),
    },
  });
  console.log('✓ Sample news created');

  // Seed site settings
  const settings = [
    { key: 'site_name_uz', value: 'Energetika muammolari instituti' },
    { key: 'site_name_en', value: 'Institute of Energy Problems' },
    { key: 'site_name_ru', value: 'Институт проблем энергетики' },
    { key: 'address_uz', value: 'Toshkent shahri, Mirzo Ulug\'bek tumani' },
    { key: 'address_en', value: 'Tashkent city, Mirzo Ulugbek district' },
    { key: 'address_ru', value: 'г. Ташкент, Мирзо-Улугбекский район' },
    { key: 'phone', value: '+998 71 262-00-00' },
    { key: 'email', value: 'info@energetika.uz' },
    { key: 'working_hours', value: 'Mon-Fri: 9:00 - 18:00' },
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
