"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          displayName: displayName || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Registration failed");
      }

      const data = await response.json();

      // Store token in localStorage
      localStorage.setItem("token", data.access_token);

      // Redirect to editor
      router.push("/editor");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pixel-bg-primary px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-pixel-neon-pink to-pixel-neon-purple font-pixel text-2xl shadow-[0_0_20px_rgba(255,45,149,0.3)]">
              P
            </div>
            <div className="font-display text-2xl uppercase tracking-wider">
              PIXEL<span className="text-pixel-neon-pink">BOXX</span>
            </div>
          </Link>
          <h1 className="font-display text-4xl uppercase mb-2">Join PixelBoxx</h1>
          <p className="text-pixel-text-secondary">Create your unique PixelPage</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={32}
                className="w-full px-4 py-3 bg-pixel-bg-secondary border border-white/10 rounded-xl text-white placeholder-pixel-text-muted focus:outline-none focus:border-pixel-neon-cyan transition-colors"
                placeholder="cooluser123"
              />
              <p className="text-xs text-pixel-text-muted mt-1">
                3-32 characters, your unique handle
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-pixel-bg-secondary border border-white/10 rounded-xl text-white placeholder-pixel-text-muted focus:outline-none focus:border-pixel-neon-cyan transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-pixel-bg-secondary border border-white/10 rounded-xl text-white placeholder-pixel-text-muted focus:outline-none focus:border-pixel-neon-cyan transition-colors"
                placeholder="••••••••"
              />
              <p className="text-xs text-pixel-text-muted mt-1">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                Display Name <span className="text-pixel-text-muted">(optional)</span>
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={64}
                className="w-full px-4 py-3 bg-pixel-bg-secondary border border-white/10 rounded-xl text-white placeholder-pixel-text-muted focus:outline-none focus:border-pixel-neon-cyan transition-colors"
                placeholder="Your Name"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-pixel-text-secondary">
              Already have an account?{" "}
              <Link href="/login" className="text-pixel-neon-cyan hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
