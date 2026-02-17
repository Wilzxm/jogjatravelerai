"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (provider: string) => {
        setIsLoading(true);
        await signIn(provider, { callbackUrl: "/" });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden text-slate-50">
            {/* Background matching globals.css */}
            <div className="absolute inset-0 w-full h-full bg-[#0f172a] -z-20"></div>
            <div className="absolute inset-0 w-full h-full -z-10" style={{
                backgroundImage: `
                    radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 25%),
                    radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 25%)
                `
            }}></div>

            {/* Glass Card */}
            <div className="relative w-full max-w-sm mx-4 p-8 rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl bg-white/5 flex flex-col gap-8">

                {/* Header Section */}
                <div className="text-center flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-2">
                        <i className="fa-solid fa-plane-up text-3xl text-white"></i>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-400 to-emerald-400">
                            Jogja Traveler AI
                        </h1>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mt-1">Smart Travel Companion</p>
                    </div>
                </div>

                {/* Login Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => handleLogin("google")}
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-white text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                    >
                        {isLoading ? (
                            <i className="fa-solid fa-circle-notch fa-spin text-blue-500"></i>
                        ) : (
                            <i className="fa-brands fa-google text-red-500 text-lg"></i>
                        )}
                        <span>Lanjutkan dengan Google</span>
                    </button>

                    <div className="flex items-center gap-3 text-xs text-slate-600 my-1">
                        <div className="h-px bg-white/10 flex-1"></div>
                        <span>ATAU</span>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <button
                        onClick={() => signIn("credentials", { email: "user@example.com", password: "password", callbackUrl: "/" })}
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-medium text-sm flex items-center justify-center gap-3 hover:bg-white/10 hover:text-white active:scale-[0.98] transition-all duration-200 backdrop-blur-sm"
                    >
                        <i className="fa-solid fa-user-secret"></i>
                        <span>Masuk sebagai Tamu</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-[10px] text-slate-600">
                        &copy; 2026 Jogja Traveler AI &bull; v2.1
                    </p>
                </div>
            </div>
        </div>
    );
}
