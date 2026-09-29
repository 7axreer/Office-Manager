# Office Manager

Ofis xarajatlarini nazorat qilish va tozalik/navbatchilikni avtomatlashtirish uchun dashboard + Telegram bot.

- **Xarajatlar** — bir martalik va takroriy (har hafta / oy / 3 oy / yil / ixtiyoriy davr). «To‘landi» bosilganda keyingi to‘lov avtomatik yaratiladi.
- **Navbatchilik** — kunlik, haftalik yoki «har N kunda» jadval; adolatli navbat; ta’tildagi xodim navbatini yo‘qotmaydi.
- **Telegram** — eslatmalar haqiqiy mention bilan (`@username` yoki ID orqali), xabardagi «✅ To‘landi» / «✅ Bajarildi» tugmalari dashboard’ni yangilaydi.
- **Dashboard** — oylik xarajat, kechikkan va yaqin to‘lovlar, bugungi mas’ul, yaqin navbatlar, faoliyat tarixi, 6 oylik grafik.
- Dark / Light rejim, telefon uchun moslashgan.

Tashqi kutubxona yo‘q — faqat Node.js 18+ kerak. Ma’lumotlar bitta `data/db.json` faylida saqlanadi.

---

## 1. Ishga tushirish

```bash
node server/server.js          # yoki: npm start
```

Brauzerda `http://localhost:3000` ni oching. Birinchi kirishda ofis nomi va administrator paroli so‘raladi.

### Docker bilan

```bash
docker compose up -d
```

`./data` papkasi ma’lumotlarni saqlaydi — zaxira uchun shu papkani nusxalash kifoya.

### Sozlamalar (muhit o‘zgaruvchilari)

| O‘zgaruvchi | Standart | Izoh |
|---|---|---|
| `PORT` | `3000` | Server porti |
| `DATA_DIR` | `./data` | `db.json` joylashuvi |
| `ADMIN_PASSWORD` | — | Parolni majburan o‘rnatish (unutilganda tiklash uchun ham) |
| `COOKIE_SECURE` | — | `1` — HTTPS orqasida ishlaganda |
| `TELEGRAM_API_URL` | `https://api.telegram.org` | O‘z Bot API serveringiz bo‘lsa |

> Server doimiy ishlashi kerak (VPS, ofis kompyuteri, Raspberry Pi). Eslatmalar har 30 soniyada tekshiriladi. Doimiy ishlatish uchun `pm2`, `systemd` yoki Docker tavsiya etiladi.

---

## 2. Telegram botni ulash

1. Telegram’da **@BotFather** → `/newbot` → bot nomi va username → tokenni nusxalang.
2. Dashboard → **Telegram** → tokenni qo‘ying → **Ulash**.
3. Botni ofis guruhiga qo‘shing va guruhda `/start` yozing. Guruh dashboard’da avtomatik paydo bo‘ladi.
4. «Xabarlar qayerga boradi» bo‘limida xarajat va navbatchilik guruhlarini tanlang → **Test xabar**.

Bir nechta bot va guruh ulash mumkin (masalan, «Moliya» va «Umumiy» guruhlar). Har bir navbatchilik vazifasi uchun alohida guruh tanlash ham mumkin.

**Bot buyruqlari:** `/navbat` — 7 kunlik jadval, `/tolovlar` — yaqin to‘lovlar, `/id` — chat ID. Ma’lumot faqat platformaga ulangan guruhlarda ko‘rsatiladi.

### Mention qanday ishlaydi

- Xodimga **username** kiritilgan bo‘lsa — `@username` bilan belgilanadi (har doim bildirishnoma boradi).
- Username bo‘lmasa — Telegram ID orqali ism bilan belgilanadi.
- Xodim guruhda biror xabar yozsa yoki botga `/start` yuborsa, tizim uning ID’sini avtomatik saqlaydi («Jamoa» sahifasida «Bog‘langan» belgisi).

---

## 3. Eslatmalar qachon yuboriladi

| Hodisa | Vaqt |
|---|---|
| To‘lovga 7 / 3 / 1 kun qoldi, to‘lov kuni | Sozlamalardagi «To‘lov eslatmalari vaqti» (standart 10:00) |
| Kechikkan to‘lov | To‘lanmaguncha har kuni shu vaqtda (o‘chirish mumkin) |
| Bugungi navbatchilik | Vazifadagi «Eslatma vaqti» |
| Ertangi navbatchilik | «Ertangi navbat haqida» vaqti (standart 18:00) |

Har bir eslatma faqat bir marta yuboriladi. Server o‘chiq bo‘lgan kunlar uchun eski eslatmalar yig‘ilib qolmaydi.

## 4. Navbat qanday taqsimlanadi

- Ro‘yxat boshidagi xodim — keyingi navbatchi. Navbatni bajargach, ro‘yxat oxiriga o‘tadi.
- Ta’tildagi xodim o‘tkazib yuboriladi, lekin joyini saqlaydi — qaytgach birinchi bo‘lib navbatga chiqadi.
- «Keyingi xodimga o‘tkazish» yoki qo‘lda almashtirishda chiqarilgan xodim ham navbatini yo‘qotmaydi.
- «Har hafta» rejimida bitta xodim butun hafta mas’ul bo‘ladi.
- Jadvaldagi katakchani bosib, istalgan kunga boshqa xodimni tayinlash mumkin.

---

## Tuzilma

```
server/server.js     HTTP server, API, parol, rejalashtiruvchi
server/telegram.js   Bot API: long polling, xabar, tugmalar, buyruqlar
server/store.js      JSON saqlash (atomik yozish + .bak zaxira)
shared/core.js       Umumiy mantiq: sanalar, takrorlanish, navbat, statistika, xabarlar
public/              Interfeys (vanilla JS, build talab qilmaydi)
demo/demo-api.js     Brauzer ichidagi demo API
scripts/build-demo.js  Bir faylli demo: dist/demo.html
```

Zaxira: **Sozlamalar → Ma’lumotlar → JSON yuklab olish**. Faylda bot tokenlari ham bor — uni xavfsiz joyda saqlang.
