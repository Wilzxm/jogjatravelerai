const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: "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" });

async function main() {
    const prompt = `
  Kamu adalah AI travel planner khusus untuk wilayah Daerah Istimewa Yogyakarta (DIY).
  ATURAN PENTING:
  ...
  6. **FITUR BARU:** JIKA ADA DATANYA, sebutkan Nama Pemilik/Admin dan Nomor Kontak/WA untuk reservasi. Jika tidak tahu, sarankan user untuk mencari kontak resminya di Google Maps.
  ...
  Request User: Rekomendasi tempat makan gudeg enak di Jogja
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
