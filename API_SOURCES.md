# مصادر واجهات برمجة التطبيقات

يستخدم الموقع واجهات عامة تُستدعى من المتصفح دون مفاتيح سرية:

- **القراء والتلاوات:** MP3Quran API — `https://mp3quran.net/api/v3/reciters`، وروابط الصوت من CDN الخاص بالمصدر.
- **إذاعات القرآن والإذاعات الإسلامية:** Islamic Radio API — ملف JSON المفتوح الذي يضم محطات متعددة وروابط البث المباشر: `https://raw.githubusercontent.com/uthumany/radio-api/main/client/public/api/stations.json`.
- **التفسير:** Quranpedia API — قائمة التفاسير لسورة الكهف ثم تفسير الآية 12 من الكتاب المختار: `https://api.quranpedia.net/v1/surah/tafsirs/18` و`/v1/ayah/18/12/book/{book}`.
- **الدروس والخطب:** Islamic Network Sermons API — أرشيف خطب هيئة الأوقاف الإماراتية بصيغة JSON: `https://sermons.islamic.network/api/uae-awqaf/2026.json`.
- **التقويم الهجري:** AlAdhan API — تحويل التاريخ الميلادي إلى هجري: `https://api.aladhan.com/v1/gToH?date=DD-MM-YYYY`.

يعتمد التطبيق على `localStorage` لتخزين مؤقت قصير وتقليل الضغط على المصادر، ولا ينسخ أو يعيد نشر قواعد البيانات. أُضيفت روابط المصدر داخل الواجهة احترامًا للجهات المالكة للمحتوى. إذا تعذر أحد المصادر، تبقى الواجهة الأساسية متاحة وتظهر رسالة إعادة المحاولة.
