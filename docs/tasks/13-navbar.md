# Topshiriq 13 — Navbarni ikki darajali mega-menyuga o'tkazish

**Ustuvorlik:** 🔴 Yuqori, yangi sahifalar qo'shilishidan oldin
**Navbat:** 12 dan keyin, yangi bo'limlar (hujjatlar, hamkorlar, galereya) qo'shilishidan oldin

---

## Nima uchun hozir

Hozir sarlavhada to'qqizta tekis havola turibdi: bosh sahifa, institut haqida,
rahbariyat, tuzilma, laboratoriyalar, xodimlar, yangiliklar, nashrlar, aloqa.

Ular 1280px ekranda zo'rg'a sig'adi. Ruscha matn o'zbekchadan qariyb beshdan bir
ulush uzun, shuning uchun `ru` tilida menyu 1024px da allaqachon siqilib qoladi.

Oldinda hujjatlar, hamkorlar, murojaat holati, ochiq ma'lumotlar, galereya,
loyihalar va boshqa bo'limlar bor. Ularning har biri tekis menyuga qo'shilsa,
menyu ikkinchi qatorga tushadi.

**Shuning uchun tuzilma yangi sahifalar qo'shilishidan oldin o'zgartiriladi.**
Har bir yangi havola keyingi qayta tuzishni qimmatlashtiradi.

---

## Qabul qilingan qaror

Ikki darajali mega-menyu tanlandi. Yuqori darajada oltita element qoladi,
qolganlari guruhlar ichiga kiradi.

Menyu tarkibi **kodda**, bitta statik konfiguratsiya faylida saqlansin. Admin
paneldan boshqarilmasin — menyu tuzilmasi kod bilan birga versiyalanadigan
qaror, kontent emas.

Uchinchi daraja bo'lmaydi. Guruh ichida yana dropdown ochish taqiqlanadi.

---

## 1. Menyu tuzilmasi

`[K]` belgisi qo'yilgan sahifalar hozir mavjud emas. Ular konfiguratsiyaga
`hidden` belgisi bilan yozilsin va sahifa tayyor bo'lgach belgisi olib
tashlansin.

```
Bosh sahifa                          /
│
Institut                             (guruh)
├── Institut haqida                  /about
├── Tarix                            /about/history          [K]
├── Rahbariyat                       /management
├── Institut tuzilmasi               /structure
├── Xodimlar                         /employees
├── Me'yoriy hujjatlar               /documents
├── Hamkorlar                        /partners
└── Vakansiyalar                     /vacancies              [K]
│
Ilmiy faoliyat                       (guruh)
├── Ilmiy laboratoriyalar            /laboratories
├── Tadqiqot yo'nalishlari           /research               [K]
├── Loyihalar va grantlar            /projects               [K]
├── Nashrlar                         /publications
├── Patentlar                        /patents                [K]
├── Ilmiy kengash                    /council                [K]
└── Doktorantura                     /phd                    [K]
│
Axborot xizmati                      (guruh)
├── Yangiliklar                      /news
├── E'lonlar                         /announcements          [K]
├── Konferensiya va tadbirlar        /events                 [K]
├── Foto galereya                    /gallery                [K]
└── Videomateriallar                 /video                  [K]
│
Ochiqlik                             (guruh)
├── Murojaat holatini tekshirish     /appeal-status
├── Ochiq ma'lumotlar                /open-data              [K]
├── Korrupsiyaga qarshi kurash       /anticorruption         [K]
└── Savol-javob                      /faq                    [K]
│
Aloqa                                /contact
```

Aloqa yuqori darajada alohida havola bo'lib qolsin. Murojaat yuborish formasi
o'sha sahifada, shuning uchun `Ochiqlik` guruhida faqat holatni tekshirish
turadi. **Bitta manzil menyuda ikki marta uchramasin.**

Bosh sahifa va Aloqa — yagona dropdownsiz elementlar, menyuning boshi va oxiri.

### Guruhlar hajmi

Yuqori darajada oltitadan ortiq element bo'lmasin, eng ko'pi bilan yettita.
Bir guruhda to'rttadan to'qqiztagacha havola bo'lsin.

To'rttadan kam bo'lsa guruh ortiqcha — havolalari qo'shni guruhga ko'chirilsin.
To'qqiztadan ko'p bo'lsa guruh ikkiga bo'linsin.

