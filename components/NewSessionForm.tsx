"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSessionForm({
  isPro,
  used,
  limit,
}: {
  isPro: boolean;
  used: number;
  limit: number;
}) {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const remaining = isPro ? null : limit - used;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobTitle, jobDescription }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/interview/${data.id}`);
    } else {
      const data = await res.json();
      if (data.error === "FREE_LIMIT_REACHED") {
        setError("You've used all your free sessions. Upgrade to Pro for unlimited access.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>{error}</span>
          {error.includes("free sessions") && (
            <Link href="/pricing" className="ml-3 underline text-purple-400 whitespace-nowrap">
              Upgrade →
            </Link>
          )}
        </div>
      )}

      <div>
        <label className="text-sm text-slate-400 mb-1 block">Job Title</label>
        <input
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          required
          placeholder="e.g. Senior React Developer"
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1 block">Job Description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          required
          rows={6}
          placeholder="Paste the full job description here — the more detail, the better the questions..."
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Generating questions...
            </>
          ) : (
            "Generate Interview Questions →"
          )}
        </button>

        {remaining !== null && (
          <span className="text-sm text-slate-500">
            {remaining} free session{remaining !== 1 ? "s" : ""} remaining
          </span>
        )}
      </div>
    </form>
  );
}
