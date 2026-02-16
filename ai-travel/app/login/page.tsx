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
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-blue-400">
                        Jogja Traveler AI
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Masuk untuk menyimpan riwayat chat dan merencanakan liburanmu.
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => handleLogin("google")}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-xl text-slate-900 bg-white hover:bg-slate-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                        ) : (
                            <i className="fa-brands fa-google mr-2 text-red-500"></i>
                        )}
                        Masuk dengan Google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-800 text-slate-500">Atau</span>
                        </div>
                    </div>

                    <button
                        onClick={() => signIn("credentials", { email: "user@example.com", password: "password", callbackUrl: "/" })}
                        className="w-full flex items-center justify-center px-4 py-3 border border-slate-600 text-base font-medium rounded-xl text-white bg-transparent hover:bg-slate-700 transition-all duration-200"
                    >
                        <i className="fa-solid fa-user-secret mr-2"></i>
                        Masuk sebagai Tamu (Demo)
                    </button>
                </div>
            </div>
        </div>
    );
}
