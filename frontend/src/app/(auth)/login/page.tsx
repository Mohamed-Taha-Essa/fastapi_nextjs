"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("username", email); // OAuth2 expects username
            formData.append("password", password);

            const res = await api.post("/api/v1/auth/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            // After successful login, we need user details, assuming /api/v1/auth/me exists
            // If it doesn't, we will fake user object for now and wait for backend completion
            // We'll decode JWT or just assume structural baseline:
            const access_token = res.data.access_token;

            let userData = { id: "1", email };
            try {
                const userRes = await api.get("/api/v1/auth/me", {
                    headers: { Authorization: `Bearer ${access_token}` },
                });
                userData = userRes.data;
            } catch (err) {
                console.warn("/auth/me not ready, using fallback user data logging in");
            }

            login(access_token, userData);
        } catch (err: any) {
            setError(
                err.response?.data?.detail || "Invalid email or password. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
            <div className="w-full max-w-md bg-zinc-900 rounded-xl p-8 shadow-2xl border border-zinc-800">
                <h1 className="text-3xl font-bold mb-2 text-white">Welcome back.</h1>
                <p className="text-zinc-400 mb-8">Sign in to your AI Knowledge Copilot.</p>

                {error && (
                    <div className="bg-red-950/50 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                            placeholder="you@company.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white hover:bg-zinc-200 text-zinc-900 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="mt-6 text-center text-zinc-400 text-sm">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}