---

## 2. Konfiguratsiya

`apps/web/src/config/navigation.ts` fayli yaratilsin. Menyu daraxti shu yerda,
bitta massivda saqlansin.

Har bir element uchun: barqaror `id`, i18n kaliti, manzil, ichki havolalar
ro'yxati, `hidden` belgisi. Ixtiyoriy ravishda qisqa izoh kaliti va tashqi
havola belgisi.

`id` keyinchalik o'zgartirilmasin — u i18n kaliti va `aria-controls` uchun
asos bo'ladi.

Manzillar til prefiksisiz yozilsin, prefiksni `LocalizedLink` qo'shadi
(topshiriq 12 qoidasi).

Konfiguratsiyada faqat ma'lumot bo'lsin. JSX, stil yoki shart yozilmasin.

Elementlar tartibi ekrandagi tartib bilan bir xil. Alifbo bo'yicha qayta
saralanmasin.

### Bitta manba

Bu fayl **yagona manba** bo'lsin. Undan sarlavha menyusi, mobil menyu,
footerdagi «Sahifalar» ro'yxati, 404 sahifasidagi «Asosiy bo'limlar» va
topshiriq 12 da tayyorlangan sahifalar ro'yxati oziqlansin.

Havolani ikkinchi joyda qo'lda yozish taqiqlansin. Hozir footerda takrorlangan
havolalar bo'lsa, ular shu manbaga ko'chirilsin.

---

## 3. Matnlar

Kalit sxemasi `nav.<guruh>.label` va `nav.<guruh>.items.<sahifa>` bo'lsin.
Masalan `nav.institute.label`, `nav.institute.items.management`.

Eski tekis kalitlar (`nav.home`, `nav.about` va boshqalar) ko'chirish
tugagandan keyin uchala fayldan **olib tashlansin**, ikkilanish qolmasin.

Uchala til fayli doim bir xil kalit to'plamiga ega bo'lsin. Tarjimasi yo'q
element menyuga chiqarilmasin — kalit nomining ekranda ko'rinishi qabul
qilinmaydi.

Yuqori daraja matni uzun bo'lmasin: o'zbekchada 18, inglizchada 16, ruschada
22 belgidan oshmasin. Panel ichidagi havolalar 32 belgidan oshmasin.

Tuzilma **ruscha tilda sinab ko'rilgandan keyin** qabul qilinsin. Eng uzun
matn ruschada bo'ladi.

---

## 4. Ko'rinish

### Yuqori daraja

Shrift 15px, og'irligi 500. Ichki bo'shliq gorizontal 14px, vertikal 10px.
Elementlar orasi 4px, burchak radiusi 8px.

Guruh nomidan keyin 14px chevron ikonkasi tursin. Panel ochilganda 180
gradusga aylansin, o'tish 150ms.

Ranglar mavjud `primary` shkalasidan olinsin. Odatiy holat `gray-600`, hover
`gray-50` fon va `primary-700` matn, ochiq guruh `primary-50` fon.

Joriy sahifa **rang bilan ham, 2px pastki chiziq bilan ham** belgilansin.
Faqat rangga tayanilmasin.

### Panel

Panel konteyner kengligida, eng ko'pi 1200px, markazda tursin. Ichki bo'shliq
32px, ustunlar uchta, ustunlar orasi 32px. Guruhda to'rttagacha havola bo'lsa
ikkita ustun yetarli.

Yuqori chegara 2px `primary-600`, soyasi katta va yumshoq, pastki burchaklari
12px.

Ustun sarlavhasi 12px, katta harflarda, `gray-400`. Havola 14px, vertikal
bo'shliq 8px.

Izoh yozilsa 12px va `gray-500`, bir qatorga sig'sin, oshsa qisqartirilsin.

Ochilish animatsiyasi 150ms: shaffoflik va 4px yuqoridan pastga siljish.
**Balandlik animatsiya qilinmasin** — bu butun sahifani qayta hisoblashga
majbur qiladi.

---

## 5. Xatti-harakat

Sichqoncha guruh ustiga kelganda panel darhol emas, **100ms kechikish bilan**
ochilsin. Aks holda menyu ustidan o'tib ketayotganda panellar ketma-ket ochilib
ko'zni charchatadi.

