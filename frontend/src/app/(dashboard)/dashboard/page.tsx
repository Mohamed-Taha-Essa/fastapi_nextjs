"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CopyPlus, HardDrive, Cpu } from "lucide-react";
import api from "@/lib/api";

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ documents: 0, clusters: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Assume an endpoint like this gets built, default fallback for now
                const res = await api.get("/api/v1/docs");
                // Example logic: if it returns an array of docs
                setStats({ documents: res.data.length || 0, clusters: 4 });
            } catch (err) {
                console.warn("Could not fetch real stats yet");
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.first_name || "User"}.
            </h1>
            <p className="text-zinc-400 mb-8">
                Here is what’s happening in your private Copilot workspace today.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-start">
                    <div className="p-3 bg-blue-500/10 rounded-lg mr-4 border border-blue-500/20 text-blue-400">
                        <CopyPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-sm font-medium mb-1">Total Documents</p>
                        <h3 className="text-3xl font-bold text-white">{stats.documents}</h3>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-start">
                    <div className="p-3 bg-purple-500/10 rounded-lg mr-4 border border-purple-500/20 text-purple-400">
                        <HardDrive className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-sm font-medium mb-1">Vector Storage Used</p>
                        <h3 className="text-3xl font-bold text-white">12.4 MB</h3>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-start">
                    <div className="p-3 bg-emerald-500/10 rounded-lg mr-4 border border-emerald-500/20 text-emerald-400">
                        <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-sm font-medium mb-1">AI Interactions</p>
                        <h3 className="text-3xl font-bold text-white">243</h3>
                    </div>
                </div>
            </div>

            {/* Getting Started Context */}
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-2">Upload more data</h3>
                <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                    The more documents you feed into the AI, the smarter it becomes. Head over to the Knowledge Base to ingest PDFs or Markdown.
                </p>
                <a
                    href="/upload"
                    className="inline-flex items-center px-6 py-2.5 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors shadow-lg"
                >
                    <CopyPlus className="w-5 h-5 mr-2" />
                    Upload Files
                </a>
            </div>
        </div>
    );
}
