"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    Bot,
    Library,
    UploadCloud,
    LayoutDashboard,
    LogOut,
    User
} from "lucide-react";

const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Copilot Chat", href: "/chat", icon: Bot },
    { name: "Knowledge Base", href: "/knowledge-base", icon: Library },
    { name: "Upload Docs", href: "/upload", icon: UploadCloud },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col h-full flex-shrink-0">
            <div className="h-16 flex items-center px-6 border-b border-zinc-800">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 font-semibold text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">Copilot</span>
            </div>

            <div className="flex-1 py-6 px-4 space-y-1">
                <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Workspace
                </p>

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                    ? "bg-blue-600/10 text-blue-400 font-medium"
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                                }`}
                        >
                            <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-blue-500" : "text-zinc-500 group-hover:text-zinc-300 transition-colors"}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center px-3 py-3 rounded-lg bg-zinc-900 border border-zinc-800/50 mb-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mr-3">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{user?.first_name || 'User'}</p>
                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center px-3 py-2 text-sm text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