Sichqoncha ketganda **200ms kechikish bilan** yopilsin, foydalanuvchi panel
tomon harakat qilayotganda menyu ko'z oldida yopilib qolmasin.

Bir guruhdan ikkinchisiga o'tilganda kechikish qo'llanilmasin — eskisi yopilib
yangisi darhol ochilsin.

Guruh ustiga bosilganda ochiq bo'lsa yopilsin, yopiq bo'lsa ochilsin. Sensorli
ekranda birinchi teginish faqat ochsin, sahifaga o'tkazmasin.

`Escape` bosilganda panel yopilib, fokus guruh tugmasiga qaytsin.

Tashqariga bosilganda, sahifa scroll qilinganda va **marshrut o'zgarganda**
barcha panellar hamda mobil menyu majburan yopilsin.

Bir vaqtda faqat bitta panel ochiq bo'lsin. Til dropdowni ochilsa menyu
yopilsin va aksincha.

### Faol holat

Manzil to'liq yoki prefiks bo'yicha mos kelsa havola faol hisoblansin.
`/news/qandaydir-yangilik` sahifasida `Yangiliklar` faol ko'rinsin.

Ichidagi biror havola faol bo'lsa guruh ham faol ko'rinsin.

Bosh sahifa faqat to'liq moslikda faol bo'lsin.

Solishtirishdan oldin til prefiksi olib tashlansin.

---

## 6. Ekran kengligi

1280px va undan keng ekranda menyu to'liq ko'rinsin.

1024px dan 1279px gacha element bo'shligi 14px dan 10px ga, shrift 15px dan
14px ga tushsin. Topbardagi telefon va pochta yashirilsin.

1024px dan tor ekranda gamburger tugmasi chiqsin. 768px dan tor ekranda
logotip yonidagi matn olib tashlanib, faqat emblema qolsin va topbar butunlay
yashirilsin.

**Menyu hech qachon ikkinchi qatorga tushmasin va gorizontal scroll
bermasin.** 1024px da sig'masa, yechim shriftni kichraytirish emas —
guruhlarni qayta tuzish yoki gamburger chegarasini 1280px ga ko'tarish.

### Mobil menyu

To'liq ekran chiqadigan panel bo'lsin, 200ms ichida ochilsin.

Guruhlar akkordeon sifatida ishlasin, bir vaqtda bittasi ochiq bo'lsin. Joriy
sahifa qaysi guruhga tegishli bo'lsa, menyu ochilganda o'sha guruh yoyilgan
holda chiqsin.

Menyu ochiq turganda sahifa orqasida scroll qilinmasin, yopilganda scroll
tiklansin.

Pastida til tanlash, telefon va pochta tursin.

Har bir bosiladigan element balandligi 44px dan kam bo'lmasin.

---

## 7. Klaviatura va skrinrider

Asos qilib WAI-ARIA `Disclosure Navigation` naqshi olinsin. `menubar` naqshi
ishlatilmasin — bu sayt navigatsiyasi, dastur menyusi emas.

`nav` elementiga `aria-label` berilsin va u tarjima qilinsin.

Guruh **tugma** bo'lsin, havola emas. Unda `aria-expanded` va panel
identifikatoriga ishora qiluvchi `aria-controls` bo'lsin. Panelda `id` va
guruh nomiga ishora qiluvchi `aria-labelledby` bo'lsin.

Guruhning «bosh sahifasi» bo'lsa, u panel ichidagi birinchi havola sifatida
berilsin. Guruh sarlavhasi bir vaqtning o'zida ham havola, ham dropdown
ochuvchi bo'lmasin — sensorli ekranda bu noaniqlik tug'diradi.

Joriy sahifa havolasida `aria-current="page"` bo'lsin. Chevron ikonkasi
`aria-hidden` bo'lsin.

Klaviatura bilan: `Enter` va `Space` guruhni ochib-yopsin. `↓` guruh fokusda
turganda panelni ochib birinchi havolaga o'tsin. `↑` va `↓` panel ichida
havolalar bo'ylab yursin. `Escape` yopsin va fokusni qaytarsin. Panelning
oxirgi havolasidan `Tab` bosilganda panel yopilib keyingi elementga o'tsin.

