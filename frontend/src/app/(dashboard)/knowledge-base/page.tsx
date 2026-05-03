"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Search, Loader2, FileText, Calendar, Network } from "lucide-react";

type Document = {
    id: string;
    title: string;
    source_type: string;
    created_at: string;
    version: number;
};

export default function KnowledgeBasePage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await api.get("/api/v1/docs");
                setDocuments(res.data || []);
            } catch (err) {
                console.error("Failed to fetch documents", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocs();
    }, []);

    const filteredDocs = documents.filter((d) =>
        (d.title || "Untitled").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Knowledge Base</h1>
                    <p className="text-zinc-400">View and manage the embedded documents your Copilot is actively trained on.</p>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-zinc-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-64 bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-950/50 text-xs uppercase text-zinc-500 border-b border-zinc-800">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-medium">Document Source</th>
                                <th scope="col" className="px-6 py-4 font-medium">Type</th>
                                <th scope="col" className="px-6 py-4 font-medium">Version / Chunks</th>
                                <th scope="col" className="px-6 py-4 font-medium">Ingested At</th>
                                <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Fetching knowledge graph...
                                    </td>
                                </tr>
                            )}

                            {!isLoading && filteredDocs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Network className="w-8 h-8 text-zinc-700 mb-3" />
                                            <p>No documents found embedded in your vector database.</p>
                                            <a href="/upload" className="text-blue-500 hover:text-blue-400 mt-2 hover:underline">Upload a document</a>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && filteredDocs.map((doc) => (
                                <tr key={doc.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-white flex items-center">
                                        <FileText className="w-4 h-4 text-blue-400 mr-3" />
                                        {doc.title || doc.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs font-semibold text-zinc-300">
                                            {doc.source_type || 'uploaded_pdf'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">v{doc.version || 1}</td>
                                    <td className="px-6 py-4 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-zinc-600" />
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-zinc-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                            View details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
