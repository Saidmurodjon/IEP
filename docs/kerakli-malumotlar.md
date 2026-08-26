# Institutdan kerak bo'lgan ma'lumotlar

Bu ro'yxat saytdagi **bo'sh turgan** bo'limlar uchun. Kod tayyor — ma'lumot
kelgan zahoti admin panel orqali kiritiladi, dasturga tegilmaydi.

Soxta ism, tashkilot nomi va logotip **ataylab qo'yilmagan**: rasmiy davlat
muassasasi saytida tekshirilmagan ma'lumot turishi ishonchni yo'qotadi.

---

## 1. Rahbariyat (sahifa: `/management`)

Tuzilma hujjatidagi tartibda — direktor, ilm-fan bo'yicha o'rinbosar,
umumiy masalalar bo'yicha o'rinbosar, ilmiy kotib.

Har biri uchun:

| Ma'lumot | Majburiymi | Izoh |
|---|---|---|
| Ism-sharif | ✅ | **Uch tilda**: o'zbekcha (lotin), inglizcha (transliteratsiya), ruscha (kirill) |
| Lavozimi | ✅ | Uch tilda |
| Ilmiy darajasi | ixtiyoriy | Masalan: texnika fanlari doktori / PhD |
| Ilmiy unvoni | ixtiyoriy | Masalan: professor, dotsent |
| **Qabul kunlari va soatlari** | ✅ | Uch tilda, erkin matn: "Dushanba va chorshanba, 15:00 – 17:00" |
| Xona raqami | ixtiyoriy | |
| **Xizmat** telefoni | ixtiyoriy | Shaxsiy mobil raqam **emas** |
| **Xizmat** pochtasi | ixtiyoriy | Shaxsiy pochta **emas** |
| Fotosurat | ixtiyoriy | Kvadrat, kamida 400×400. Bo'lmasa ism bosh harflari ko'rsatiladi |

> Fuqarolar saytga ko'pincha aynan **qabul kunlarini** bilish uchun kiradi —
> shu sababli u kartochkada alohida ajratib ko'rsatiladi.

## 2. Xodimlar (sahifa: `/employees` va laboratoriya sahifalari)

Har bir laboratoriya bo'yicha xodimlar ro'yxati. Ustunlar rahbariyatdagi bilan
bir xil, qo'shimcha:

- **Qaysi laboratoriyaga** biriktirilishi (6 laboratoriyadan biri).
- **Laboratoriya mudiri** kim — u sahifada birinchi va kengaytirilgan
  kartochkada ko'rsatiladi.
- Ilmiy qiziqish yo'nalishi (uch tilda, ixtiyoriy).
- ORCID va Scopus Author ID (ixtiyoriy, lekin ilmiy muassasa uchun foydali).

Tuzilma hujjatiga ko'ra: 6 laboratoriyada 17 shtat birligi, integratsiya-resurs
markazida 1, ma'muriy bo'linmalarda 7.

## 3. Hamkor tashkilotlar (bosh sahifadagi lenta)

| Ma'lumot | Izoh |
|---|---|
| Tashkilot nomi | Uch tilda |
| Logotip fayli | PNG yoki SVG, shaffof fon, kamida 200px kenglik |
| Veb-sayti | ixtiyoriy |

**Faqat institut bilan haqiqatan hamkorlik qiladigan tashkilotlar.** Logotip —
tashkilotning savdo belgisi, uni o'zimiz tanlab qo'ya olmaymiz. Ro'yxat
kelmaguncha bosh sahifada bu bo'lim **umuman ko'rinmaydi**.

## 4. Laboratoriya tavsiflari — tasdiqlash kerak

Har bir laboratoriya sahifasida "Faoliyat yo'nalishi" matni bor. Ular
**o'ylab topilmagan**: Vazirlar Mahkamasi qarorida belgilangan institut
faoliyati yo'nalishlaridan laboratoriya nomiga mos keladigani olib yozilgan
(`packages/db/src/seed.ts`, `TODO: institut tasdiqlashi kerak` izohi).

**Institut ularni o'qib chiqsin va tasdiqlasin yoki o'z matnini bersin.**
Aniq loyihalar, natijalar, grantlar va sanalar ataylab yozilmagan — ular
hujjatda yo'q.

## 5. Oldingi topshiriqlardan qolgan

- **Institut telefon raqami va ish vaqti** — hozir bo'sh, saytda ko'rsatilmayapti.
- **Logotipning vektor fayli** (SVG/AI/EPS) yoki kamida 1000px shaffof PNG —
  batafsil `apps/web/public/images/CREDITS.md`.
- **373-son qaror bo'yicha yuriskonsult javobi.**
- Institut binosi va laboratoriyalari fotosuratlari (hozir vaqtinchalik
  public-domain rasmlar turibdi).
