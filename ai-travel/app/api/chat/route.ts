import Groq from "groq-sdk";
import OpenAI from "openai";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;
    const language = body.language || "id"; // Default to Indonesian

    // 1. Fetch data cuaca real-time langsung di backend
    let weatherData = "";
    try {
      const locations = [
        { name: "Kota Yogyakarta", lat: -7.7956, lon: 110.3695 },
        { name: "Sleman", lat: -7.7156, lon: 110.3556 },
        { name: "Bantul", lat: -7.8856, lon: 110.3278 },
        { name: "Gunungkidul", lat: -7.9656, lon: 110.5956 },
        { name: "Kulon Progo", lat: -7.8256, lon: 110.1556 },
      ];

      const lats = locations.map((l) => l.lat).join(",");
      const lons = locations.map((l) => l.lon).join(",");
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current_weather=true&timezone=Asia%2FBangkok`;

      const weatherRes = await fetch(url);
      if (weatherRes.ok) {
        const data = await weatherRes.json();
        const weatherMap: { [key: number]: string } = {
          0: "Cerah",
          1: "Cerah Berawan",
          2: "Berawan",
          3: "Mendung",
          45: "Kabut",
          48: "Kabut Rime",
          51: "Gerimis Ringan",
          53: "Gerimis Sedang",
          55: "Gerimis Lebat",
          61: "Hujan Ringan",
          63: "Hujan Sedang",
          65: "Hujan Lebat",
          80: "Hujan Shower Ringan",
          81: "Hujan Shower Sedang",
          82: "Hujan Shower Lebat",
          95: "Badai Guntur",
        };

        const weatherResults = locations.map((loc, index) => {
          const item = Array.isArray(data) ? data[index] : data;
          const cw = item.current_weather;
          return `${loc.name}: ${cw.temperature}°C (${weatherMap[cw.weathercode] || "Berawan"})`;
        });
        weatherData = weatherResults.join(", ");
      }
    } catch (e) {
      console.error("Failed to fetch weather on chat API:", e);
    }

    let languageInstruction = "";
    let labels = {
      contact: "Kontak",
      hours: "Jam Buka",
      seeContact: "Lihat Kontak di Google Maps",
      seeHours: "Lihat Jam Buka di Google Maps",
    };

    if (language === "en") {
      languageInstruction = "Gunakan bahasa Inggris (English) yang santai namun sopan.";
      labels = {
        contact: "Contact",
        hours: "Opening Hours",
        seeContact: "See Contact on Google Maps",
        seeHours: "See Opening Hours on Google Maps",
      };
    } else if (language === "jv") {
      languageInstruction = "Gunakan bahasa Jawa (Ngoko Alus / Krama Inggil yang sopan dan akrab).";
      labels = {
        contact: "Kontak",
        hours: "Jam Buka",
        seeContact: "Delok Kontak ning Google Maps",
        seeHours: "Delok Jam Buka ning Google Maps",
      };
    } else {
      languageInstruction = "Gunakan bahasa Indonesia yang santai tapi sopan.";
    }

    const weatherInfo = weatherData ? `\nDATA CUACA REAL-TIME SAAT INI:\n${weatherData}\n` : "";

    const prompt = `
Kamu adalah AI travel planner khusus untuk wilayah Daerah Istimewa Yogyakarta (DIY).
Tugasmu adalah membuat itinerary lengkap + estimasi biaya transportasi untuk wisata di Jogja.
${weatherInfo}

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
     (Ganti 'Nama+Tempat' dengan nama tempat yang sesuai di link, and [Jam Buka] dengan data nyata sesuai bahasa).

7. **CUACA REAL-TIME:**
   - **WAJIB** sertakan info cuaca real-time (suhu dan kondisi) untuk setiap tempat wisata atau kuliner yang kamu rekomendasikan berdasarkan data cuaca yang diberikan di atas.
   - Contoh: "Candi Prambanan (Cuaca saat ini: 28°C, Cerah)"

8. **Review & Koreksi:**
   - Pastikan setiap tempat wisata memiliki link Google Maps pada namanya.
   - Pastikan rekomendasi biaya masuk akal.


      Request User:
        ${message}
`;

    let text = "";
    let success = false;

    // --- PRIORITAS 1: GOOGLE GEMINI API ---
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && !success) {
      try {
        console.log("Attempting Google Gemini API...");
        const openai = new OpenAI({
          apiKey: geminiKey,
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        });

        const chatCompletion = await openai.chat.completions.create({
          model: "gemini-2.0-flash",
          messages: [
            { role: "system", content: "You are a helpful travel assistant for Yogyakarta." },
            { role: "user", content: prompt },
          ],
        });

        if (chatCompletion.choices[0]?.message?.content) {
          text = chatCompletion.choices[0].message.content;
          success = true;
        }
      } catch (err: any) {
        console.warn("Gemini API failed or limit reached (429/404):", err.message || err);
        // Will seamlessly fallback to next provider
      }
    }

    // --- PRIORITAS 2: DEEPSEEK API ---
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    if (deepseekKey && !success) {
      try {
        console.log("Attempting DeepSeek API...");
        const response = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${deepseekKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: "You are a helpful travel assistant for Yogyakarta." },
              { role: "user", content: prompt },
            ],
            stream: false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices[0]?.message?.content) {
            text = data.choices[0].message.content;
            success = true;
          }
        } else {
          console.warn("DeepSeek API failed with status:", response.status);
        }
      } catch (err: any) {
        console.warn("DeepSeek API failed:", err.message || err);
      }
    }

    // --- PRIORITAS 3: GROQ API (FALLBACK TERAKHIR) ---
    if (!success) {
      try {
        console.log("Attempting Groq API (Fallback)...");
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          model: "llama-3.3-70b-versatile",
        });

        if (chatCompletion.choices[0]?.message?.content) {
          text = chatCompletion.choices[0].message.content;
          success = true;
        }
      } catch (err: any) {
        console.error("Groq API failed:", err.message || err);
      }
    }

    if (!success) {
      return Response.json({ reply: "Maaf, semua server AI sedang sibuk atau limit tercapai. Coba lagi nanti." }, { status: 500 });
    }

    return Response.json({ reply: text });
  } catch (error) {
    console.error("AI API ERROR:", error);
    return Response.json({ reply: "Maaf, AI sedang sibuk atau ada error pada server." }, { status: 500 });
  }
}
