"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setIsLoading(true);

        try {
            // Backend expects UserCreate schema (email, password, etc.)
            await api.post("/api/v1/auth/register", {
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: password,
            });

            setSuccess(true);
            // Auto-redirect to login after short delay
            setTimeout(() => {
                router.push("/login");
            }, 2000);

        } catch (err: any) {
            setError(
                err.response?.data?.detail || "Registration failed. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
            <div className="w-full max-w-md bg-zinc-900 rounded-xl p-8 shadow-2xl border border-zinc-800">
                <h1 className="text-3xl font-bold mb-2 text-white">Join Copilot.</h1>
                <p className="text-zinc-400 mb-8">Create your private AI workspace.</p>

                {error && (
                    <div className="bg-red-950/50 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 p-3 rounded-lg mb-6 text-sm">
                        Registration successful! Redirecting to login...
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                                placeholder="Ada"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                                placeholder="Lovelace"
                            />
                        </div>
                    </div>

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
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full bg-white hover:bg-zinc-200 text-zinc-900 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="mt-6 text-center text-zinc-400 text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
