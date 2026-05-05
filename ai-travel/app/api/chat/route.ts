import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;
    const language = body.language || "id"; // Default to Indonesian

    let languageInstruction = "";
    let labels = {
      contact: "Kontak",
      hours: "Jam Buka",
      seeContact: "Lihat Kontak di Google Maps",
      seeHours: "Lihat Jam Buka di Google Maps"
    };

    if (language === "en") {
      languageInstruction = "Gunakan bahasa Inggris (English) yang santai namun sopan.";
      labels = {
        contact: "Contact",
        hours: "Opening Hours",
        seeContact: "See Contact on Google Maps",
        seeHours: "See Opening Hours on Google Maps"
      };
    } else if (language === "jv") {
      languageInstruction = "Gunakan bahasa Jawa (Ngoko Alus / Krama Inggil yang sopan dan akrab).";
      labels = {
        contact: "Kontak",
        hours: "Jam Buka",
        seeContact: "Delok Kontak ning Google Maps",
        seeHours: "Delok Jam Buka ning Google Maps"
      };
    } else {
      languageInstruction = "Gunakan bahasa Indonesia yang santai tapi sopan.";
    }

    const prompt = `
Kamu adalah AI travel planner khusus untuk wilayah Daerah Istimewa Yogyakarta (DIY).
Tugasmu adalah membuat itinerary lengkap + estimasi biaya transportasi untuk wisata di Jogja.

ATURAN PENTING:
1. HANYA jawab pertanyaan seputar wisata, kuliner, dan budaya di Provinsi DIY (Yogyakarta, Sleman, Bantul, Gunungkidul, Kulon Progo).
2. Jika user bertanya tentang tempat di luar DIY (misal: Bali, Bandung, Jakarta, luar negeri), tolak dengan sopan dengan kalimat "Maaf, saya hanya bisa membantu merencanakan liburan di Jogja. 🙏" (Sesuaikan dengan bahasa yang dipilih).
3. **WAJIB MENYERTAKAN LINK GOOGLE MAPS** untuk setiap tempat wisata atau kuliner yang kamu sebutkan.
   Format link: [Nama Tempat](https://www.google.com/maps/search/?api=1&query=Nama+Tempat+Jogja)
      Contoh: "Kamu bisa mengunjungi [Candi Prambanan](https://www.google.com/maps/search/?api=1&query=Candi+Prambanan+Jogja)."
4. Berikan jawaban yang ramah, gaul, dan informatif.
5. ${languageInstruction}
6. **INFORMASI KONTAK & JAM BUKA:**
   - **Nomor Telepon/WA:** JANGAN TAMPILKAN nomor telepon secara langsung. Ganti dengan link Google Maps.
   - **Jam Operasional:** SEBUTKAN jam buka yang spesifik (misal: "Buka setiap hari pukul 08.00 - 17.00 WIB" atau "Open daily 8 AM - 5 PM"). Hindari menyuruh user mengecek sendiri kecuali informasi tersebut sangat dinamis atau tidak diketahui.
   - **Format Wajib (Gunakan Label Bahasa ${language === 'en' ? 'Inggris' : (language === 'jv' ? 'Jawa' : 'Indonesia')}):**
     - 📞 **${labels.contact}:** [${labels.seeContact}](https://www.google.com/maps/search/?api=1&query=Nomor+Telepon+Nama+Tempat+Jogja)
     - ⏰ **${labels.hours}:** [Jam Buka]
     (Ganti 'Nama+Tempat' dengan nama tempat yang sesuai di link, dan [Jam Buka] dengan data nyata sesuai bahasa).

7. **Review & Koreksi:**
   - Pastikan setiap tempat wisata memiliki link Google Maps pada namanya.
   - Pastikan rekomendasi biaya masuk akal.


      Request User:
        ${message}
`;

    // --- DEEPSEEK SWITCH ---
    // If DEEPSEEK_API_KEY exists, use DeepSeek. Otherwise fallback to Groq.
    const deepseekKey = process.env.DEEPSEEK_API_KEY;

    let text = "";

    if (deepseekKey) {
      console.log("Using DeepSeek API...");
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a helpful travel assistant for Yogyakarta." },
            // Note: DeepSeek might behave better if instructions are in user prompt or system.
            // Putting the main prompt in user message as before for consistency.
            { role: "user", content: prompt }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      text = data.choices[0]?.message?.content || "Maaf, DeepSeek tidak memberikan respon.";

    } else {
      console.log("Using Groq API...");
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
      });

      text = chatCompletion.choices[0]?.message?.content || "Maaf, ada masalah saat menghubungi AI.";
    }

    return Response.json({ reply: text });
  } catch (error) {
    console.error("AI API ERROR:", error);
    return Response.json({ reply: "Maaf, AI sedang sibuk atau ada error pada server." }, { status: 500 });
  }
}
