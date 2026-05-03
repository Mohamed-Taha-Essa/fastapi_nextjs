"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If auth finishes loading and there is absolutely no user state, kick them back
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Show full screen loader while hydrating state
    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-zinc-950 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto w-full relative">
                <div className="mx-auto max-w-6xl w-full p-8">{children}</div>
            </main>
        </div>
    );
}
