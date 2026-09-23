# Topshiriq 15 — Xodim rasmi 3x4, ommaviy amal va modal fokus xatosi

**Ustuvorlik:** 🔴 Yuqori (3-band — admin panelda matn kiritib bo'lmaydi, ishni to'xtatadi)
**Bog'liq muammo:** `CLAUDE.md` da alohida qayd etilmagan, foydalanuvchi tomonidan topilgan
**Maqsad:** uchta mustaqil kamchilikni tuzatish — xodim surati andozasi, admin ro'yxatlarda
ommaviy tanlash/o'chirish/qoralamaga o'tkazish, va forma modalida yozishda fokus uchib ketishi.

Bu fayl **faqat reja** — kod hali o'zgartirilmagan. Tasdiqlangandan keyin amalga oshiriladi.

---

## 1. Xodim surati — 3x4 andozaga o'tkazish

**Hozirgi holat.** `FileUploadField` (`kind="photo"`) va `image-prepare.ts` faqat
kenglikni cheklaydi (`MAX_WIDTH_PHOTO=800`, `MIN_WIDTH_PHOTO=200`) — nisbat
(aspect ratio) umuman tekshirilmaydi, kesish (crop) imkoniyati yo'q. Ko'rsatishda
esa `EmployeeCard.tsx` dagi `Avatar` rasmni **doira** (`rounded-full`) qilib
chiqaradi — qanday rasm yuklansa ham doiraga sig'diriladi. Bu uch ochiq
sahifada ishlatiladi: `EmployeesPage`, `ManagementPage`, `LabDetailPage`
(uchalasi ham `EmployeeCard` orqali).

**Kerak bo'lgan o'zgarish.** Xodim surati rasmiy **3x4 (bo'yiga, portret)**
andozada bo'lsin — davlat muassasasi hujjatlarida odatiy shakl:

1. **Admin yuklash formasi** (`AdminEmployeesPage.tsx`, `FileUploadField.tsx`):
   yuklashda nisbat 3:4 ga tekshirilsin yoki kesish (crop) vositasi bilan
   foydalanuvchi o'zi 3:4 ga moslab kessin. Nisbat mos kelmasa aniq xato
   xabari chiqsin ("rasm 3x4 (bo'yiga) nisbatda bo'lishi kerak"), server
   tomonda jimgina cho'zib qo'yish YO'Q.
2. **Ko'rsatish** (`EmployeeCard.tsx` `Avatar`): rasm bo'lsa endi doira emas,
   **3:4 to'rtburchak** (`aspect-[3/4]`, `object-cover`, burchaklari
   yumaloqlangan) chiqsin. Rasm yo'q holatdagi bosh-harfli zaxira ham xuddi
   shu nisbatga moslashtirilsin (hozirgi doiraviy fallback o'zgaradi).
3. Eski (doira uchun yuklangan, nisbatsiz) rasmlar bilan orqaga qarab
   moslik: mavjud `photoUrl` larni majburiy o'chirish/qayta yuklashga
   majburlamang — faqat **yangi** yuklashlarda 3:4 talab qilinsin, ko'rsatishda
   `object-cover` eski nomutanosib rasmni ham chiroyli kesadi.
4. Docs: `CLAUDE.md` 17-bandi (fayl turi/hajmi) o'zgarmaydi, faqat andoza
   qo'shiladi — alohida yozib qo'yish shart emas, lekin `docs/tasks/14-*.md`
   dagi test-rasm generatsiyasi (400x400 kvadrat) ham shu topshiriqda 3:4 ga
   moslansa maqsadga muvofiq (ixtiyoriy, asosiy ish emas).

---

## 2. Admin ro'yxatlarda ommaviy amal — belgilab o'chirish yoki qoralama qilish

**Hozirgi holat.** Har bir admin ro'yxat sahifasida (`AdminNewsPage`,
`AdminPublicationsPage`, `AdminDocumentsPage`, `AdminEmployeesPage`,
`AdminPartnersPage`, ...) o'chirish faqat **bitta yozuv** uchun ishlaydi —
qatordagi chelak ikonkasi bosiladi, `confirm()` chiqadi, bitta `DELETE`
so'rovi ketadi (`deleteMutation.mutate(item.id)`). Ommaviy tanlash
(checkbox) yo'q. Faqat `News` modelida qoralama holati bor (`isPublished`).

