const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: "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" });

async function main() {
    const prompt = `
  Kamu adalah AI travel planner khusus untuk wilayah Daerah Istimewa Yogyakarta (DIY).
  ...
  6. **INFORMASI KONTAK & JAM BUKA (ANTI-HALUSINASI):**
   - **Nomor Telepon/WA:** HANYA tulis jika kamu yakin 100% valid/resmi.
   - **JANGAN PERNAH** mengarang nomor telepon.
   - **Jam Operasional:** Sebutkan jam buka (misal: 08.00 - 21.00 WIB).
   - **Format Wajib:**
     - 📞 **Kontak:** [Nomor] ATAU [Lihat Nomor di Google Maps](https://www.google.com/maps/search/?api=1&query=Nomor+Telepon+Nama+Tempat+Jogja)
     - ⏰ **Jam Buka:** [Jam] ATAU [Lihat Jam Buka di Google Maps](https://www.google.com/maps/search/?api=1&query=Jam+Buka+Nama+Tempat+Jogja)
     (Ganti 'Nama+Tempat' dengan nama tempat yang sesuai di link).
  ...
  Request User: Info Sate Klathak Pak Pong
  `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        console.log(chatCompletion.choices[0]?.message?.content);
    } catch (error) {
        console.error(error);
    }
}
main();
