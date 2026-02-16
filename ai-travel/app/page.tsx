"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [language, setLanguage] = useState<"id" | "en" | "jv">("id");
  const [messages, setMessages] = useState<{ role: "ai" | "user"; content: string }[]>([
    { role: "ai", content: "Halo! 👋\nMau liburan berapa hari dan budget berapa?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const translations = {
    id: {
      brandSub: "First-time traveler &\nSolo Backpacker",
      popularSpots: "Tempat Populer",
      estimatedBudget: "Estimasi Biaya",
      transport: "Transportasi",
      tickets: "Tiket Masuk",
      food: "Makan & Minum",
      prototype: "Prototipe v1.0",
      header: "Smart Travel Companion",
      inputPlaceholder: "Contoh: 2 hari di Jogja, budget 1 juta...",
      generate: "Generate",
      viewMap: "Lihat Peta",
      open24: "Buka 24 Jam",
      shops: "Toko",
      hours: "Jam Buka",
      transportQuery: "Berapa estimasi biaya sewa motor, mobil, dan ojek online di Jogja?",
      ticketQuery: "Berapa kisaran harga tiket masuk tempat wisata populer seperti Candi Prambanan, Ratu Boko, dan Pantai di Jogja?",
      foodQuery: "Berapa kisaran harga makanan di Jogja, mulai dari angkringan, warung makan, sampai cafe dan restoran?",
      aiGreeting: "Halo! 👋\nMau liburan berapa hari dan budget berapa?",
      aiError: "Maaf, saya tidak mengerti.",
      aiConnectionError: "Terjadi kesalahan koneksi. Silakan coba lagi.",
      aiProcessing: "Sedang merencanakan liburanmu...",
      listening: "Mendengarkan...",
    },
    en: {
      brandSub: "First-time traveler &\nSolo Backpacker",
      popularSpots: "Popular Spots",
      estimatedBudget: "Estimated Budget",
      transport: "Transport",
      tickets: "Entrance Tickets",
      food: "Food & Drink",
      prototype: "Prototype v1.0",
      header: "Smart Travel Companion",
      inputPlaceholder: "Example: 2 days in Jogja, budget 1 million...",
      generate: "Generate",
      viewMap: "View Map",
      open24: "Open 24 Hours",
      shops: "Shops",
      hours: "Hours",
      transportQuery: "What is the estimated cost for renting a motorbike, car, and online taxi in Jogja?",
      ticketQuery: "What is the price range for popular tourist attraction tickets like Prambanan Temple, Ratu Boko, and beaches in Jogja?",
      foodQuery: "What is the price range for food in Jogja, from street food (angkringan) to cafes and restaurants?",
      aiGreeting: "Hello! 👋\nHow many days are you planning to stay and what is your budget?",
      aiError: "Sorry, I didn't understand that.",
      aiConnectionError: "Connection error occurred. Please try again.",
      aiProcessing: "Planning your holiday...",
      listening: "Listening...",
    },
    jv: {
      brandSub: "Pelancong Pemula &\nSolo Backpacker",
      popularSpots: "Panggonan Populer",
      estimatedBudget: "Kiro-kiro Biaya",
      transport: "Transportasi",
      tickets: "Tiket Mlebu",
      food: "Mangan & Ngombe",
      prototype: "Prototipe v1.0",
      header: "Kanca Lelungan Pinter",
      inputPlaceholder: "Contoh: 2 dina ning Jogja, sangu 1 juta...",
      generate: "Gawe",
      viewMap: "Delok Peta",
      open24: "Buka 24 Jam",
      shops: "Toko",
      hours: "Jam Buka",
      transportQuery: "Piro kira-kira biaya sewa motor, mobil, lan ojek online ning Jogja?",
      ticketQuery: "Piro rego tiket mlebu wisata populer kudo Candi Prambanan, Ratu Boko, lan Pantai ning Jogja?",
      foodQuery: "Piro kisaran rego panganan ning Jogja, mulai seko angkringan, warung makan, tekan cafe lan restoran?",
      aiGreeting: "Halo! 👋\nArep liburan pirang dina lan sangune pira?",
      aiError: "Ngapunten, kulo mboten ngertos.",
      aiConnectionError: "Wonten masalah koneksi. Cobi malih.",
      aiProcessing: "Sekedap, tak gaweke rencana...",
      listening: "Ngrungokke...",
    },
  };

  const t = translations[language];

  // Update initial message when language changes (optional, but good for UX if user hasn't chatted yet)
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'ai') {
      setMessages([{ role: "ai", content: t.aiGreeting }]);
    }
  }, [language]);


  const popularSpots = [
    {
      name: "Jalan Malioboro",
      icon: "fa-store",
      url: "https://maps.app.goo.gl/rqc2ZU4ktaXjVRTb7",
      hours: {
        id: "Buka 24 Jam (Toko: 09.00 - 21.00)",
        en: "Open 24 Hours (Shops: 09:00 - 21:00)",
        jv: "Buka 24 Jam (Toko: 09.00 - 21.00)",
      },
    },
    {
      name: "Candi Prambanan",
      icon: "fa-gopuram",
      url: "https://www.google.com/maps/search/?api=1&query=Candi+Prambanan",
      hours: {
        id: "06.30 - 17.00 WIB",
        en: "06:30 AM - 05:00 PM",
        jv: "06.30 - 17.00 WIB",
      },
    },
    {
      name: "Pantai Parangtritis",
      icon: "fa-water",
      url: "https://www.google.com/maps/search/?api=1&query=Pantai+Parangtritis",
      hours: {
        id: "Buka 24 Jam",
        en: "Open 24 Hours",
        jv: "Buka 24 Jam",
      },
    },
  ];

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const openMap = () => {
    window.open("https://maps.google.com/?q=Yogyakarta", "_blank");
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, language }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: t.aiError }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: t.aiConnectionError },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAsk = (question: string) => {
    const userMessage = question;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, language }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.reply) {
          setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
        } else {
          setMessages((prev) => [...prev, { role: "ai", content: t.aiError }]);
        }
      })
      .catch((error) => {
        console.error(error);
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: t.aiConnectionError },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser anda tidak mendukung fitur Voice Note. Silakan gunakan Chrome atau Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;

    // Set language based on selected language
    // Fallback for Javanese to Indonesian if browser doesn't strictly support 'jv' (though 'jv-ID' exists in some)
    if (language === 'id') recognition.lang = 'id-ID';
    else if (language === 'en') recognition.lang = 'en-US';
    else if (language === 'jv') recognition.lang = 'jv-ID'; // Attempt Javanese

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="app-container">
      {/* Mobile Header (ChatGPT Style) */}
      <header className="mobile-header glass">
        <button
          className="icon-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle Menu"
        >
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
        <span className="mobile-title">Jogja Traveler AI</span>
      </header>

      {/* Legacy Mobile Menu Button (Removed) */}

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar glass ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="brand-container">
          <div className="brand">Jogja Traveler AI</div>
          <div className="brand-sub">
            {t.brandSub.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex gap-2 justify-center my-4">
          <button
            onClick={() => setLanguage('id')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${language === 'id' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            style={{ backgroundColor: language === 'id' ? 'rgba(56, 189, 248, 0.8)' : 'rgba(255, 255, 255, 0.2)', color: language === 'id' ? 'white' : 'rgba(255, 255, 255, 0.7)' }}
          >
            ID
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            style={{ backgroundColor: language === 'en' ? 'rgba(56, 189, 248, 0.8)' : 'rgba(255, 255, 255, 0.2)', color: language === 'en' ? 'white' : 'rgba(255, 255, 255, 0.7)' }}

          >
            EN
          </button>
          <button
            onClick={() => setLanguage('jv')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${language === 'jv' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            style={{ backgroundColor: language === 'jv' ? 'rgba(56, 189, 248, 0.8)' : 'rgba(255, 255, 255, 0.2)', color: language === 'jv' ? 'white' : 'rgba(255, 255, 255, 0.7)' }}
          >
            JV
          </button>
        </div>

        <div className="sections-container flex-col gap-4">
          <div>
            <div className="section-title">{t.popularSpots}</div>
            <div className="flex-col gap-2">
              {popularSpots.map((spot, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <a
                    href={spot.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="list-item"
                  >
                    <i className={`fa-solid ${spot.icon}`}></i> <span>{spot.name}</span>
                  </a>
                  {/* Opening Hours Display */}
                  <div className="text-[10px] text-gray-300 pl-8 opacity-80" style={{ fontSize: '0.75rem', paddingLeft: '2rem', color: 'rgba(255,255,255,0.7)' }}>
                    <i className="fa-regular fa-clock mr-1" style={{ fontSize: '0.7rem' }}></i> {spot.hours[language]}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="section-title">{t.estimatedBudget}</div>
            <div className="flex-col gap-2">
              <div
                className="list-item"
                onClick={() => handleQuickAsk(t.transportQuery)}
              >
                <i className="fa-solid fa-bus-simple"></i> <span>{t.transport}</span>
              </div>
              <div
                className="list-item"
                onClick={() => handleQuickAsk(t.ticketQuery)}
              >
                <i className="fa-solid fa-ticket"></i> <span>{t.tickets}</span>
              </div>
              <div
                className="list-item"
                onClick={() => handleQuickAsk(t.foodQuery)}
              >
                <i className="fa-solid fa-bowl-food"></i> <span>{t.food}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        <div className="badge">
          <i className="fa-solid fa-rocket" style={{ marginRight: "4px" }}></i> {t.prototype}
        </div>

        <div className="header">
          <h1>{t.header}</h1>
        </div>

        <div className="chat-container glass" id="chat" ref={chatContainerRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`msg ${msg.role}`}>
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }} />
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          ))}
          {isLoading && (
            <div className="msg ai" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <span>{t.aiProcessing}</span>
            </div>
          )}
        </div>

        <div className="input-area glass">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="input-field"
            placeholder={isRecording ? t.listening : t.inputPlaceholder}
            autoComplete="off"
            suppressHydrationWarning
          />
          <button
            className={`btn ${isRecording ? 'btn-recording' : 'btn-secondary'}`}
            onClick={toggleRecording}
            title="Voice Note"
          >
            <i className={`fa-solid ${isRecording ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
          </button>
          <button className="btn btn-primary" onClick={handleSendMessage}>
            <i className="fa-solid fa-paper-plane"></i> <span>{t.generate}</span>
          </button>
          <button className="btn btn-secondary" onClick={openMap}>
            <i className="fa-regular fa-map"></i> <span>{t.viewMap}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