**Kerak bo'lgan o'zgarish.**

1. Har bir qator boshiga checkbox, jadval sarlavhasida "hammasini tanlash"
   checkboxi qo'shiladi. Kamida `AdminNewsPage`ni qamrab olsin (u yerda
   ham o'chirish, ham qoralama kerak); imkon bo'lsa xuddi shu naqsh
   `AdminPublicationsPage`, `AdminDocumentsPage`, `AdminEmployeesPage`,
   `AdminPartnersPage` ga ham qo'llansin — bularning hammasida bir xil
   `useMutation` + `api.delete(id)` naqshi allaqachon bor, shuning uchun
   umumiy komponent/hook (masalan `useBulkSelection`) sifatida yozish
   maqsadga muvofiq, har sahifada qaytadan yozmaslik uchun.
2. Bir yoki bir nechta qator belgilanganda jadval ustida amal paneli
   chiqadi: **"N ta tanlandi" + "O'chirish" + (faqat News da) "Qoralamaga
   o'tkazish"**.
3. **O'chirish**: `confirm()` bilan tasdiqlansin (nechta yozuv o'chishi
   aniq aytilsin), so'ng tanlangan har bir `id` uchun mavjud `DELETE`
   endpoint'i chaqiriladi (`Promise.all`/ketma-ket — yangi backend endpoint
   shart emas, mavjudlari `requireAuth` bilan himoyalangan). Xatolik bir
   yozuvda chiqsa, muvaffaqiyatli o'chganlar ro'yxatdan yo'qolsin, xato
   berganlar haqida aniq xabar (`useToast`) chiqsin — hammasi "hammasi yoki
   hech narsa" bo'lishi shart emas.
4. **Qoralamaga o'tkazish** (faqat News): tanlangan yozuvlarga mavjud
   `PATCH /api/news/:id` (`isPublished: false`) ketma-ket yuborilsin —
   yangi backend endpoint shart emas.
5. Amaldan keyin tegishli `queryKey` invalidatsiya qilinsin (mavjud
   naqsh — `qc.invalidateQueries`), tanlov tozalansin.
6. Har bir checkbox va "hammasini tanlash" uchun `aria-label` /
   `label`+`htmlFor` — 373-son qaror 11-band (`CLAUDE.md` 21-bandi) talabi.

---

## 3. Modal ochiq holda yozishda fokus X (yopish) tugmasiga uchib ketadi

**Sabab topildi — bu hozircha faraz emas, kod bilan tasdiqlangan.**

`apps/web/src/hooks/useFocusTrap.ts`:

```ts
useEffect(() => {
  ...
  const first = container.querySelector<HTMLElement>(FOCUSABLE);
  (first ?? container).focus();   // <-- HAR safar effekt qayta ishga tushganda
  ...
}, [ref, active, onClose]);        // <-- onClose bog'liqlik ro'yxatida
```

Har bir admin sahifasida (`AdminNewsPage`, `AdminEmployeesPage`,
`AdminDocumentsPage`, `AdminPublicationsPage`, `AdminPartnersPage`,
`AdminStructurePage`) `closeForm` **memoizatsiyasiz** yoziladi:

```ts
const closeForm = () => { setShowForm(false); ...; reset(); };
useFocusTrap(formRef, showForm, closeForm);
```

