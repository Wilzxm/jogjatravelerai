"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useSession, signOut, signIn } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Window {
  puter: any;
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

export default function Home() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState<"id" | "en" | "jv">("id");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Local state for optimistic updates and guest mode
  const [localMessages, setLocalMessages] = useState<{ role: "ai" | "user"; content: string }[]>([
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
      login: "Masuk Akun",
      logout: "Keluar",
      history: "Riwayat Chat",
      newChat: "Chat Baru",
      startChat: "Mulai Chat Baru"
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
      login: "Login",
      logout: "Logout",
      history: "Chat History",
      newChat: "New Chat",
      startChat: "Start New Chat"
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
      login: "Mlebu",
      logout: "Metu",
      history: "Riwayat Chat",
      newChat: "Chat Anyar",
      startChat: "Mulai Chat Anyar"
    },
  };

  const t = translations[language];

  // Fetch Chat History
  const { data: chats, refetch: refetchChats } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const res = await fetch('/api/chats');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!session,
  });

  // Fetch Messages for Selected Chat
  const { data: chatData, refetch: refetchMessages } = useQuery({
    queryKey: ['chat', selectedChatId],
    queryFn: async () => {
      if (!selectedChatId) return null;
      const res = await fetch(`/api/chats/${selectedChatId}`);
      if (!res.ok) throw new Error("Failed to load chat");
      return res.json();
    },
    enabled: !!selectedChatId,
  });

  // Create New Chat Mutation
  const createChatMutation = useMutation({
    mutationFn: async (title?: string) => {
      const res = await fetch('/api/chats', { method: 'POST', body: JSON.stringify({ title }) });
      return res.json();
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setSelectedChatId(newChat.id);
      setLocalMessages([{ role: "ai", content: t.aiGreeting }]); // Reset UI for new chat
    },
  });

  // Save Message Mutation
  const saveMessageMutation = useMutation({
    mutationFn: async ({ chatId, role, content }: { chatId: string, role: string, content: string }) => {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, role, content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] }); // Update last active
    }
  });

  // Sync remote messages to local state
  useEffect(() => {
    if (chatData?.messages) {
      setLocalMessages(chatData.messages.map((m: any) => ({ role: m.role, content: m.content })));
    } else if (selectedChatId === null && !isLoading) {
      // Only reset if we explicitly switched to "New Chat" (null ID) and aren't waiting for a create
      // If we just loaded the page as guest, we keep the default greeting
      if (session && messages.length > 1) {
        setLocalMessages([{ role: "ai", content: t.aiGreeting }]);
      }
    }
  }, [chatData, selectedChatId]);

  // Ensure we have a chat ID when user starts typing (if logged in)
  const ensureChatExists = async () => {
    if (!session) return null;
    if (selectedChatId) return selectedChatId;

    const newChat = await createChatMutation.mutateAsync();
    return newChat.id;
  };

  const handleNewChat = () => {
    setSelectedChatId(null);
    setLocalMessages([{ role: "ai", content: t.aiGreeting }]);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const createTravelPrompt = (message: string, language: string) => {
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

    return `
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
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    // Optimistic update
    setLocalMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    // Ensure chat ID exists if logged in
    let currentChatId = selectedChatId;
    if (session && !currentChatId) {
      try {
        currentChatId = await ensureChatExists();
      } catch (e) {
        console.error("Failed to create chat", e);
      }
    }

    // Save User Message to DB
    if (session && currentChatId) {
      saveMessageMutation.mutate({ chatId: currentChatId, role: 'user', content: userMessage });
    }

    try {
      // 1. Try Puter.js (Client-side Opus 4.6)
      if ((window as any).puter) {
        console.log("Attempting to use Puter.js (Opus 4.6)...");
        const prompt = createTravelPrompt(userMessage, language);
        const response = await (window as any).puter.ai.chat(prompt, { model: 'claude-opus-4-6' });

        if (response?.message?.content?.[0]?.text) {
          const aiReply = response.message.content[0].text;
          setLocalMessages((prev) => [...prev, { role: "ai", content: aiReply }]);

          if (session && currentChatId) {
            saveMessageMutation.mutate({ chatId: currentChatId, role: 'ai', content: aiReply });
          }
          return; // Success! Exit function.
        }
      } else {
        console.warn("Puter.js not found on window object.");
      }

      throw new Error("Puter fallback"); // Trigger fallback if Puter fails or returns invalid data
    } catch (puterError) {
      console.warn("Puter.js failed, falling back to Server/Groq:", puterError);

      // 2. Fallback to Server API (Groq)
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage, language }),
        });

        const data = await response.json();

        if (data.reply) {
          setLocalMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
          if (session && currentChatId) {
            saveMessageMutation.mutate({ chatId: currentChatId, role: 'ai', content: data.reply });
          }
        } else {
          setLocalMessages((prev) => [...prev, { role: "ai", content: t.aiError }]);
        }
      } catch (error) {
        console.error("Server API Error:", error);
        setLocalMessages((prev) => [
          ...prev,
          { role: "ai", content: t.aiConnectionError },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAsk = async (question: string) => {
    // Use logic similar to handleSendMessage but simply calling it is hard due to input state
    // So we replicate logic or refactor. Replicating for speed as logic is slightly different (no input clear)

    const userMessage = question;
    setLocalMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Ensure chat ID exists if logged in
    let currentChatId = selectedChatId;
    if (session && !currentChatId) {
      try {
        currentChatId = await ensureChatExists();
      } catch (e) { console.error(e); }
    }

    if (session && currentChatId) {
      saveMessageMutation.mutate({ chatId: currentChatId, role: 'user', content: userMessage });
    }

    try {
      if ((window as any).puter) {
        const prompt = createTravelPrompt(userMessage, language);
        const response = await (window as any).puter.ai.chat(prompt, { model: 'claude-opus-4-6' });
        if (response?.message?.content?.[0]?.text) {
          const aiReply = response.message.content[0].text;
          setLocalMessages((prev) => [...prev, { role: "ai", content: aiReply }]);
          if (session && currentChatId) saveMessageMutation.mutate({ chatId: currentChatId, role: 'ai', content: aiReply });
          return;
        }
      }
      throw new Error("Puter fallback");
    } catch (e) {
      // Fallback to Groq
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage, language }),
        });
        const data = await response.json();
        if (data.reply) {
          setLocalMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
          if (session && currentChatId) saveMessageMutation.mutate({ chatId: currentChatId, role: 'ai', content: data.reply });
        } else {
          setLocalMessages((prev) => [...prev, { role: "ai", content: t.aiError }]);
        }
      } catch (err) {
        setLocalMessages((prev) => [...prev, { role: "ai", content: t.aiConnectionError }]);
      }
    } finally {
      setIsLoading(false);
    }
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

    if (language === 'id') recognition.lang = 'id-ID';
    else if (language === 'en') recognition.lang = 'en-US';
    else if (language === 'jv') recognition.lang = 'jv-ID';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => setInput(event.results[0][0].transcript);
    recognition.onerror = (event: any) => { console.error(event.error); setIsRecording(false); };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const openMap = () => {
    window.open("https://maps.google.com/?q=Yogyakarta", "_blank");
  };

  const popularSpots = [
    {
      name: "Jalan Malioboro",
      icon: "fa-store",
      url: "https://maps.app.goo.gl/rqc2ZU4ktaXjVRTb7",
      hours: { id: "Buka 24 Jam", en: "Open 24 Hours", jv: "Buka 24 Jam" },
    },
    {
      name: "Candi Prambanan",
      icon: "fa-gopuram",
      url: "https://www.google.com/maps/search/?api=1&query=Candi+Prambanan",
      hours: { id: "06.30 - 17.00 WIB", en: "06:30 AM - 05:00 PM", jv: "06.30 - 17.00 WIB" },
    },
    {
      name: "Pantai Parangtritis",
      icon: "fa-water",
      url: "https://www.google.com/maps/search/?api=1&query=Pantai+Parangtritis",
      hours: { id: "Buka 24 Jam", en: "Open 24 Hours", jv: "Buka 24 Jam" },
    },
  ];

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, isLoading]);


  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header className="mobile-header glass">
        <button className="icon-btn" onClick={toggleMobileMenu} aria-label="Toggle Menu">
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
        <span className="mobile-title">Smart Travel Companion</span>
        <div className="mobile-badge">
          <i className="fa-solid fa-rocket"></i> <span>v1.0</span>
        </div>
      </header>

      {/* Overlay */}
      {isMobileMenuOpen && (<div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />)}

      {/* Sidebar */}
      <aside className={`sidebar glass ${isMobileMenuOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="brand-container">
          <div className="brand">Jogja Traveler AI</div>
          <div className="brand-sub">
            {t.brandSub.split('\n').map((line, i) => (<span key={i}>{line}<br /></span>))}
          </div>
        </div>

        {/* Auth Section */}
        <div className="p-4 border-b border-gray-700/50">
          {session ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <i className="fa-solid fa-user-circle"></i>
                <span className="truncate">{session.user?.name || session.user?.email}</span>
              </div>
              <button onClick={() => signOut()} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                <i className="fa-solid fa-sign-out-alt"></i> {t.logout}
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="w-full py-2 bg-blue-600/80 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
            >
              <i className="fa-solid fa-sign-in-alt mr-2"></i> {t.login}
            </button>
          )}
        </div>

        {/* Chat History Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          {session && (
            <>
              <div className="section-title mt-2">{t.history}</div>
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 py-2 px-3 mb-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-left"
              >
                <i className="fa-solid fa-plus text-green-400"></i> {t.newChat}
              </button>

              <div className="flex flex-col gap-1">
                {chats?.map((chat: any) => (
                  <button
                    key={chat.id}
                    onClick={() => { setSelectedChatId(chat.id); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs truncate transition-colors ${selectedChatId === chat.id ? 'bg-white/20' : 'hover:bg-white/5'}`}
                  >
                    <i className="fa-regular fa-message mr-2 opacity-70"></i>
                    {chat.title}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Standard Sidebar Content */}
          <div className="mt-6">
            <div className="section-title">{t.popularSpots}</div>
            <div className="flex-col gap-2">
              {popularSpots.map((spot, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <a href={spot.url} target="_blank" rel="noopener noreferrer" className="list-item">
                    <i className={`fa-solid ${spot.icon}`}></i> <span>{spot.name}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Language Switcher (Bottom) */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="lang-switcher glass w-full">
            {['id', 'en', 'jv'].map((lang) => (
              <button key={lang} onClick={() => setLanguage(lang as any)} className={`lang-btn ${language === lang ? 'active' : ''}`}>
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="badge"><i className="fa-solid fa-rocket mr-1"></i> {t.prototype}</div>
        <div className="header"><h1>{t.header}</h1></div>

        <div className="chat-container glass" id="chat" ref={chatContainerRef}>
          {localMessages.map((msg, index) => (
            <div key={index} className={`msg ${msg.role}`}>
              <ReactMarkdown components={{ a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }} /> }}>
                {msg.content}
              </ReactMarkdown>
            </div>
          ))}
          {isLoading && (
            <div className="msg ai flex items-center gap-2">
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <span>{t.aiProcessing}</span>
            </div>
          )}
        </div>

        <div className="input-area glass">
          <input
            type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress}
            className="input-field" placeholder={isRecording ? t.listening : t.inputPlaceholder} autoComplete="off"
          />
          <button className={`btn ${isRecording ? 'btn-recording' : 'btn-secondary'}`} onClick={toggleRecording}>
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
