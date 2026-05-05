import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Koordinat untuk 5 wilayah di DIY
    const locations = [
      { name: "Kota Yogyakarta", lat: -7.7956, lon: 110.3695 },
      { name: "Sleman", lat: -7.7156, lon: 110.3556 },
      { name: "Bantul", lat: -7.8856, lon: 110.3278 },
      { name: "Gunungkidul", lat: -7.9656, lon: 110.5956 },
      { name: "Kulon Progo", lat: -7.8256, lon: 110.1556 },
    ];

    const lats = locations.map(l => l.lat).join(",");
    const lons = locations.map(l => l.lon).join(",");

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current_weather=true&timezone=Asia%2FBangkok`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Gagal mengambil data cuaca");

    const data = await response.json();

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
      const item = Array.isArray(data) ? data[index] : data[index]; // For multiple locations, it's an array
      const cw = item.current_weather;
      
      return `${loc.name}: ${cw.temperature}°C (${weatherMap[cw.weathercode] || "Berawan"})`;
    });

    return NextResponse.json({
      summary: weatherResults.join(", "),
      raw: data
    });
  } catch (error) {
    console.error("Weather API Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data cuaca" }, { status: 500 });
  }
}