Panel yopiq turganda uning havolalari `Tab` bilan fokus olmasin.

Fokus halqasi hech qanday holatda o'chirilmasin.

`prefers-reduced-motion` qiymati `reduce` bo'lsa barcha animatsiyalar
o'chirilib, panel darhol ko'rinsin.

Fokus tuzog'i faqat mobil menyuda bo'lsin, desktop panelda kerak emas.

---

## 8. Texnik cheklovlar

Barcha panellar DOM da tursin, lekin yopiq holatda ko'rinmasin. Animatsiya
uchun shaffoflik va siljish ishlatilsin.

Ikonkalar `lucide-react` dan nomma-nom import qilinsin.

Hover kechikishi taymerlari komponent yo'q qilinganda tozalansin.

Butun sayt bo'ylab yagona `z-index` shkalasi ishlatilsin: tashqi yopuvchi
qatlam 30, sarlavha 40, menyu va til dropdowni 50, mobil panel 60, modal va
xabarnoma 100. Hozirgi kodda til dropdowni 50, tashqi qatlam 30 — bu shkalaga
mos, sarlavha 40 bo'lib qolsin.

---

## Qabul mezonlari

- [ ] `npx tsc --noEmit` va `npm run build` toza.
- [ ] Yuqori darajada yettitadan ko'p element yo'q; har bir guruhda to'rttadan
      to'qqiztagacha havola.
- [ ] 1024, 1280 va 1440px kengliklarda menyu **bir qatorda** sig'adi va
      gorizontal scroll bermaydi — uchala tilda ham tekshirilgan.
- [ ] 375 va 768px da mobil menyu ochiladi, akkordeon ishlaydi, orqadagi
      sahifa scroll qilinmaydi.
- [ ] Joriy sahifaga tegishli guruh mobil menyu ochilganda yoyilgan holda
      chiqadi.
- [ ] Sichqonchani menyu ustidan tez o'tkazganda panellar ketma-ket ochilib
      ketmaydi.
- [ ] Guruhdan panelga sichqoncha bilan o'tishda panel yopilib qolmaydi.
- [ ] Faqat klaviatura bilan barcha havolalarga yetib borish mumkin;
      `Escape` yopadi va fokusni qaytaradi; fokus halqasi ko'rinadi.
- [ ] `aria-expanded`, `aria-controls`, `aria-labelledby`, `aria-current`
      to'g'ri qo'yilgan, konsolda ARIA ogohlantirishi yo'q.
- [ ] Marshrut o'zgarganda barcha panellar yopiladi.
- [ ] `/news/:slug` kabi ichki sahifada `Yangiliklar` va `Axborot xizmati`
      ikkalasi ham faol ko'rinadi.
- [ ] Til almashtirilganda foydalanuvchi joriy sahifada qoladi (topshiriq 12
      xulqi buzilmagan).
- [ ] `uz`, `ru`, `en` fayllarida kalit to'plami bir xil; eski tekis `nav.*`
      kalitlari olib tashlangan.
- [ ] Footer va 404 sahifasidagi ro'yxatlar `navigation.ts` dan oziqlanadi,
      qo'lda yozilgan havola qolmagan.
- [ ] `hidden` belgisi qo'yilgan sahifalar menyuda ko'rinmaydi.
- [ ] `prefers-reduced-motion` yoqilganda animatsiya yo'q.
- [ ] Lighthouse Accessibility ko'rsatkichi 95 dan past emas.

## Chegaralar

Production'ga deploy qilinmaydi. `[K]` belgili sahifalar bu topshiriqda
yaratilmaydi — faqat konfiguratsiyada `hidden` holda joy oladi. Qidiruv
oynasi va uning ishlashi topshiriq 10 ga tegishli, bu yerda faqat sarlavhadagi
o'rni ajratiladi.

## Tugatgandan keyin

- `CLAUDE.md` ga qoida qo'shilsin. Menyu havolalari faqat
  `src/config/navigation.ts` da yozilsin, komponent ichida qo'lda
  yozilmasin. Yangi sahifa avval daraxtda joy topsin, joy topilmasa menyuga
  chiqarilmasin.
- `docs/JOURNAL.md` yangilansin.
- Kommit: `feat(nav): two level mega menu with static navigation config`
- **Push qilmang.**
