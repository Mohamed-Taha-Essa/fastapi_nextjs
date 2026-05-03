"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadStatus("idle");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setUploadStatus("idle");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setUploadStatus("idle");

        const formData = new FormData();
        formData.append("file", file); // Must match backend expects exactly

        try {
            const res = await api.post("/api/v1/ingest/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // Crucial for files
                },
            });

            // Based on our FastAPI task pattern, it returns tracking info
            console.log("Ingestion Started: ", res.data);
            setUploadStatus("success");
            setFile(null);

        } catch (err: any) {
            console.error(err);
            setUploadStatus("error");
            setErrorMessage(err.response?.data?.detail || "An error occurred during upload");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-white mb-2">Ingest Documents</h1>
            <p className="text-zinc-400 mb-8">
                Upload PDF or Markdown files to securely embed them into your private knowledge base.
            </p>

            {/* Drag & Drop Zone */}
            <div
                className="border-2 border-dashed border-zinc-700 bg-zinc-900/50 rounded-2xl p-12 text-center transition-colors hover:border-blue-500/50 hover:bg-zinc-900 group"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Click or drag a file here</h3>
                <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
                    We extract the text, chunk it semantically, and securely embed it into your Chroma vector space.
                </p>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.md,.txt"
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                >
                    Select File
                </button>
            </div>

            {/* Selected File State */}
            {file && (
                <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-zinc-800 rounded-lg text-blue-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white font-medium">{file.name}</p>
                            <p className="text-zinc-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium rounded-lg flex items-center transition-colors"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : "Upload & Emded"}
                    </button>
                </div>
            )}

            {/* Status Indicators */}
            {uploadStatus === "success" && (
                <div className="mt-6 bg-emerald-950/40 border border-emerald-500/50 p-4 rounded-xl flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-emerald-200 font-medium">Upload successful!</h4>
                        <p className="text-emerald-400/80 text-sm mt-1">
                            Your document has been passed to Celery workers for background chunking and vector embedded indexing. It will appear in your AI Copilot shortly.
                        </p>
                    </div>
                </div>
            )}

            {uploadStatus === "error" && (
                <div className="mt-6 bg-red-950/40 border border-red-500/50 p-4 rounded-xl flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-red-200 font-medium">Upload Failed</h4>
                        <p className="text-red-400/80 text-sm mt-1">{errorMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
