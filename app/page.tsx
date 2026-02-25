"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const VALID_EMAIL = "ahsanzahid.devb@gmail.com";
const VALID_PASSWORD = "ahsanzahid01";
const FLAG_KEY = "erp_logged_in";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      localStorage.setItem(FLAG_KEY, "true");
      router.replace("/dashboard");
    } else {
      setError("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-white flex items-center justify-center px-4">
      <div className="bg-[#0d1321] border border-white/10 rounded-2xl p-8 shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/30">
            ERP
          </div>
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-sm text-white/50 mt-1">Enter credentials to continue</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white"
            />
          </div>
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