Har bir render'da `closeForm` yangi funksiya bo'lib yaratiladi → `useEffect`
bog'liqligi o'zgaradi → effekt **har renderda** qayta ishga tushadi → 
`container.querySelector(FOCUSABLE)` bilan topilgan **birinchi** fokuslanadigan
element (modalda bu — sarlavhadagi X/yopish tugmasi, forma maydonlaridan
oldin joylashgan) qayta fokuslanadi. Inputga bitta harf yozish `setValue`/
`watch` orqali komponentni qayta render qiladi → aynan shu effekt zanjiri
ishga tushadi → fokus inputdan X tugmaga sakraydi. Foydalanuvchi tasvirlagan
xato — aynan shu.

**Tuzatish yo'nalishi (bitta joyda, hook darajasida — 6 sahifada emas).**
Muammo ikkita mas'uliyatning bitta effektga aralashib ketganida: (a) modal
**ochilganda** birinchi elementga fokus berish — faqat `active` `false` dan
`true` ga o'tganda ishlashi kerak; (b) `Tab`/`Escape` klaviatura tinglovchisi
— har doim eng yangi `onClose` ni ishlatishi kerak, lekin bu uni qayta
o'rnatishni talab qilmaydi. Ikkalasini ajratish kerak: masalan `onClose` ni
`useRef` orqali saqlab, faqat `active` o'zgarganda dastlabki-fokus va
listener o'rnatilsin, `onKeyDown` ichida `onCloseRef.current()` chaqirilsin.
Shu bilan bog'liqlik ro'yxati `[ref, active]` ga tushadi va `closeForm`ning
har render yangilanishi effektga umuman ta'sir qilmaydi. Sahifalardagi
`closeForm` larni `useCallback`ga o'rash HAM yordam beradi, lekin bu
6 joyda takrorlanadi va kelajakda yangi sahifa xuddi shu xatoni qaytarishi
mumkin — shuning uchun asosiy tuzatish hook ichida bo'lsin.

---

## Qabul mezonlari

- [ ] **3x4 rasm**: admin panelda xodimga rasm yuklaganda 3:4 dan boshqa
      nisbat rad etiladi (aniq xabar bilan) yoki kesib moslashtiriladi;
      `/employees`, `/management`, laboratoriya sahifasida rasm 3:4
      to'rtburchak sifatida chiqadi, rasmsiz xodimda ham xuddi shu nisbatda
      bosh-harfli zaxira ko'rinadi.
- [ ] **Ommaviy amal**: kamida `AdminNewsPage`da bir nechta qator
      belgilanadi, "O'chirish" bir so'rovda (yoki ketma-ket, lekin bitta
      tugma bosilishi bilan) barchasini o'chiradi, "Qoralamaga o'tkazish"
      barchasini `isPublished:false` qiladi; ro'yxat va tegishli ochiq
      sahifa (`/news`) darhol yangilanadi.
- [ ] **Modal fokus**: admin formasi (masalan yangilik qo'shish) ochilib,
      sarlavha maydoniga uzluksiz 10+ harf yozib bo'ladi — fokus X tugmaga
      sakramaydi. Kamida ikkita sahifada qo'lda tekshiriladi
      (`AdminNewsPage`, `AdminEmployeesPage`); `Tab`/`Shift+Tab` bilan
      aylanish va `Escape` bilan yopilish avvalgidek ishlashda davom etadi
      (regressiya yo'q).
- [ ] `npx tsc --noEmit` (apps/web, apps/api) toza.
- [ ] `npm run dev` da uchala tuzatish qo'lda ko'rib chiqiladi (skrinshot
      shart emas, DOM/UI tekshiruvi yetarli).

---

## Tugatgandan keyin

`docs/JOURNAL.md` ga yozuv: qaysi sahifalarda ommaviy amal qo'shildi,
fokus tuzatishi hook darajasidami yoki sahifa darajasidamiligi, 3x4
o'tishda eski rasmlar bilan nima bo'lishi kelishilgani. Tekshirilmagan
narsa bo'lsa ochiq yozing.
